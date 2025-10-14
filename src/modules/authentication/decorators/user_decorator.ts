import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UsersEntity;

    return data ? user?.[data as keyof UsersEntity] : user;
  },
);
