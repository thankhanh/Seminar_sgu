import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Lấy thông tin user đang đăng nhập từ JWT payload.
 * @example
 * @Get('me')
 * getMe(@CurrentUser() user: { id: string; email: string; role: string }) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
