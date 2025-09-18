import { Settings, Download, Share2, Users, MessageCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CanvasHeaderProps {
  boardTitle: string;
  onTitleChange: (title: string) => void;
  collaborators: Array<{ id: string; name: string; avatar: string; color: string }>;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
}

export const CanvasHeader = ({ 
  boardTitle, 
  onTitleChange, 
  collaborators,
  onOpenTemplates,
  onOpenExport
}: CanvasHeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-white">CB</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">CollabBoard</h1>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-medium bg-transparent border-none outline-none text-foreground hover:bg-muted/50 px-2 py-1 rounded-md transition-colors"
            placeholder="Titre du tableau"
          />
        </div>

        {/* Center Section - Collaborators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{collaborators.length} collaborateur{collaborators.length > 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex -space-x-2">
            {collaborators.slice(0, 4).map((collaborator, index) => (
              <div
                key={collaborator.id}
                className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white shadow-soft"
                style={{ 
                  backgroundColor: collaborator.color,
                  zIndex: collaborators.length - index,
                }}
                title={collaborator.name}
              >
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborators.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                +{collaborators.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            En ligne
          </Badge>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle size={16} />
            Chat
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-2" onClick={onOpenTemplates}>
            <Timer size={16} />
            Templates
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-2" onClick={onOpenExport}>
            <Download size={16} />
            Export
          </Button>
          
          <Button variant="default" size="sm" className="gap-2 bg-gradient-primary">
            <Share2 size={16} />
            Partager
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
};