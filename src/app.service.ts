import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class AppService {
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async getFeedback(frames: string[]): Promise<any> {
    try {
      const messages = [
        {
          role: 'user',
          content: [
            'Here is a candidate who is presenting something and wants to know their feedback, and how they could improve upon their posture and stance to engage audiences further. The feedback should be generated based on all the available frames, and not very particular ones.',
            ...frames.map(frame => ({ image: frame, resize: 768 }))
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
        }
      );

      return response.data;
    } catch (error) {
      return 'Something is not working';
    }
  }
}

