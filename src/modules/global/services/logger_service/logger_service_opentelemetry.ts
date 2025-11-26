import { Injectable } from '@nestjs/common';
import { LogAttributes, SeverityNumber, logs } from '@opentelemetry/api-logs';
import { LoggerAttributes } from '@/modules/global/services/logger_service/logger_service';
import { LoggerService } from '@/modules/global/services/logger_service/logger_service';

@Injectable()
export class LoggerServiceOpenTelemetry extends LoggerService {
  private readonly logger = logs.getLogger('tinycardo-api');

  debug(message: string, attributes?: LoggerAttributes): void {
    this.emit({
      message,
      attributes,
      severityNumber: SeverityNumber.DEBUG,
      severityText: 'DEBUG',
    });
  }

  info(message: string, attributes?: LoggerAttributes): void {
    this.emit({
      message,
      attributes,
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
    });
  }

  warn(message: string, attributes?: LoggerAttributes): void {
    this.emit({
      message,
      attributes,
      severityNumber: SeverityNumber.WARN,
      severityText: 'WARN',
    });
  }

  error(message: string, attributes?: LoggerAttributes): void {
    this.emit({
      message,
      attributes,
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
    });
  }

  private emit(params: {
    message: string;
    attributes?: LoggerAttributes;
    severityNumber: SeverityNumber;
    severityText: string;
  }) {
    const formattedAttributes = this.formatAttributes(params.attributes);

    this.logger.emit({
      severityText: params.severityText,
      severityNumber: params.severityNumber,
      body: params.message,
      attributes: formattedAttributes,
    });
  }

  private formatAttributes(
    attributes?: LoggerAttributes,
  ): LogAttributes | undefined {
    if (!attributes) {
      return undefined;
    }

    return Object.entries(attributes).reduce<LogAttributes>(
      (acc, [key, value]) => {
        if (value === undefined) {
          return acc;
        }

        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          acc[key] = value;
          return acc;
        }

        if (value === null) {
          acc[key] = 'null';
          return acc;
        }

        if (value instanceof Date) {
          acc[key] = value.toISOString();
          return acc;
        }

        if (value instanceof Error) {
          acc[`${key}_message`] = value.message;
          if (value.stack) {
            acc[`${key}_stack`] = value.stack;
          }
          return acc;
        }

        if (Array.isArray(value)) {
          acc[key] = value.map((item) =>
            typeof item === 'string' ||
            typeof item === 'number' ||
            typeof item === 'boolean'
              ? item
              : JSON.stringify(item),
          );

          return acc;
        }

        acc[key] = JSON.stringify(value);
        return acc;
      },
      {},
    );
  }
}
