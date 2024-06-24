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
  getFeedBack(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: any,
  ): any {
    console.log(body);
    return response.status(200).send(body);
  }
}
