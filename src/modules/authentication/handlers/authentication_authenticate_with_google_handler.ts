import { GoogleService } from '@/modules/authentication/services/google_service';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { AuthenticationUserToJwtHandler } from '@/modules/authentication/handlers/authentication_user_to_jwt_handler';

type authentication_dtos = {
  authenticate_with_google: {
    input: {
      code: string;
      callback_url: string;
      language?: string;
    };
    output: {
      access_token: string;
      id: string;
    };
  };
};

@Injectable()
export class AuthenticationAuthenticateWithGoogleHandler
  implements
    Handler<
      authentication_dtos['authenticate_with_google']['input'],
      authentication_dtos['authenticate_with_google']['output']
    >
{
  constructor(
    private readonly google_service: GoogleService,
    private readonly users_repository: UsersRepository,
    private readonly user_to_jwt_handler: AuthenticationUserToJwtHandler,
  ) {}

  private async get_user_or_create(email: string, language?: string) {
    const user = await this.users_repository.find_all({
      where: { email },
      take: 1,
    });

    if (user.length > 0) return user[0];

    return this.users_repository.save({
      id: v4(),
      email,
      language: language || 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async execute(
    params: authentication_dtos['authenticate_with_google']['input'],
  ): Promise<authentication_dtos['authenticate_with_google']['output']> {
    const response = await this.google_service.authenticate(params);

    const email = response.user.email;

    const user = await this.get_user_or_create(email, params.language);

    return this.user_to_jwt_handler.execute({
      id: user.id,
      email,
      created_at: user.created_at,
    });
  }
}
