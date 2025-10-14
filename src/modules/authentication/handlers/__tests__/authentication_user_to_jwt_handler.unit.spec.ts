import { create_testing_module } from '@/tests/create_testing_module';
import { AuthenticationUserToJwtHandler } from '@/modules/authentication/handlers/authentication_user_to_jwt_handler';

describe('authentication_user_to_jwt', () => {
  let handler: AuthenticationUserToJwtHandler;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(AuthenticationUserToJwtHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return a JWT', async () => {
    const result = await handler.execute({
      email: 'test@test.com',
      id: 'mock-user-id',
      created_at: new Date(),
    });

    expect(result).toBeDefined();
    expect(result.access_token).toBeDefined();
    expect(result.id).toBeDefined();
  });
});
