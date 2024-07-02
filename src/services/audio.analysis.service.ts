import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import OpenAI from 'openai';
import { audioFeedbackPrompt } from 'frameworks/utils/prompts/audio.feedback';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { ChatGPTService } from './gpt.service';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_AUDIO_DIR,
  MODELS,
} from 'frameworks/utils/resources/app.constants';

@Injectable()
export class AudioAnalysisService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private chatGptService: ChatGPTService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extractAudioFromVideo(filePath: string) {
    // Extract the base name of the video file without the extension
    const videoFileName = path.basename(filePath, path.extname(filePath));
    // Create the output audio file path with the same base name
    const audioPath = path.join(DEFAULT_AUDIO_DIR, `${videoFileName}.mp3`);

    // Ensure the audio directory exists
    await fs.ensureDir(DEFAULT_AUDIO_DIR);

    // Clear existing frames from the output directory
    await fs.emptyDir(DEFAULT_AUDIO_DIR);

    await this.extractAudio(filePath, audioPath);

    return audioPath;
  }

  private async extractAudio(
    videoPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error(`Error during ffprobe: ${err.message}`);
          reject(err);
          return;
        }
        // Find the first audio stream
        const audioStream = metadata.streams.find(
          (stream) => stream.codec_type === 'audio',
        );
        if (!audioStream) {
          reject(new Error('No audio stream found in the video file'));
          return;
        }

        ffmpeg(videoPath)
          .output(outputPath)
          .noVideo()
          .audioCodec('libmp3lame')
          .on('end', () => {
            console.log('Audio extraction and compression finished.');
            resolve();
          })
          .on('error', (err) => {
            console.error(`Error during audio extraction: ${err.message}`);
            reject(err);
          })
          .run();
      });
    });
  }

  async analyzeAudio(audioFilePath: string): Promise<any> {
    try {
      // Step 1: Perform audio transcription using ChatGPT-Whisper
      const audioTranscription = await this.transcribeAudio(audioFilePath);

      // Step 2: Analyze the transcription using GPT-3.5 with a prompt
      const analysisResponse = await this.analyzeWithGPT35(audioTranscription);

      return analysisResponse;
    } catch (error) {
      console.error('Error analyzing audio:', error);
      throw error;
    }
  }
  async transcribeAudio(audioFilePath: string): Promise<string> {
    const transcription = await this.openai.audio.translations.create({
      file: fs.createReadStream(audioFilePath),
      model: MODELS.GPT_WHISPER_1,
    });
    return transcription.text;
  }

  private async analyzeWithGPT35(translation: string): Promise<any> {
    try {
      const messages = [
        {
          role: 'system',
          content: audioFeedbackPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `The audio transcription/translation is: ${translation}`,
            },
          ],
        },
      ];
      const response = await this.chatGptService.chatCompletion(
        MODELS.GPT_4_TURBO,
        messages,
      );
      return Promise.resolve(response);
    } catch (error) {
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
      return Promise.reject(error);
    }
  }
}
