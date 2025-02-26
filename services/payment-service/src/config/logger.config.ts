import pino from 'pino';
import { config } from './app.config';

export const logger = pino({
  level: config.LOG_LEVEL || 'info',
  transport: config.NODE_ENV === 'production' 
    ? {
        target: 'pino-file',
        options: {
          destination: 'logs/payment-service.log',
          mkdir: true
        }
      }
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      },
  base: {
    env: config.NODE_ENV,
    service: config.SERVICE_NAME,
    version: process.env.npm_package_version
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.creditCard',
      'data.token',
      'password',
      'secret',
      'key'
    ],
    censor: '**REDACTED**'
  }
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection');
});

export const log = {
  fatal: (msg: string, obj?: object) => logger.fatal(obj || {}, msg),
  error: (msg: string, obj?: object) => logger.error(obj || {}, msg),
  warn: (msg: string, obj?: object) => logger.warn(obj || {}, msg),
  info: (msg: string, obj?: object) => logger.info(obj || {}, msg),
  debug: (msg: string, obj?: object) => logger.debug(obj || {}, msg),
  trace: (msg: string, obj?: object) => logger.trace(obj || {}, msg)
};
