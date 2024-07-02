import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs-extra';
import Jimp from 'jimp';
import { videoFeedbackPrompt } from 'frameworks/utils/prompts/video.feedback';

import { ChatGPTService } from './gpt.service';
import {
  DEFAULT_FRAMES,
  DEFAULT_FRAMES_DIR,
  MODELS,
} from 'frameworks/utils/resources/app.constants';

@Injectable()
export class VideoAnalysisService {
  constructor(private chatGptService: ChatGPTService) {}

  private async getVideoDurationInFrames(
    inputVideoPath: string,
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputVideoPath, (err, metadata) => {
        if (err) {
          return reject(new Error(`Error reading metadata: ${err.message}`));
        }

        try {
          // Find the video stream
          const videoStream = metadata.streams.find(
            (stream) => stream.codec_type === 'video',
          );

          if (!videoStream) {
            throw new Error('No video stream found in the file');
          }

          const frameRateStr = videoStream.r_frame_rate;
          const durationStr = videoStream.duration;

          if (!frameRateStr || !durationStr) {
            throw new Error(
              'Frame rate or duration is not defined in metadata',
            );
          }

          const [num, denom] = frameRateStr.split('/');
          const fps = parseInt(num, 10) / parseInt(denom, 10);
          const duration = parseFloat(durationStr);

          if (isNaN(fps) || isNaN(duration)) {
            throw new Error('Failed to parse frame rate or duration');
          }

          const totalFrames = Math.floor(fps * duration);
          resolve(totalFrames);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  async extractFrames(
    inputVideoPath,
    numFrames = DEFAULT_FRAMES,
    outputDir = DEFAULT_FRAMES_DIR,
  ) {
    // Ensure the output directory exists
    await fs.ensureDir(outputDir);

    // Clear existing frames from the output directory
    await fs.emptyDir(outputDir);

    try {
      const totalFrames = await this.getVideoDurationInFrames(inputVideoPath);
      const interval = Math.floor(totalFrames / numFrames);

      console.log(`Total frames: ${totalFrames}, Interval: ${interval}`);

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

  private prepareFramesForGPT(
    base64Frames: string[],
  ): Array<{ image: string; resize: number }> {
    return base64Frames.map((frame) => ({ image: frame, resize: 768 }));
  }

  async getVisualFeedback(framesDir?: string): Promise<any> {
    framesDir = framesDir ? framesDir : DEFAULT_FRAMES_DIR;
    // Read all frame files from the directory
    const frameFiles = fs
      .readdirSync(framesDir)
      .map((file) => path.join(framesDir, file));

    // Resize all frames to a maximum dimension of 768 pixels
    const resizedFrames = await Promise.all(
      frameFiles.map(async (frame) => {
        const image = await Jimp.read(frame);
        image.scaleToFit(768, 768);
        const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        return imageBuffer.toString('base64');
      }),
    );
    try {
      const messages = [
        {
          role: 'user',
          content: [
            videoFeedbackPrompt,
            ...this.prepareFramesForGPT(resizedFrames),
          ],
        },
      ];

      const response = await this.chatGptService.chatCompletion(
        MODELS.GPT_4_OMNI,
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
