import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: 'ok',
      message: '🚀 Vĩnh Khánh Audio Guide API đang chạy!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api',
    };
  }
}
