import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { RemoteCursor } from "@/hooks/useBoardPresence";

interface CollaboratorCursorsProps {
  cursors: RemoteCursor[];
}

const getOpacityFromActivity = (lastActive: number) => {
  const delta = Date.now() - lastActive;
  if (delta < 2000) return 1;
  if (delta < 4000) return 0.8;
  return 0.5;
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
      {cursors.map((cursor) => {
        const opacity = getOpacityFromActivity(cursor.lastActive);
        return (
          <div
            key={cursor.id}
            className="absolute pointer-events-none transition-all duration-150 ease-out"
            style={{ 
              transform: `translate(${cursor.x}px, ${cursor.y}px)`,
              opacity 
            }}
          >
            {/* Cursor pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M5.65376 12.3673L13.1844 17.7345C13.6479 18.0642 14.2807 17.9531 14.6104 17.4896C14.7382 17.3015 14.8098 17.0813 14.8178 16.8554L15.0853 8.13727C15.1069 7.46479 14.5781 6.90911 13.9056 6.88752C13.6798 6.87951 13.4596 6.95112 13.2715 7.07889L5.74088 12.4461C5.27741 12.7758 5.16626 13.4086 5.49599 13.8721C5.59354 14.0116 5.72091 14.1277 5.86944 14.2132L5.65376 12.3673Z"
                fill={cursor.color}
              />
            </svg>

            {/* Name tag with avatar */}
            <div 
              className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full pl-0.5 pr-2.5 py-0.5 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{ 
                backgroundColor: cursor.color,
                boxShadow: `0 4px 12px ${cursor.color}40`
              }}
            >
              <Avatar className="h-5 w-5 border border-white/30">
                <AvatarFallback 
                  className="text-[10px] font-bold text-white"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-white whitespace-nowrap">
                {cursor.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

