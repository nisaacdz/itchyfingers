import { io, Socket } from "socket.io-client";
import { Participant, UserTyping } from "../types/request";

type ChallengeEventCallbacks = {
  onUpdateUser: (data: UserTyping) => void;
  onUpdateZone: (data: Participant[]) => void;
  onStartChallenge: (typingText: string) => void;
  onError: (error: Error) => void;
  onEntered: (data: Participant) => void;
  onDisconnect: (message: string) => void;
  onLeft: (data: Participant) => void;
};

class TypingSocketAPI {
  private socket: Socket | null = null;
  private challengeCallbacks: ChallengeEventCallbacks | null = null;

  public connect() {
    if (this.socket?.connected) return;

    if (!this.socket) {
      this.socket = io(
        process.env.REACT_APP_WS_URL || "http://localhost:4000",
        {
          withCredentials: true,
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1500,
        },
      );
      this.registerBaseHandlers();
    } else {
      this.socket.connect();
    }
  }

  private registerBaseHandlers() {
    this.socket?.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    this.socket?.on("connect_error", (err) => {
      if (err.message === "Authentication error") {
        window.location.href = "/login";
      }
    });

    this.socket?.on("disconnect", (reason) => {
      this.challengeCallbacks?.onDisconnect(reason.toString());
    });
  }

  public initializeChallengeHandlers(callbacks: ChallengeEventCallbacks) {
    this.socket?.off("user-update");
    this.socket?.off("room-update");
    this.socket?.off("start-challenge");
    this.socket?.off("entered");
    this.socket?.off("left");
    this.socket?.off("error");

    this.challengeCallbacks = callbacks;

    this.socket?.on("user-update", (data: UserTyping) => {
      this.challengeCallbacks?.onUpdateUser(data);
    });

    this.socket?.on("room-update", (data: Participant[]) => {
      this.challengeCallbacks?.onUpdateZone(data);
    });

    this.socket?.on("start-challenge", (text: string) => {
      this.challengeCallbacks?.onStartChallenge(text);
    });

    this.socket?.on("entered", (data: Participant) => {
      this.challengeCallbacks?.onEntered(data);
    });

    this.socket?.on("left", (data: Participant) => {
      this.challengeCallbacks?.onLeft(data);
    });

    this.socket?.on("error", (message: string) => {
      this.challengeCallbacks?.onError(new Error(message));
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
    this.challengeCallbacks = null;
  }

  public get isConnected() {
    return this.socket?.connected || false;
  }
}

export const typingSocketAPI = new TypingSocketAPI();
