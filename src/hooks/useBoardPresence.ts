import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { LocalCollaborator } from "./useLocalCollaborator";

interface PresenceCursor {
  ratioX: number | null;
  ratioY: number | null;
}

interface PresenceMessage {
  type: "join" | "presence" | "cursor" | "leave";
  user?: {
    id: string;
    name: string;
    color: string;
    avatar?: string;
  };
  cursor?: PresenceCursor | null;
  userId?: string;
}

interface PresenceParticipant {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  ratioX: number | null;
  ratioY: number | null;
  lastActive: number;
}

export interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  x: number;
  y: number;
  lastActive: number;
}

interface UseBoardPresenceOptions {
  boardId: string;
  currentUser: LocalCollaborator;
  containerRef: React.RefObject<HTMLDivElement>;
}

const CURSOR_TTL = 15000;

const clampRatio = (value: number) => Math.max(0, Math.min(1, value));

const isBrowser = typeof window !== "undefined";
const supportsBroadcastChannel = () =>
  typeof window !== "undefined" && typeof (window as Window & { BroadcastChannel?: typeof BroadcastChannel }).BroadcastChannel !== "undefined";

export const useBoardPresence = ({ boardId, currentUser, containerRef }: UseBoardPresenceOptions) => {
  const [participants, setParticipants] = useState<Record<string, PresenceParticipant>>({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const channelRef = useRef<BroadcastChannel | null>(null);
  const localCursorRef = useRef<PresenceCursor>({ ratioX: null, ratioY: null });

  useEffect(() => {
    setParticipants({});
  }, [boardId, currentUser.id]);

  const updateContainerSize = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setContainerSize({ width: rect.width, height: rect.height });
  }, [containerRef]);

  useEffect(() => {
    if (!isBrowser || !supportsBroadcastChannel()) return;
    updateContainerSize();
    const handleResize = () => updateContainerSize();
    window.addEventListener("resize", handleResize);

    let observer: ResizeObserver | undefined;
    if ("ResizeObserver" in window && containerRef.current) {
      observer = new ResizeObserver(() => updateContainerSize());
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [containerRef, updateContainerSize]);

  const sendMessage = useCallback((message: PresenceMessage) => {
    if (!isBrowser || !supportsBroadcastChannel()) return;
    if (!channelRef.current) return;
    try {
      channelRef.current.postMessage(message);
    } catch (error) {
      console.warn("Impossible d'envoyer le message de présence", error);
    }
  }, []);

  const broadcastPresence = useCallback(() => {
    sendMessage({
      type: "presence",
      user: currentUser,
      cursor: localCursorRef.current,
    });
  }, [currentUser, sendMessage]);

  useEffect(() => {
    if (!isBrowser || !supportsBroadcastChannel()) return;
    if (!boardId) return;

    const channelName = `canvas-board:${boardId}`;
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent<PresenceMessage>) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "leave" && data.userId) {
        setParticipants(prev => {
          if (!prev[data.userId!]) return prev;
          const next = { ...prev };
          delete next[data.userId!];
          return next;
        });
        return;
      }

      if (!data.user || data.user.id === currentUser.id) return;

      const sanitizedUser = {
        id: data.user.id,
        name: data.user.name,
        color: data.user.color,
        avatar: data.user.avatar ?? "",
      };

      if (data.type === "cursor" && data.userId) {
        setParticipants(prev => {
          const existing = prev[data.userId!];
          if (!existing) return prev;
          const cursor = data.cursor ?? { ratioX: null, ratioY: null };
          return {
            ...prev,
            [data.userId!]: {
              ...existing,
              ratioX: cursor.ratioX,
              ratioY: cursor.ratioY,
              lastActive: Date.now(),
            },
          };
        });
        return;
      }

      const cursor = data.cursor ?? { ratioX: null, ratioY: null };
      setParticipants(prev => ({
        ...prev,
        [sanitizedUser.id]: {
          ...sanitizedUser,
          ratioX: cursor.ratioX,
          ratioY: cursor.ratioY,
          lastActive: Date.now(),
        },
      }));

      if (data.type === "join") {
        broadcastPresence();
      }
    };

    channel.addEventListener("message", handleMessage);

    const handleBeforeUnload = () => {
      sendMessage({ type: "leave", userId: currentUser.id });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        broadcastPresence();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    // Notify others of our presence immediately
    sendMessage({
      type: "join",
      user: currentUser,
      cursor: localCursorRef.current,
    });
    broadcastPresence();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
      sendMessage({ type: "leave", userId: currentUser.id });
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [boardId, currentUser, broadcastPresence, sendMessage]);

  useEffect(() => {
    if (!isBrowser || !supportsBroadcastChannel()) return;
    const interval = window.setInterval(() => {
      setParticipants(prev => {
        const now = Date.now();
        let changed = false;
        const next: Record<string, PresenceParticipant> = {};
        for (const participant of Object.values(prev)) {
          if (now - participant.lastActive <= CURSOR_TTL) {
            next[participant.id] = participant;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, CURSOR_TTL / 3);

    return () => window.clearInterval(interval);
  }, []);

  const updateCursor = useCallback((clientX: number, clientY: number) => {
    if (!isBrowser) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const ratioX = clampRatio((clientX - rect.left) / rect.width);
    const ratioY = clampRatio((clientY - rect.top) / rect.height);

    localCursorRef.current = { ratioX, ratioY };
    sendMessage({
      type: "cursor",
      userId: currentUser.id,
      cursor: localCursorRef.current,
    });
  }, [containerRef, currentUser.id, sendMessage]);

  const hideCursor = useCallback(() => {
    localCursorRef.current = { ratioX: null, ratioY: null };
    sendMessage({
      type: "cursor",
      userId: currentUser.id,
      cursor: null,
    });
  }, [currentUser.id, sendMessage]);

  const remoteParticipants = useMemo(
    () =>
      Object.values(participants).sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
      ),
    [participants]
  );

  const remoteCursors = useMemo<RemoteCursor[]>(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return [];
    return remoteParticipants
      .filter(participant => participant.ratioX !== null && participant.ratioY !== null)
      .map(participant => ({
        id: participant.id,
        name: participant.name,
        color: participant.color,
        avatar: participant.avatar,
        x: (participant.ratioX ?? 0) * containerSize.width,
        y: (participant.ratioY ?? 0) * containerSize.height,
        lastActive: participant.lastActive,
      }));
  }, [remoteParticipants, containerSize]);

  return {
    remoteParticipants,
    remoteCursors,
    updateCursor,
    hideCursor,
  };
};

