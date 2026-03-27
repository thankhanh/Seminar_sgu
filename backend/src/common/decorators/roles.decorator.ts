import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/**
 * Decorator chỉ định role được phép truy cập endpoint.
 * @example @Roles('admin')
 * @example @Roles('merchant', 'admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
