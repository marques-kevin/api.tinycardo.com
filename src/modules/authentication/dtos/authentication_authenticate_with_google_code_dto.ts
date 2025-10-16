import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthenticationAuthenticateWithGoogleCodeSchema = z.object({
  code: z.string().describe('Google OAuth authorization code'),
  callback_url: z.string().describe('Callback URL for OAuth redirect'),
  language: z.string().optional().describe('User preferred language'),
});

export class AuthenticationAuthenticateWithGoogleCodeDto extends createZodDto(
  AuthenticationAuthenticateWithGoogleCodeSchema,
) {}
