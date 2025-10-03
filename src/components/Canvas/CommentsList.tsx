import { X, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CanvasElement, Comment } from "./Canvas";
import { format } from "date-fns";

interface CommentsListProps {
  isVisible: boolean;
  onClose: () => void;
  elements: CanvasElement[];
}

export const CommentsList = ({ isVisible, onClose, elements }: CommentsListProps) => {
  if (!isVisible) return null;

  // Collect all comments from all elements
  const allComments: Array<{ elementId: string; comment: Comment; elementContent: string }> = [];
  
  elements.forEach(element => {
    if (element.comments && element.comments.length > 0) {
      element.comments.forEach(comment => {
        allComments.push({
          elementId: element.id,
          comment,
          elementContent: element.content || `${element.type} (${element.x}, ${element.y})`,
        });
      });
    }
  });

  // Sort by timestamp, newest first
  allComments.sort((a, b) => b.comment.timestamp.getTime() - a.comment.timestamp.getTime());

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-96 bg-card border-l border-border shadow-float animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Tous les commentaires</h2>
              <Badge variant="secondary">{allComments.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          {/* Comments List */}
          <ScrollArea className="flex-1 p-6">
            {allComments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Aucun commentaire</h3>
                <p className="text-muted-foreground text-sm">
                  Les commentaires apparaîtront ici une fois ajoutés
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allComments.map(({ elementId, comment, elementContent }, index) => (
                  <div
                    key={`${elementId}-${index}`}
                    className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.timestamp, 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{comment.text}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Sur: {elementContent.substring(0, 30)}
                            {elementContent.length > 30 ? '...' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
