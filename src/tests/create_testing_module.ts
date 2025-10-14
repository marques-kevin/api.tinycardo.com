import { Test, TestingModule } from '@nestjs/testing';
import { authentication_module_for_tests } from '@/modules/authentication/authentication_module';
import { cards_module_for_tests } from '@/modules/cards/cards_module';
import { decks_module_for_tests } from '@/modules/decks/decks_module';
import { sessions_module_for_tests } from '@/modules/sessions/sessions_module';
import { history_module_for_tests } from '@/modules/history/history_module';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersRepositoryInMemory } from '@/modules/authentication/repositories/users_repository_in_memory';

export async function create_testing_module() {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      JwtModule.register({
        secret: process.env.JWT_SECRET as string,
        signOptions: { expiresIn: '7d' },
      }),
    ],
    providers: [
      ...authentication_module_for_tests.repositories,
      ...authentication_module_for_tests.handlers,
      ...authentication_module_for_tests.services,
      ...cards_module_for_tests.repositories,
      ...cards_module_for_tests.handlers,
      ...decks_module_for_tests.repositories,
      ...decks_module_for_tests.handlers,
      ...history_module_for_tests.repositories,
      ...history_module_for_tests.handlers,
      ...sessions_module_for_tests.handlers,
      ...sessions_module_for_tests.services,
    ],
  }).compile();

  const entities = {
    get: module.get.bind(module) as TestingModule['get'],
    users_repository: module.get<UsersRepositoryInMemory>(UsersRepository),
  };

  return { ...entities };
}
