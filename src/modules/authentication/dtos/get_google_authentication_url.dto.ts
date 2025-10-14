import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetGoogleAuthenticationUrlSchema = z.object({
  callback_url: z.string().describe('Callback URL for OAuth redirect'),
});

export class GetGoogleAuthenticationUrlDto extends createZodDto(
  GetGoogleAuthenticationUrlSchema,
) {}
