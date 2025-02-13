// src/api/websocket.ts
import { io, Socket } from "socket.io-client";
import { Participant, UserTyping } from "../types/request";

type ChallengeEventCallbacks = {
  onUpdateUser: (data: UserTyping) => void;
  onUpdateZone: (data: Participant[]) => void;
  onStartChallenge: (typingText: string) => void;
  onError: (message: string) => void;
  onEntered: (data: Participant) => void;
  onDisconnect: () => void;
  onLeft: (data: Participant) => void;
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
      reconnectionAttempts: 3,
      reconnectionDelay: 1500,
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

    this.socket?.on("user-update", (data: UserTyping) => {
      this.challengeCallbacks?.onUpdateUser(data);
    });

    this.socket?.on("zone-update", (data: Participant[]) => {
      this.challengeCallbacks?.onUpdateZone(data);
    });

    this.socket?.on("start-challenge", (text: string) => {
      this.challengeCallbacks?.onStartChallenge(text);
    });

    this.socket?.on("error", (message: string) => {
      this.challengeCallbacks?.onError(message);
    });

    this.socket?.on("entered", (data: Participant) => {
      this.challengeCallbacks?.onEntered(data);
    });

    this.socket?.on("left", (data: Participant) => {
      this.challengeCallbacks?.onLeft(data);
    });
  }

  public enterChallenge(challengeId: string) {
    this.socket?.connect();
    this.socket?.emit("enter-challenge", challengeId);
  }

  public sendTypingInput(character: string) {
    this.socket?.connect();
    this.socket?.emit("on-type", { character });
  }

  public leaveChallenge() {
    if (!this.socket?.connected) return;
    this.socket.emit("leave-challenge");
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
