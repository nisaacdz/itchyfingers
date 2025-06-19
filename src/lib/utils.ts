import { TournamentData, TournamentStatus } from "@/types/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatus(data: TournamentData): TournamentStatus {
  if (data.endedAt) return "ended";
  if (data.startedAt) return "started";
  return "upcoming";
}