import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Trans ByGagoos API',
      version: '1.0.0',
      status: 'running',
    };
  }
}
