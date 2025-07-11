import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const ACCESS_TOKEN_KEY =
  import.meta.env.VITE_ACCESS_TOKEN_KEY || "access_token";
const REFRESH_TOKEN_KEY =
  import.meta.env.VITE_REFRESH_TOKEN_KEY || "refresh_token";
const NOAUTH_UNIQUE_KEY =
  import.meta.env.VITE_NOAUTH_UNIQUE_KEY || "noauth_unique";

class HttpService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL:
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
      timeout: 10000,
    });

    // Attach access token to every request
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        const noauth = localStorage.getItem(NOAUTH_UNIQUE_KEY);
        if (noauth) {
          config.headers["x-noauth-unique"] = noauth;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Handle 401 errors (optionally refresh token here)
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.data?.data?.tokens) {
          const accessToken = response.data.data.tokens.access;
          const refreshToken = response.data.data.tokens.refresh;

          this.setTokens(accessToken, refreshToken);
        }

        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Remove tokens on 401
          this.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  public setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }

  public clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  public get<T, R = AxiosResponse<T>>(url: string, config = {}): Promise<R> {
    return this.instance.get<T, R>(url, config);
  }

  public post<T, B = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: B,
    config = {},
  ): Promise<R> {
    return this.instance.post<T, R>(url, data, config);
  }

  // You can add other methods like put, delete, patch as needed
  // public put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: any): Promise<R> {
  //   return this.instance.put<T, R>(url, data, config);
  // }

  // public delete<T = any, R = AxiosResponse<T>>(url: string, config?: any): Promise<R> {
  //   return this.instance.delete<T, R>(url, config);
  // }
}

// Create an instance of the HttpService
export const httpService = new HttpService();

// Export the instance as default for convenience, or just the named export
export default httpService;
