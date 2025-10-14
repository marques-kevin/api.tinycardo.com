import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { UsersRepositoryPostgres } from '@/modules/authentication/repositories/users_repository_postgres';
import { UsersRepositoryInMemory } from '@/modules/authentication/repositories/users_repository_in_memory';
import { JwtStrategy } from '@/modules/authentication/guards/jwt.strategy';
import { AuthenticationUserToJwtHandler } from '@/modules/authentication/handlers/authentication_user_to_jwt_handler';
import { AuthenticationAuthenticateWithGoogleHandler } from '@/modules/authentication/handlers/authentication_authenticate_with_google_handler';
import { AuthenticationDeleteAccountHandler } from '@/modules/authentication/handlers/authentication_delete_account_handler';
import { AuthenticationController } from '@/modules/authentication/controllers/authentication_controller';
import { AuthenticationGetGoogleAuthenticationUrlHandler } from '@/modules/authentication/handlers/authentication_get_google_authentication_url';
import { GoogleService } from '@/modules/authentication/services/google_service';
import { GoogleServiceInMemory } from '@/modules/authentication/services/google_service_in_memory';
import { GoogleServiceApi } from '@/modules/authentication/services/google_service_api';

export const authentication_module = {
  entities: [UsersEntity],
  controllers: [AuthenticationController],
  handlers: [
    JwtStrategy,
    AuthenticationUserToJwtHandler,
    AuthenticationAuthenticateWithGoogleHandler,
    AuthenticationDeleteAccountHandler,
    AuthenticationGetGoogleAuthenticationUrlHandler,
  ],
  repositories: [
    {
      provide: UsersRepository,
      useClass: UsersRepositoryPostgres,
    },
  ],
  services: [
    {
      provide: GoogleService,
      useClass: GoogleServiceApi,
    },
  ],
};

export const authentication_module_for_tests = {
  ...authentication_module,
  repositories: [
    {
      provide: UsersRepository,
      useClass: UsersRepositoryInMemory,
    },
  ],
  services: [
    {
      provide: GoogleService,
      useClass: GoogleServiceInMemory,
    },
  ],
};
