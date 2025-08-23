import { create } from "zustand";
import { socketService, ConnectOptions } from "@/api/socketService";
import {
  JoinSuccessPayload,
  ParticipantData,
  TournamentData,
  TournamentRoomMember,
  UpdateAllPayload,
  UpdateDataPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  UpdateMePayload,
} from "@/types/api";
import { predictCursorState } from "@/lib/typing";

// Define the shape of the cursor state
type CursorState = {
  currentPosition: number;
  correctPosition: number;
};

// Define the state structure
export interface RoomState {
  socketStatus: "connecting" | "connected" | "disconnected" | "failed";
  participants: Record<string, ParticipantData>;
  data: TournamentData | null;
  member: TournamentRoomMember | null;
  cursorHistory: CursorState[];
}

// Define the actions available on the store
export interface RoomActions {
  connect: (
    options: Omit<
      ConnectOptions,
      "onJoinSuccess" | "onDisconnect" | "onJoinFailure" | "onConnectError"
    >,
  ) => void;
  disconnect: () => void;
  onChar: (char: string) => void;
  _handleJoinSuccess: (payload: JoinSuccessPayload) => void;
  _handleUpdateAll: (payload: UpdateAllPayload) => void;
  _handleUpdateData: (payload: UpdateDataPayload) => void;
  _handleParticipantJoined: (payload: ParticipantJoinedPayload) => void;
  _handleParticipantLeft: (payload: ParticipantLeftPayload) => void;
  _handleUpdateMe: (payload: UpdateMePayload) => void;
}

const initialState: RoomState = {
  socketStatus: "disconnected",
  participants: {},
  data: null,
  member: null,
  cursorHistory: [],
};

export const useRoomStore = create<RoomState & RoomActions>((set, get) => ({
  ...initialState,

  // Connect to the socket and register all event listeners
  connect: ({ tournamentId, spectator, anonymous }) => {
    // Prevent multiple connections
    if (
      get().socketStatus === "connecting" ||
      get().socketStatus === "connected"
    ) {
      return;
    }

    set({ socketStatus: "connecting" });

    socketService.connect({
      tournamentId,
      spectator,
      anonymous,
      onJoinSuccess: (payload) => get()._handleJoinSuccess(payload),
      onDisconnect: () => set({ socketStatus: "disconnected" }),
      onJoinFailure: (payload) => {
        console.error("Join failed:", payload);
        set({ socketStatus: "failed" });
        // Here you can integrate a toast notification service call
      },
      onConnectError: (error) => {
        console.error("Connection error:", error);
        set({ socketStatus: "failed" });
      },
    });

    // Register listeners for real-time updates
    socketService.on("update:all", get()._handleUpdateAll);
    socketService.on("update:data", get()._handleUpdateData);
    socketService.on("participant:joined", get()._handleParticipantJoined);
    socketService.on("participant:left", get()._handleParticipantLeft);
    socketService.on("update:me", get()._handleUpdateMe);
  },

  disconnect: () => {
    socketService.disconnect();
    socketService.off("update:all");
    socketService.off("update:data");
    socketService.off("update:me");
    socketService.off("participant:joined");
    socketService.off("participant:left");
    set(initialState);
  },

  onChar: (char: string) => {
    set((state) => {
      const currentState = state.cursorHistory[
        state.cursorHistory.length - 1
      ] || { correctPosition: 0, currentPosition: 0 };
      const nextState = predictCursorState(
        currentState,
        char,
        state.data?.text || "",
      );
      const rid = state.cursorHistory.length;
      socketService.emit("type", { character: char, rid });

      return { cursorHistory: [...state.cursorHistory, nextState] };
    });
  },

  _handleJoinSuccess: (payload) => {
    const participants = payload.participants.reduce(
      (acc, p) => {
        acc[p.member.id] = p;
        return acc;
      },
      {} as Record<string, ParticipantData>,
    );

    set({
      socketStatus: "connected",
      participants,
      data: payload.data,
      member: payload.member,
      cursorHistory: [],
    });
  },

  _handleUpdateAll: (payload) => {
    if (!payload.updates.length) return;
    set((state) => {
      const newParticipants = { ...state.participants };
      payload.updates.forEach((update) => {
        if (newParticipants[update.memberId]) {
          newParticipants[update.memberId] = {
            ...newParticipants[update.memberId],
            ...update.updates,
          };
        }
      });
      return { participants: newParticipants };
    });
  },

  _handleUpdateData: (payload) => {
    if (!payload.updates) return;
    set((state) => {
      if (!state.data) return {};
      return {
        data: {
          ...state.data,
          ...payload.updates,
        },
      };
    });
  },

  _handleParticipantJoined: (payload) => {
    set((state) => ({
      participants: {
        ...state.participants,
        [payload.participant.member.id]: payload.participant,
      },
    }));
  },

  _handleParticipantLeft: (payload) => {
    set((state) => {
      const { [payload.memberId]: _, ...remainingParticipants } =
        state.participants;
      return { participants: remainingParticipants };
    });
  },

  _handleUpdateMe: (payload) => {
    const id = get().member?.id;

    const { rid, updates } = payload;
    const serverState = {
      correctPosition: updates.correctPosition,
      currentPosition: updates.currentPosition,
    };
    const cursorHistory = get().cursorHistory;
    const participants = get().participants;

    if (
      !cursorHistory[rid] ||
      cursorHistory[rid].correctPosition !== serverState.correctPosition ||
      cursorHistory[rid].currentPosition !== serverState.currentPosition
    ) {
      set({
        cursorHistory: [serverState],
        ...(id && {
          participants: {
            ...participants,
            [id]: {
              ...participants[id],
              ...serverState,
            },
          },
        }),
      });
    }
  },
}));

export const useIsParticipating = () =>
  useRoomStore(
    (state) => !!(state.member && state.participants[state.member.id]),
  );

export const useMyParticipantData = () =>
  useRoomStore((state) =>
    state.member ? state.participants[state.member.id] : null,
  );

export const useCursorState = () => {
  const state = useRoomStore();
  return (
    state.cursorHistory[state.cursorHistory.length - 1] || {
      currentPosition: 0,
      correctPosition: 0,
    }
  );
};
