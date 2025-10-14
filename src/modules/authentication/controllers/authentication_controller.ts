import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationAuthenticateWithGoogleHandler } from '@/modules/authentication/handlers/authentication_authenticate_with_google_handler';
import { AuthenticationDeleteAccountHandler } from '@/modules/authentication/handlers/authentication_delete_account_handler';
import { AuthenticationGetGoogleAuthenticationUrlHandler } from '@/modules/authentication/handlers/authentication_get_google_authentication_url';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { User } from '@/modules/authentication/decorators/user_decorator';
import { JwtAuthGuard } from '@/modules/authentication/guards/jwt.guard';
import { GetGoogleAuthenticationUrlDto } from '@/modules/authentication/dtos/get_google_authentication_url.dto';
import { AuthenticateWithGoogleCodeDto } from '@/modules/authentication/dtos/authenticate_with_google_code.dto';

@ApiTags('Authentication')
@Controller('/authentication')
export class AuthenticationController {
  constructor(
    private authenticate_with_google_handler: AuthenticationAuthenticateWithGoogleHandler,
    private delete_account_handler: AuthenticationDeleteAccountHandler,
    private get_google_authentication_url_handler: AuthenticationGetGoogleAuthenticationUrlHandler,
  ) {}

  @ApiOperation({ summary: 'Get Google OAuth authentication URL' })
  @Post('/get_google_authentication_url')
  getGoogleAuthenticationUrl(@Body() body: GetGoogleAuthenticationUrlDto) {
    return this.get_google_authentication_url_handler.execute({
      callback_url: body.callback_url,
    });
  }

  @ApiOperation({ summary: 'Authenticate with Google OAuth code' })
  @Post('/authenticate_with_google_code')
  async authenticate_with_google_code(
    @Body() body: AuthenticateWithGoogleCodeDto,
  ) {
    return this.authenticate_with_google_handler.execute({
      code: body.code,
      callback_url: body.callback_url,
      language: body.language,
    });
  }

  @ApiOperation({ summary: 'Get authenticated user information' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/get_authenticated_user_infos')
  async get_authenticated_user_infos(@User() user: UsersEntity) {
    return {
      id: user.id,
      email: user.email,
    };
  }

  @ApiOperation({ summary: 'Delete user account' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/delete_account')
  async delete_account(@User() user: UsersEntity) {
    await this.delete_account_handler.execute({
      user_id: user.id,
    });
  }
}
