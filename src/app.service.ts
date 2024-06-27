import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import * as file from 'fs-extra';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async extractAudioFromVideo(filePath: string): Promise<any> {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const audioPath = path.join(uploadsDir, 'compressedAudio.mp3');

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    await this.extractAudio(filePath, audioPath);

    return audioPath;
  }
  async extractFrames(
    inputVideoPath: string,
    numFrames: number,
    outputDir: string,
  ): Promise<void> {
    // Ensure the output directory exists
    await file.ensureDir(outputDir);

    // Get the total number of frames in the video
    const getVideoDurationInFrames = (): Promise<number> => {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputVideoPath, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            const frameRate = metadata.streams[0].r_frame_rate.split('/');
            const fps = parseInt(frameRate[0], 10) / parseInt(frameRate[1], 10);
            const duration = parseFloat(metadata.streams[0].duration);
            const totalFrames = Math.floor(fps * duration);
            resolve(totalFrames);
          }
        });
      });
    };

    try {
      const totalFrames = await getVideoDurationInFrames();
      const interval = Math.floor(totalFrames / numFrames);

      return new Promise<void>((resolve, reject) => {
        ffmpeg(inputVideoPath)
          .on('end', () => {
            console.log('Frame extraction completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('Error during frame extraction:', err);
            reject(err);
          })
          .on('filenames', (filenames) => {
            console.log('Extracting frames:', filenames);
          })
          .output(path.join(outputDir, 'frame-%04d.png'))
          .outputOptions([
            `-vf select='not(mod(n\\,${interval}))'`, // Select frames based on the calculated interval
            `-vsync vfr`, // Variable frame rate to match the selected frames
            `-frames:v ${numFrames}`, // Limit the number of frames to extract
          ])
          .run();
      });
    } catch (error) {
      console.error('Error calculating total frames:', error);
    }
  }

  private async extractAudio(
    videoPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          this.logger.error(`Error during ffprobe: ${err.message}`);
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
            this.logger.log('Audio extraction and compression finished.');
            resolve();
          })
          .on('error', (err) => {
            this.logger.error(`Error during audio extraction: ${err.message}`);
            reject(err);
          })
          .run();
      });
    });
  }

  async getFeedback(frames: string[]): Promise<any> {
    try {
      const messages = [
        {
          role: 'user',
          content: [
            'Here is a candidate who is presenting something and wants to know their feedback, and how they could improve upon their posture and stance to engage audiences further. The feedback should be generated based on all the available frames, and not very particular ones.',
            ...frames.map((frame) => ({ image: frame, resize: 768 })),
          ],
        },
      ];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      return 'Something is not working';
    }
  }
}
