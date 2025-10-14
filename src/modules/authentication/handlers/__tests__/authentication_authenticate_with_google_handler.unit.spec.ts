import { create_testing_module } from '@/tests/create_testing_module';
import { AuthenticationAuthenticateWithGoogleHandler } from '@/modules/authentication/handlers/authentication_authenticate_with_google_handler';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';

describe('authentication_authenticate_with_google', () => {
  let handler: AuthenticationAuthenticateWithGoogleHandler;
  let users_repository: UsersRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(AuthenticationAuthenticateWithGoogleHandler);
    users_repository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should authenticate user, return a jwt and default language is en', async () => {
    const result = await handler.execute({
      code: 'any_code',
      callback_url: 'any_callback_url',
    });

    expect(result).toEqual({
      access_token: expect.any(String),
      id: expect.any(String),
    });

    const user = await users_repository.find_by_id(result.id);

    expect(user).toBeDefined();
    expect(user?.language).toBe('en');
  });

  it('should authenticate user and set the language to the language from the request', async () => {
    const result = await handler.execute({
      code: 'any_code',
      callback_url: 'any_callback_url',
      language: 'pt',
    });

    const user = await users_repository.find_by_id(result.id);

    expect(user).toBeDefined();
    expect(user?.language).toBe('pt');
  });
});
