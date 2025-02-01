import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import CircuitBreaker from "opossum";
import { ServiceEndpoint } from "../config/services.config";
import logger from "../utils/logger";

export class ServiceClient {
  private axiosInstance: AxiosInstance;
  private circuitBreaker: CircuitBreaker;

  constructor(private serviceConfig: ServiceEndpoint) {
    this.axiosInstance = axios.create({
      baseURL: serviceConfig.url,
      timeout: serviceConfig.timeout || 5000,
    });

    this.circuitBreaker = new CircuitBreaker(this.makeRequest.bind(this), {
      timeout: serviceConfig.timeout || 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    });

    this.setupCircuitBreakerEvents();
  }

  private setupCircuitBreakerEvents() {
    this.circuitBreaker.on("open", () => {
      logger.warn(
        `Circuit breaker opened for service: ${this.serviceConfig.url}`
      );
    });

    this.circuitBreaker.on("halfOpen", () => {
      logger.info(
        `Circuit breaker half-opened for service: ${this.serviceConfig.url}`
      );
    });

    this.circuitBreaker.on("close", () => {
      logger.info(
        `Circuit breaker closed for service: ${this.serviceConfig.url}`
      );
    });
  }

  private async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      logger.error(`Service request failed: ${error.message}`);
      throw error;
    }
  }

  public async get<T>(
    path: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.circuitBreaker.fire({ ...config, method: "GET", url: path });
  }

  public async post<T>(
    path: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.circuitBreaker.fire({
      ...config,
      method: "POST",
      url: path,
      data,
    });
  }

  public async put<T>(
    path: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.circuitBreaker.fire({
      ...config,
      method: "PUT",
      url: path,
      data,
    });
  }

  public async delete<T>(
    path: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.circuitBreaker.fire({ ...config, method: "DELETE", url: path });
  }
}
