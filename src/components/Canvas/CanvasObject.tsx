import React, { useState, useRef, useCallback } from "react";
import { Trash2, Edit3, Lock, Unlock, Heart, MessageCircle, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CanvasElement, Comment } from "./Canvas";
import { CommentThread } from "./CommentThread";

interface CanvasObjectProps {
  element: CanvasElement;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onClick: (id: string, e: React.MouseEvent) => void;
  isSelected: boolean;
}

export const CanvasObject = ({ element, onUpdate, onDelete, onClick, isSelected }: CanvasObjectProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content || '');
  const [showComments, setShowComments] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(element.id, e);
    
    // Don't allow dragging if locked
    if (element.locked) return;
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    };
  }, [element.x, element.y, element.id, onClick, element.locked]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    onUpdate(element.id, { x: newX, y: newY });
  }, [isDragging, element.id, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback(() => {
    // Don't allow editing if locked
    if (element.locked) return;
    
    if (element.type === 'sticky' || element.type === 'text') {
      setIsEditing(true);
      setEditContent(element.content || '');
    } else if (element.type === 'comment') {
      setShowComments(true);
    }
  }, [element.type, element.content, element.locked]);

  const handleContentSave = useCallback(() => {
    onUpdate(element.id, { content: editContent });
    setIsEditing(false);
  }, [element.id, editContent, onUpdate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleContentSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(element.content || '');
    }
  }, [handleContentSave, element.content]);

  const getCurrentUserId = useCallback(() => {
    // Get or create a unique user ID for this session
    let userId = localStorage.getItem('canvas_user_id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('canvas_user_id', userId);
    }
    return userId;
  }, []);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = getCurrentUserId();
    const likedBy = element.likedBy || [];
    
    // Toggle like: if user already liked, remove; otherwise add
    const hasLiked = likedBy.includes(userId);
    const updatedLikedBy = hasLiked 
      ? likedBy.filter(id => id !== userId)
      : [...likedBy, userId];
    
    onUpdate(element.id, { likedBy: updatedLikedBy });
  }, [element.id, element.likedBy, onUpdate, getCurrentUserId]);

  const userId = getCurrentUserId();
  const hasUserLiked = element.likedBy?.includes(userId) || false;
  const likesCount = element.likedBy?.length || 0;

  const handleAddComment = useCallback((text: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: getCurrentUserId(),
      userName: 'Utilisateur', // In a real app, get from auth
      text,
      timestamp: new Date(),
    };
    const updatedComments = [...(element.comments || []), newComment];
    onUpdate(element.id, { comments: updatedComments });
  }, [element.comments, element.id, onUpdate, getCurrentUserId]);

  const getElementStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      backgroundColor: element.color,
      cursor: element.locked ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      opacity: element.locked ? (element.opacity || 1) * 0.7 : (element.opacity || 1),
      zIndex: element.zIndex || 1,
    };

    switch (element.type) {
      case 'sticky':
        return {
          ...baseStyle,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.3)',
        };
      
      case 'rectangle':
        return {
          ...baseStyle,
          borderRadius: element.borderRadius || 8,
          border: '2px solid rgba(0,0,0,0.1)',
        };
      
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%',
          border: '2px solid rgba(0,0,0,0.1)',
        };
      
      case 'triangle':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
        };
      
      case 'hexagon':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
        };
      
      case 'pentagon':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
        };
      
      case 'star':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
        };
      
      case 'diamond':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
        };
      
      case 'heart':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
        };
      
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: '1px dashed rgba(0,0,0,0.2)',
        };
      
      case 'image':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderRadius: 8,
          overflow: 'hidden',
        };
      
      case 'comment':
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '2px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        };
      
      default:
        return baseStyle;
    }
  };

  const renderContent = () => {
    if (element.type === 'image' && element.imageUrl) {
      return (
        <img
          src={element.imageUrl}
          alt="Canvas image"
          className="w-full h-full object-cover"
          draggable={false}
        />
      );
    }

    if (element.type === 'comment') {
      const comments = element.comments || [];
      return (
        <div className="w-full h-full p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <MessageCircle size={18} />
            <span className="font-semibold text-sm">Commentaires</span>
            {comments.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {comments.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Double-cliquez pour voir ou ajouter des commentaires
          </p>
          {comments.length > 0 && (
            <div className="text-xs text-foreground truncate">
              Dernier: {comments[comments.length - 1].text.substring(0, 30)}...
            </div>
          )}
        </div>
      );
    }

    // Render SVG shapes
    const shapeTypes = ['triangle', 'hexagon', 'pentagon', 'star', 'diamond', 'heart'];
    if (shapeTypes.includes(element.type)) {
      const renderShape = () => {
        const w = element.width;
        const h = element.height;
        
        switch (element.type) {
          case 'triangle':
            return `M ${w/2} 5 L ${w-5} ${h-5} L 5 ${h-5} Z`;
          
          case 'hexagon':
            return `M ${w/2} 5 L ${w-5} ${h/4} L ${w-5} ${3*h/4} L ${w/2} ${h-5} L 5 ${3*h/4} L 5 ${h/4} Z`;
          
          case 'pentagon':
            return `M ${w/2} 5 L ${w-5} ${h/3} L ${w-10} ${h-5} L 10 ${h-5} L 5 ${h/3} Z`;
          
          case 'star':
            const cx = w / 2;
            const cy = h / 2;
            const spikes = 5;
            const outerRadius = Math.min(w, h) / 2 - 5;
            const innerRadius = outerRadius / 2.5;
            let path = '';
            for (let i = 0; i < spikes * 2; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (Math.PI * i) / spikes - Math.PI / 2;
              const x = cx + Math.cos(angle) * radius;
              const y = cy + Math.sin(angle) * radius;
              path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
            }
            return path + 'Z';
          
          case 'diamond':
            return `M ${w/2} 5 L ${w-5} ${h/2} L ${w/2} ${h-5} L 5 ${h/2} Z`;
          
          case 'heart':
            const heartW = w - 10;
            const heartH = h - 10;
            return `M ${heartW/2 + 5} ${heartH/4 + 10} 
                    C ${heartW/2 + 5} ${heartH/8 + 10}, ${heartW/4 + 5} 5, ${heartW/8 + 5} 5
                    C 5 5, 5 ${heartH/4 + 10}, 5 ${heartH/3 + 10}
                    C 5 ${heartH/2 + 10}, ${heartW/4 + 5} ${3*heartH/4 + 10}, ${heartW/2 + 5} ${heartH + 5}
                    C ${3*heartW/4 + 5} ${3*heartH/4 + 10}, ${heartW + 5} ${heartH/2 + 10}, ${heartW + 5} ${heartH/3 + 10}
                    C ${heartW + 5} ${heartH/4 + 10}, ${heartW + 5} 5, ${7*heartW/8 + 5} 5
                    C ${3*heartW/4 + 5} 5, ${heartW/2 + 5} ${heartH/8 + 10}, ${heartW/2 + 5} ${heartH/4 + 10} Z`;
          
          default:
            return '';
        }
      };

      return (
        <svg 
          width={element.width} 
          height={element.height} 
          className="absolute inset-0"
          style={{ pointerEvents: 'none' }}
        >
          <path
            d={renderShape()}
            fill={element.color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="2"
          />
        </svg>
      );
    }

    if (isEditing && (element.type === 'sticky' || element.type === 'text')) {
      return (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleContentSave}
          onKeyDown={handleKeyPress}
          className="w-full h-full p-3 bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
          style={{ 
            color: element.type === 'sticky' ? '#2D3748' : element.color,
            fontSize: element.fontSize || 14,
            fontFamily: element.fontFamily || 'Arial',
            textAlign: element.textAlign || 'left',
          }}
          autoFocus
          placeholder="Tapez votre contenu..."
        />
      );
    }

    return (
      <div className="w-full h-full p-3 flex flex-col gap-2">
        {/* Tags and Author for sticky notes */}
        {element.type === 'sticky' && (element.tags?.length || element.author) && (
          <div className="flex flex-col gap-1 mb-1">
            {element.author && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User size={10} />
                <span className="font-medium">{element.author}</span>
              </div>
            )}
            {element.tags && element.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {element.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div 
          className="flex-1 flex items-center justify-center leading-relaxed select-none"
          style={{ 
            color: element.type === 'sticky' ? '#2D3748' : element.color,
            fontSize: element.fontSize || 14,
            fontFamily: element.fontFamily || 'Arial',
            textAlign: element.textAlign || 'left',
            ...element.textStyle,
          }}
        >
          {element.content || (element.type === 'sticky' ? 'Double-clic pour éditer' : '')}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        ref={elementRef}
        style={getElementStyle()}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className="group animate-scale-in"
      >
        {renderContent()}
        
        {/* Selection Border */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
        )}
        
        {/* Likes Badge */}
        {likesCount > 0 && (
          <div className="absolute -bottom-2 -left-2 bg-destructive text-destructive-foreground rounded-full px-2 py-1 flex items-center gap-1 text-xs font-medium shadow-soft animate-scale-in">
            <Heart size={12} fill="currentColor" />
            <span>{likesCount}</span>
          </div>
        )}
        
        {/* Comment Count Badge */}
        {element.type === 'comment' && (element.comments?.length || 0) > 0 && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium shadow-soft animate-scale-in">
            {element.comments?.length}
          </div>
        )}
        
        {/* Hover Controls */}
        <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          {/* Like Button - Always visible */}
          <button
            onClick={handleLike}
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-soft hover:scale-110 transition-all ${
              hasUserLiked
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-background text-destructive border border-destructive'
            }`}
            title={hasUserLiked ? "Retirer mon like" : "Aimer cette idée"}
          >
            <Heart size={12} fill={hasUserLiked ? "currentColor" : "none"} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(element.id, { locked: !element.locked });
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-soft hover:scale-110 transition-transform ${
              element.locked 
                ? 'bg-warning text-warning-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
            title={element.locked ? "Déverrouiller" : "Verrouiller"}
          >
            {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          {!element.locked && (
            <>
              {element.type !== 'comment' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
                  title="Éditer"
                >
                  <Edit3 size={12} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(element.id);
                }}
                className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
                title="Supprimer"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comment Thread Modal */}
      {showComments && element.type === 'comment' && (
        <CommentThread
          comments={element.comments || []}
          onAddComment={handleAddComment}
          onClose={() => setShowComments(false)}
          position={{
            x: element.x + element.width + 10,
            y: element.y,
          }}
        />
      )}
    </>
  );
};