export abstract class GoogleService {
  abstract authenticate(params: {
    code: string;
    callback_url: string;
  }): Promise<{
    user: { email: string };
  }>;

  abstract get_authentication_url(params: { callback_url: string }): Promise<{
    url: string;
  }>;
}
