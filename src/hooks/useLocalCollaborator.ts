import { useEffect, useState } from "react";

export interface LocalCollaborator {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

const STORAGE_KEY = "board:current-collaborator";

const FALLBACK_COLLABORATOR: LocalCollaborator = {
  id: "local",
  name: "Vous",
  color: "#6366F1",
  avatar: "",
};

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const useLocalCollaborator = () => {
  const [collaborator, setCollaborator] = useState<LocalCollaborator>(FALLBACK_COLLABORATOR);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalCollaborator;
        if (parsed?.id && parsed?.name && parsed?.color) {
          setCollaborator({ avatar: "", ...parsed });
          return;
        }
      }
    } catch (error) {
      console.warn("Impossible de récupérer le collaborateur local", error);
    }

    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `local-${Date.now()}`;
    const newCollaborator: LocalCollaborator = {
      id,
      name: `Invité ${Math.floor(1000 + Math.random() * 9000)}`,
      color: getRandomColor(),
      avatar: "",
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newCollaborator));
    } catch (error) {
      console.warn("Impossible d'enregistrer le collaborateur local", error);
    }

    setCollaborator(newCollaborator);
  }, []);

  return collaborator;
};

