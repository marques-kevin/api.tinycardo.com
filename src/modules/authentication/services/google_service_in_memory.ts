import { GoogleService } from '@/modules/authentication/services/google_service';

export class GoogleServiceInMemory extends GoogleService {
  async authenticate(): Promise<{
    user: { email: string };
  }> {
    return {
      user: {
        email: 'test@test.com',
      },
    };
  }

  async get_authentication_url(): Promise<{
    url: string;
  }> {
    return {
      url: 'https://accounts.google.com/o/oauth2/v2/auth',
    };
  }
}
