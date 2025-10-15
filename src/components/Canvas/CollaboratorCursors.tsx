import { useEffect, useState } from "react";

import type { RemoteCursor } from "@/hooks/useBoardPresence";

interface CollaboratorCursorsProps {
  cursors: RemoteCursor[];
}

const getOpacityFromActivity = (lastActive: number) => {
  const delta = Date.now() - lastActive;
  if (delta < 2000) return 1;
  if (delta < 4000) return 0.7;
  return 0.4;
};

export const CollaboratorCursors = ({ cursors }: CollaboratorCursorsProps) => {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      forceRender((value) => value + 1);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute pointer-events-none transition-transform duration-75"
          style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
        >
          <div className="relative -translate-x-3 -translate-y-5 select-none">
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white shadow-lg"
              style={{ backgroundColor: cursor.color, opacity: getOpacityFromActivity(cursor.lastActive) }}
            >
              <span className="inline-block size-2 rounded-full border border-white/40 bg-white/80" />
              <span>{cursor.name}</span>
            </div>
            <div
              className="mt-1 h-3 w-3 rotate-45 rounded-sm"
              style={{
                backgroundColor: cursor.color,
                opacity: getOpacityFromActivity(cursor.lastActive),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

