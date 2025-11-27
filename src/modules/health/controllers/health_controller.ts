import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { LoggerService } from '@/modules/global/services/logger_service/logger_service';

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(private readonly logger: LoggerService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Returns the health status of the API. Used by load balancers and monitoring systems.',
  })
  @ApiOkResponse({
    description: 'API is healthy and operational',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Health status of the API',
        },
        message: {
          type: 'string',
          example: 'Tinycardo API is running successfully',
          description: 'Human-readable status message',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-14T10:30:00.000Z',
          description: 'Timestamp of the health check',
        },
        uptime: {
          type: 'number',
          example: 3600,
          description: 'API uptime in seconds',
        },
      },
    },
  })
  getHealth() {
    this.logger.info('hello');

    return {
      status: 'ok',
      message: 'Tinycardo API is running successfully',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get('crash')
  @ApiOperation({
    summary: 'Crash test endpoint',
    description: 'Crashes the API. Used for testing crash reporting.',
  })
  crash() {
    throw new Error('Crash test');
  }
}
