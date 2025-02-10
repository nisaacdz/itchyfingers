import { ApiResponse } from "./types/request";

export function doNothing() {
  return;
}

const fetchChallenges = async ({ pageParam = 1, pageSize = 10 }) => {
  const response = await fetch(
    `/api/challenges?page=${pageParam}&pageSize=${pageSize}`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return (await response.json()) as ApiResponse;
};
