import { GoogleService } from '@/modules/authentication/services/google_service';
import { Injectable } from '@nestjs/common';

type authentication_dtos = {
  get_google_authentication_url: {
    input: {
      callback_url: string;
    };
    output: {
      url: string;
    };
  };
};

@Injectable()
export class AuthenticationGetGoogleAuthenticationUrlHandler
  implements
    Handler<
      authentication_dtos['get_google_authentication_url']['input'],
      authentication_dtos['get_google_authentication_url']['output']
    >
{
  constructor(private readonly google_service: GoogleService) {}

  async execute(
    params: authentication_dtos['get_google_authentication_url']['input'],
  ): Promise<authentication_dtos['get_google_authentication_url']['output']> {
    const response = await this.google_service.get_authentication_url(params);

    return response;
  }
}
