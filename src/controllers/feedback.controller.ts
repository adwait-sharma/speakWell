import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { AudioAnalysisService } from '../services/audio.analysis.service';
import { VideoAnalysisService } from '../services/video.analysis.service';
import { MultipartInterceptor } from 'frameworks/middlewares/interceptors/multipart';

@Controller('/feedback')
export class FeedbackController {
  constructor(
    private readonly videoAnalysisService: VideoAnalysisService,
    private readonly audioAnalysisService: AudioAnalysisService,
  ) {}

  @Post(['/visual', '/video'])
  @UseInterceptors(MultipartInterceptor)
  async getVisualFeedBack(
    @Res() response: Response,
    @Body() body: any,
  ): Promise<any> {
    await this.videoAnalysisService.extractFrames(body.path);
    const videoFeedback = await this.videoAnalysisService.getVisualFeedback();
    return response.status(200).send(videoFeedback);
  }

  @Post('/audio')
  @UseInterceptors(MultipartInterceptor)
  async getAudioFeedBack(
    @Res() response: Response,
    @Body() body: any,
  ): Promise<any> {
    const audioPath = await this.audioAnalysisService.extractAudioFromVideo(
      body.path,
    );
    const audioFeedback =
      await this.audioAnalysisService.analyzeAudio(audioPath);
    return response.status(200).send(audioFeedback);
  }
}
