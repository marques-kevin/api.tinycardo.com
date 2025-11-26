import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  LogRecordProcessor,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

declare global {
  // eslint-disable-next-line no-var
  var __tinycardo_logger_provider__: LoggerProvider | undefined;
}

const alreadyInitialized = Boolean(globalThis.__tinycardo_logger_provider__);

if (!alreadyInitialized) {
  const serviceName =
    process.env.OTEL_SERVICE_NAME ??
    process.env.SERVICE_NAME ??
    'tinycardo-api';
  const serviceNamespace =
    process.env.OTEL_SERVICE_NAMESPACE ?? 'tinycardo-backend';
  const serviceEnvironment = process.env.NODE_ENV ?? 'development';
  const serviceVersion =
    process.env.OTEL_SERVICE_VERSION ??
    process.env.npm_package_version ??
    '0.0.0';

  const baseResource = defaultResource();
  const customResource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: serviceNamespace,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: serviceEnvironment,
  });
  const resource = baseResource.merge(customResource);

  const processors: LogRecordProcessor[] = [];

  const otlpEndpoint =
    process.env.OTLP_LOGS_ENDPOINT ??
    process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ??
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const headers =
    process.env.OTLP_LOGS_HEADERS ?? process.env.OTEL_EXPORTER_OTLP_HEADERS;

  if (otlpEndpoint) {
    processors.push(
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: otlpEndpoint,
          headers: headers ? parseHeaders(headers) : undefined,
        }),
      ),
    );
  }

  if (!otlpEndpoint || process.env.NODE_ENV !== 'production') {
    processors.push(
      new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()),
    );
  }

  const loggerProvider = new LoggerProvider({
    resource,
    processors,
  });

  logs.setGlobalLoggerProvider(loggerProvider);
  globalThis.__tinycardo_logger_provider__ = loggerProvider;

  const shutdown = async () => {
    try {
      await loggerProvider.shutdown();
    } catch (error) {
      console.error(
        'Failed to shutdown OpenTelemetry logger provider',
        error,
      );
    }
  };

  const registerShutdownHook = (signal: NodeJS.Signals | 'beforeExit') => {
    process.once(signal, () => {
      void shutdown();
    });
  };

  registerShutdownHook('beforeExit');
  registerShutdownHook('SIGINT');
  registerShutdownHook('SIGTERM');
}

function parseHeaders(raw: string): Record<string, string> {
  return raw.split(',').reduce<Record<string, string>>((acc, current) => {
    const [key, ...rest] = current.split('=');
    if (!key || rest.length === 0) {
      return acc;
    }

    acc[key.trim()] = rest.join('=').trim();

    return acc;
  }, {});
}


