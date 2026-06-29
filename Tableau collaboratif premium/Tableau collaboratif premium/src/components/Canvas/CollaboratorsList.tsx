import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Participant {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  lastActive: number;
}

interface CollaboratorsListProps {
  participants: Participant[];
  currentUserName: string;
}

const getActivityStatus = (lastActive: number) => {
  const delta = Date.now() - lastActive;
  if (delta < 3000) return { label: "Actif", className: "bg-green-500" };
  if (delta < 10000) return { label: "Inactif", className: "bg-yellow-500" };
  return { label: "Absent", className: "bg-gray-400" };
};

export const CollaboratorsList = ({ participants, currentUserName }: CollaboratorsListProps) => {
  const totalCollaborators = participants.length + 1; // +1 for current user

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-30 gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg border-2"
        >
          <Users className="h-4 w-4" />
          <span className="font-semibold">{totalCollaborators}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Collaborateurs ({totalCollaborators})</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Personnes sur ce tableau
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-1">
            {/* Current user */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10">
              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {currentUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUserName}</p>
                <p className="text-xs text-muted-foreground">Vous</p>
              </div>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                En ligne
              </Badge>
            </div>

            {/* Other participants */}
            {participants.map((participant) => {
              const status = getActivityStatus(participant.lastActive);
              return (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar
                    className="h-9 w-9 border-2"
                    style={{ borderColor: participant.color }}
                  >
                    <AvatarFallback
                      className="text-sm font-semibold text-white"
                      style={{ backgroundColor: participant.color }}
                    >
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{participant.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className={`w-2 h-2 rounded-full ${status.className} animate-pulse`}
                      />
                      <p className="text-xs text-muted-foreground">{status.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {participants.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun autre collaborateur</p>
                <p className="text-xs mt-1">
                  Partagez ce tableau pour collaborer
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
