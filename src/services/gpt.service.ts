import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  GPT_API_URL,
  MAX_OUTPUT_TOKENS,
} from 'frameworks/utils/resources/app.constants';

@Injectable()
export class ChatGPTService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async chatCompletion(model: string, messages: any[]): Promise<string> {
    try {
      const response = await axios.post(
        GPT_API_URL,
        {
          model,
          messages,
          max_tokens: MAX_OUTPUT_TOKENS,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const jsonRes = JSON.parse(JSON.stringify(response.data.choices));
      return Promise.resolve(jsonRes[0].message.content);
    } catch (error) {
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
      return 'Something went wrong';
    }
  }
}
