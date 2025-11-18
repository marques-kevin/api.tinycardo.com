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
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';
import { TextToSpeechServiceGemini } from '@/modules/global/services/text_to_speech_service/text_to_speech_service_gemini';
import { CloudflareService } from '@/modules/global/services/cloudflare_service/cloudflare_service';
import { CloudflareServiceApi } from '@/modules/global/services/cloudflare_service/cloudflare_service_api';

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
    {
      provide: TextToSpeechService,
      useClass: TextToSpeechServiceGemini,
    },
    {
      provide: CloudflareService,
      useClass: CloudflareServiceApi,
    },
  ];
}

@Module({
  imports: [...get_app_imports()],
  controllers: [...get_app_controllers()],
  providers: [...get_app_providers()],
})
export class AppModule {}
