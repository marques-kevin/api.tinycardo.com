import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class GlobalCatchAllExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCandidate =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const status = Number(statusCandidate);

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      response.status(status).json({
        statusCode: status,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: request?.url,
      });
      return;
    }

    if (exception instanceof HttpException) {
      response.status(status).json(exception.getResponse());
      return;
    }

    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request?.url,
    });
  }
}
