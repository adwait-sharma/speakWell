import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { MultipartInterceptor } from 'middlewares/interceptors/multipart';

@Controller('getFeedback')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @UseInterceptors(MultipartInterceptor)
  async getFeedBack(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: any,
  ): Promise<any> {
    const res2 = await this.appService.extractFrames(
      body.path,
      200,
      './frames',
    );
    const res = await this.appService.extractAudioFromVideo(body.path);
    console.table(res);
    return response.status(200).send(body);
  }
}
