import { Module } from '@nestjs/common';
import { FeedbackController } from './controllers/feedback.controller';
import { AudioAnalysisService } from './services/audio.analysis.service';
import { ConfigModule } from '@nestjs/config';
import { VideoAnalysisService } from './services/video.analysis.service';
import { ChatGPTService } from './services/gpt.service';
import { moduleConfig } from 'frameworks/utils/config/env';

@Module({
  imports: [ConfigModule.forRoot(moduleConfig)],
  controllers: [FeedbackController],
  providers: [VideoAnalysisService, AudioAnalysisService, ChatGPTService],
})
export class AppModule {}
