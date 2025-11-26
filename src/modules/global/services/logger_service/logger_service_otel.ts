import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/modules/global/services/logger_service/logger_service';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

@Injectable()
export class LoggerServiceOtel extends LoggerService {
  private readonly logger = logs.getLogger('tinycardo-api');

  private emit(params: {
    severityNumber: SeverityNumber;
    severityText: string;
    message: string;
    attributes?: Record<string, any>;
  }): void {
    this.logger.emit({
      severityNumber: params.severityNumber,
      severityText: params.severityText,
      body: params.message,
      attributes: params.attributes,
    });
  }

  info(message: string, attributes?: Record<string, any>): void {
    this.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'info',
      message,
      attributes,
    });
  }

  error(message: string, attributes?: Record<string, any>): void {
    this.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'error',
      message,
      attributes,
    });
  }

  debug(message: string, attributes?: Record<string, any>): void {
    this.emit({
      severityNumber: SeverityNumber.DEBUG,
      severityText: 'debug',
      message,
      attributes,
    });
  }

  warn(message: string, attributes?: Record<string, any>): void {
    this.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: 'warn',
      message,
      attributes,
    });
  }
}
