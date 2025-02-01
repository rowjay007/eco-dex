import { config } from "dotenv";
import winston from "winston";

config();

const environment = process.env.NODE_ENV || "development";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.stack ? "\n" + info.stack : ""
      }`
  )
);

const developmentTransports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    ),
  }),
];

const productionTransports = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.uncolorize(), format),
  }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: format,
  }),
  new winston.transports.File({
    filename: "logs/combined.log",
    format: format,
  }),
];

const logger = winston.createLogger({
  level: environment === "development" ? "debug" : "info",
  levels,
  transports:
    environment === "development"
      ? developmentTransports
      : productionTransports,
});

export default logger;
