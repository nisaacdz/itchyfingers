// src/api/websocket.ts
import { io, Socket } from "socket.io-client";
import { Participant, UserTyping } from "../types/request";

type ChallengeEventCallbacks = {
  onUpdateUser: (data: UserTyping) => void;
  onUpdateZone: (data: Participant[]) => void;
  onError: (message: string) => void;
  onEntered: (data: Participant[]) => void;
  onDisconnect: () => void;
};

class WebSocketAPI {
  private socket: Socket | null = null;
  private challengeCallbacks: ChallengeEventCallbacks | null = null;

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_WS_URL || "http://localhost:4000", {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    this.registerBaseHandlers();
  }

  private registerBaseHandlers() {
    this.socket?.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    this.socket?.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      if (err.message === "Authentication error") {
        window.location.href = "/login";
      }
    });

    this.socket?.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      this.challengeCallbacks?.onDisconnect();
    });
  }

  public initializeChallengeHandlers(callbacks: ChallengeEventCallbacks) {
    this.challengeCallbacks = callbacks;
    
    this.socket?.on("participant-update", (data: UserTyping) => {
      this.challengeCallbacks?.onUpdateUser(data);
    });

    this.socket?.on("zone-update", (data: Participant[]) => {
      this.challengeCallbacks?.onUpdateZone(data);
    });

    this.socket?.on("error", (message: string) => {
      this.challengeCallbacks?.onError(message);
    });

    this.socket?.on("entered", (data: Participant[]) => {
      this.challengeCallbacks?.onEntered(data);
    });
  }

  public enterChallenge(challengeId: string) {
    if (!this.socket?.connected) {
      throw new Error("Not connected to WebSocket server");
    }
    this.socket.emit("enter_challenge", challengeId);
  }

  public sendTypingInput(character: string) {
    if (!this.socket?.connected) {
      throw new Error("Not connected to WebSocket server");
    }
    this.socket.emit("on_type", { character });
  }

  public leaveChallenge() {
    if (!this.socket?.connected) return;
    this.socket.emit("leave_challenge");
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public get isConnected() {
    return this.socket?.connected || false;
  }
}

export const websocketAPI = new WebSocketAPI();