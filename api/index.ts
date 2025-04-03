import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import config from "@/config";
import { ApiResponse } from "@/types/request";

class ApiClient {
  private instance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.instance = axiosInstance;

    this.instance.interceptors.request.use((cfg) => {
      cfg.withCredentials = true;
      return cfg;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          window.sessionStorage.setItem("returnTo", window.location.pathname);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T = unknown>(
    url: string,
    query?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(url, {
        params: query,
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          response.data ? (response.data as string) : "An error occurred",
        );
      }
      return { result: response.data, error: null };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T = unknown, D = unknown>(
    url: string,
    data: D,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.post(url, data);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          response.data ? (response.data as string) : "An error occurred",
        );
      }
      return { result: response.data, error: null };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T = unknown, D = unknown>(
    url: string,
    data: D,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.patch(url, data);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          response.data ? (response.data as string) : "An error occurred",
        );
      }
      return { result: response.data, error: null };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T = unknown, D = unknown>(
    url: string,
    data: D,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.put(url, data);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          response.data ? (response.data as string) : "An error occurred",
        );
      }
      return { result: response.data, error: null };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    console.log(error);
    return {
      result: null,
      error: this.resolveAxiosError(error),
    };
  }

  private resolveAxiosError(error: unknown, defaultMsg?: string): string {
    const axiosError = error as AxiosError<{ error?: string; msg?: string }>;
    return (
      axiosError.message ??
      axiosError?.response?.data?.error ??
      axiosError?.response?.data?.msg ??
      defaultMsg ??
      "An error occurred"
    );
  }
}

const axiosInstance = axios.create({
  baseURL: config.apps.core,
  headers: {
    "x-client": config.client,
  },
  withCredentials: true,
});

const Api = new ApiClient(axiosInstance);
export default Api;
