import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any) {
    if (info) {
      this.logger.debug(`JWT auth info: ${info?.message ?? info}`);
    }
    if (err || !user) throw new UnauthorizedException('Vui lòng đăng nhập');
    return user;
  }
}
