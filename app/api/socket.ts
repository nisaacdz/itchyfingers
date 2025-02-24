import { io, Socket } from "socket.io-client";
import { Participant, StartChallenge } from "../types/request";

type ChallengeEventCallbacks = {
  onUpdateParticipant: (data: Participant) => void;
  onStartChallenge: (startData: StartChallenge) => void;
  onError: (error: Error) => void;
  onEntered: (data: Participant) => void;
  onDisconnect: (message: string) => void;
  onLeft: (data: Participant) => void;
};

class TypingSocketAPI {
  private socket: Socket | null = null;
  private challengeCallbacks: ChallengeEventCallbacks | null = null;

  connect() {
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

  public initialize(challengeId: string, callbacks: ChallengeEventCallbacks) {
    this.connect();
    this.socket?.off("user-update");
    this.socket?.off("start-challenge");
    this.socket?.off("entered");
    this.socket?.off("left");
    this.socket?.off("error");

    this.challengeCallbacks = callbacks;

    this.socket?.on("user-update", (data: Participant) => {
      this.challengeCallbacks?.onUpdateParticipant(data);
    });

    this.socket?.on("start-challenge", (data: StartChallenge) => {
      this.challengeCallbacks?.onStartChallenge(data);
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

    this.socket?.emit("enter-challenge", { challengeId });
  }

  public sendTypingInput(character: string) {
    this.socket?.emit("on-type", { character });
  }

  public leaveChallenge() {
    this.socket?.emit("leave-challenge");
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
