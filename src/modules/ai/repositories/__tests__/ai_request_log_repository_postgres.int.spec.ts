import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AiRequestLogEntity } from '@/modules/ai/entities/ai_request_log_entity';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { AiRequestLogRepositoryPostgres } from '@/modules/ai/repositories/ai_request_log_repository_postgres';
import { AiRequestLogRepository } from '@/modules/ai/repositories/ai_request_log_repository';

describe('AiRequestLogRepositoryPostgres', () => {
  let repository: AiRequestLogRepositoryPostgres;
  let module: TestingModule;
  let user_id: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5430,
          username: 'postgres',
          password: 'postgres',
          database: 'postgres',
          entities: [UsersEntity, AiRequestLogEntity],
        }),
        TypeOrmModule.forFeature([UsersEntity, AiRequestLogEntity]),
      ],
      providers: [
        {
          provide: AiRequestLogRepository,
          useClass: AiRequestLogRepositoryPostgres,
        },
      ],
    }).compile();

    repository = module.get(AiRequestLogRepository);

    const users_repository = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
    const test_user: UsersEntity = {
      id: uuidv4(),
      email: `${uuidv4()}@test.com`,
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await users_repository.save(test_user);

    user_id = test_user.id;
  });

  afterAll(async () => {
    await module.close();
  });

  it('should save an AI request log and retrieve it correctly', async () => {
    const log_entity: AiRequestLogEntity = {
      id: uuidv4(),
      user_id,
      handler_name: 'TestHandler',
      model: 'gpt-4.1-mini',
      input_tokens: 100,
      output_tokens: 50,
      estimated_cost_usd: '0.000075',
      process_duration_ms: 1500,
      status: 'success',
      error_message: null,
      created_at: new Date(),
    };

    await repository.save(log_entity);
    const result = await repository.find_by_id(log_entity.id);

    expect(result).toEqual(log_entity);
  });
});
