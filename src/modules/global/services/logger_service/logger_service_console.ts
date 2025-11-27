import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/modules/global/services/logger_service/logger_service';

@Injectable()
export class LoggerServiceConsole extends LoggerService {
  info(message: string, attributes?: Record<string, any>): void {
    console.log(message, attributes);
  }

  error(message: string, attributes?: Record<string, any>): void {
    console.error(message, attributes);
  }

  debug(message: string, attributes?: Record<string, any>): void {
    console.debug(message, attributes);
  }

  warn(message: string, attributes?: Record<string, any>): void {
    console.warn(message, attributes);
  }
}
