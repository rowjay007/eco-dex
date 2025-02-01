import { config } from "dotenv";

config();

const appConfig = {
  serviceName: process.env.SERVICE_NAME || "user-service",
  port: parseInt(process.env.PORT || "8080", 10),
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
};

export default appConfig;
