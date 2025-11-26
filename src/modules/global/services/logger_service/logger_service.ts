export abstract class LoggerService {
  abstract info(message: string, attributes?: Record<string, any>): void;
  abstract error(message: string, attributes?: Record<string, any>): void;
  abstract debug(message: string, attributes?: Record<string, any>): void;
  abstract warn(message: string, attributes?: Record<string, any>): void;
}
