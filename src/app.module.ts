import { Module } from '@nestjs/common';
import { authentication_module } from '@/modules/authentication/authentication_module';
import { cards_module } from '@/modules/cards/cards_module';
import { decks_module } from '@/modules/decks/decks_module';
import { sessions_module } from '@/modules/sessions/sessions_module';
import { history_module } from '@/modules/history/history_module';
import { health_module } from '@/modules/health/health_module';
import { streak_module } from '@/modules/streak/streak_module';
import { lessons_module } from '@/modules/lessons/lessons_module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { get_database_config } from '@/config/get_database_config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { GLOBAL_QUEUES_CONSTANTS } from '@/modules/global/constants/global_queues_contants';
import { global_module } from '@/modules/global/global_module';

export function get_app_imports() {
  return [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: '7d' },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!, 10),
        password: process.env.REDIS_PASSWORD!,
      },
    }),
    BullModule.registerQueue({
      name: GLOBAL_QUEUES_CONSTANTS['text_to_speech'],
    }),
    ...get_database_config().map((config) => {
      return TypeOrmModule.forRoot({
        ...config,
        entities: [
          ...authentication_module.entities,
          ...cards_module.entities,
          ...decks_module.entities,
          ...history_module.entities,
          ...streak_module.entities,
          ...lessons_module.entities,
        ],
      });
    }),
    TypeOrmModule.forFeature([
      ...authentication_module.entities,
      ...cards_module.entities,
      ...decks_module.entities,
      ...history_module.entities,
      ...streak_module.entities,
      ...lessons_module.entities,
    ]),
  ];
}

export function get_app_controllers() {
  return [
    ...authentication_module.controllers,
    ...cards_module.controllers,
    ...decks_module.controllers,
    ...history_module.controllers,
    ...sessions_module.controllers,
    ...health_module.controllers,
    ...streak_module.controllers,
    ...lessons_module.controllers,
  ];
}

export function get_app_providers() {
  return [
    ...global_module.services,
    ...authentication_module.repositories,
    ...authentication_module.services,
    ...authentication_module.handlers,
    ...cards_module.repositories,
    ...cards_module.handlers,
    ...decks_module.repositories,
    ...decks_module.handlers,
    ...history_module.repositories,
    ...history_module.handlers,
    ...sessions_module.services,
    ...sessions_module.handlers,
    ...streak_module.repositories,
    ...streak_module.handlers,
    ...lessons_module.repositories,
    ...lessons_module.handlers,
  ];
}

@Module({
  imports: [...get_app_imports()],
  controllers: [...get_app_controllers()],
  providers: [...get_app_providers()],
})
export class AppModule {}
