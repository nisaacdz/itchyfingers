import axios from "axios";
import config from "../config";
import { redirect } from "next/navigation";

export const Axios = axios.create({
  baseURL: config.apps.core,
  headers: {
    "x-client": config.client,
  },
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

Axios.interceptors.response.use(
  (values) => {
    return values;
  },
  (error) => {
    if (error?.status === "401") {
      redirect("/auth/login");
      return;
    }
    return error;
  },
);

export function resolveAxiosError(request: any, defaultMsg?: string) {
  return (
    request?.response?.data?.error ??
    request?.error?.msg ??
    defaultMsg ??
    "An error occurred"
  );
}

export function getQueryStringFromUrl(url: string) {
  const [_, query] = url.split("?");
  return query ?? null;
}
