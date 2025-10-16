import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthenticationGetGoogleAuthenticationUrlSchema = z.object({
  callback_url: z.string().describe('Callback URL for OAuth redirect'),
});

export class AuthenticationGetGoogleAuthenticationUrlDto extends createZodDto(
  AuthenticationGetGoogleAuthenticationUrlSchema,
) {}
