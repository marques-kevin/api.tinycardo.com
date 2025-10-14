import { Module } from '@nestjs/common';
import { authentication_module } from '@/modules/authentication/authentication_module';
import { cards_module } from '@/modules/cards/cards_module';
import { decks_module } from '@/modules/decks/decks_module';
import { sessions_module } from '@/modules/sessions/sessions_module';
import { history_module } from '@/modules/history/history_module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { get_database_config } from '@/config/get_database_config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: '7d' },
    }),
    ...get_database_config().map((config) => {
      return TypeOrmModule.forRoot({
        ...config,
        entities: [
          ...authentication_module.entities,
          ...cards_module.entities,
          ...decks_module.entities,
          ...history_module.entities,
        ],
      });
    }),
    TypeOrmModule.forFeature([
      ...authentication_module.entities,
      ...cards_module.entities,
      ...decks_module.entities,
      ...history_module.entities,
    ]),
  ],
  controllers: [
    ...authentication_module.controllers,
    ...cards_module.controllers,
    ...decks_module.controllers,
    ...history_module.controllers,
    ...sessions_module.controllers,
  ],
  providers: [
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
  ],
})
export class AppModule {}
