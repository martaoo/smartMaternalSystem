import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Smart Maternal Backend API is running',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
      },
    };
  }
}
