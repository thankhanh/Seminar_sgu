import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter.
 * Chuẩn hóa tất cả lỗi về format:
 * { success: false, error: { code, message } }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống, vui lòng thử lại sau';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message ?? resObj.error ?? message;
        // class-validator trả mảng lỗi
        if (Array.isArray(resObj.message)) {
          message = resObj.message.join('; ');
        }
      }
      code = exception.constructor.name.replace('Exception', '').toUpperCase();
    } else {
      this.logger.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      success: false,
      error: { code, message },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
