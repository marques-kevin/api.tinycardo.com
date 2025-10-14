import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleService } from '@/modules/authentication/services/google_service';

const SCOPES = ['https://www.googleapis.com/auth/userinfo.email'];

@Injectable()
export class GoogleServiceApi extends GoogleService {
  async get_authentication_url(params: { callback_url: string }) {
    const url = this.get_auth_client(params.callback_url).generateAuthUrl({
      scope: SCOPES,
    });

    return { url };
  }

  async authenticate(params: {
    callback_url: string;
    code: string;
  }): ReturnType<GoogleService['authenticate']> {
    try {
      const authClient = this.get_auth_client(params.callback_url);
      const { tokens } = await authClient.getToken(params.code);
      const infos = await authClient.getTokenInfo(
        tokens.access_token as string,
      );

      return {
        user: {
          email: infos.email as string,
        },
      };
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  private get_auth_client(callback_url: string) {
    return new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: callback_url,
    });
  }
}
