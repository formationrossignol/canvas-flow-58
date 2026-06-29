import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "./Canvas";
import { toast } from "sonner";

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const CommentThread = ({ 
  comments, 
  onAddComment, 
  onClose,
  position 
}: CommentThreadProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
      toast.success("Commentaire ajouté");
    }
  };

  return (
    <div
      className="absolute bg-card border border-border rounded-lg shadow-elegant w-80 z-50 animate-in fade-in slide-in-from-bottom-2"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-primary" />
          <h3 className="font-semibold text-sm">Commentaires</h3>
          <span className="text-xs text-muted-foreground">({comments.length})</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      {/* Comments List */}
      <div className="max-h-64 overflow-y-auto p-3 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun commentaire pour le moment
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-muted/50 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-foreground">
                  {comment.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="min-h-[60px] text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="self-end"
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
