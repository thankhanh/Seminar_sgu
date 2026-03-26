import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any>;
}
