import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'tinycardo',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'api',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || 'development',
  }),
);

const headers = {
  Authorization: `Bearer ${process.env.BETTER_STACK_TOKEN}`,
};

if (process.env.BETTER_STACK_TOKEN && process.env.BETTER_STACK_ENDPOINT) {
  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({
      url: `${process.env.BETTER_STACK_ENDPOINT}/v1/traces`,
      headers,
      compression: CompressionAlgorithm.GZIP,
    }),
    logRecordProcessors: [
      new SimpleLogRecordProcessor(
        new OTLPLogExporter({
          url: `${process.env.BETTER_STACK_ENDPOINT}/v1/logs`,
          headers,
          compression: CompressionAlgorithm.GZIP,
        }),
      ),
    ],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${process.env.BETTER_STACK_ENDPOINT}/v1/metrics`,
        headers,
        compression: CompressionAlgorithm.GZIP,
      }),
    }),
    instrumentations: [
      getNodeAutoInstrumentations(),
      new NestInstrumentation(),
    ],
  });

  sdk.start();
}
