import React, { useState, useRef, useCallback } from "react";
import { Trash2, Edit3, Lock, Unlock, Heart } from "lucide-react";
import { CanvasElement } from "./Canvas";

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

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const currentLikes = element.likes || 0;
    onUpdate(element.id, { likes: currentLikes + 1 });
  }, [element.id, element.likes, onUpdate]);

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
          }}
          autoFocus
          placeholder="Tapez votre contenu..."
        />
      );
    }

    return (
      <div 
        className="w-full h-full p-3 flex items-center justify-center text-center leading-relaxed select-none"
        style={{ 
          color: element.type === 'sticky' ? '#2D3748' : element.color,
          fontSize: element.fontSize || 14,
          ...element.textStyle,
        }}
      >
        {element.content || (element.type === 'sticky' ? 'Double-clic pour éditer' : '')}
      </div>
    );
  };

  return (
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
      {element.likes && element.likes > 0 && (
        <div className="absolute -bottom-2 -left-2 bg-destructive text-destructive-foreground rounded-full px-2 py-1 flex items-center gap-1 text-xs font-medium shadow-soft animate-scale-in">
          <Heart size={12} fill="currentColor" />
          <span>{element.likes}</span>
        </div>
      )}
      
      {/* Hover Controls */}
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        {/* Like Button - Always visible */}
        <button
          onClick={handleLike}
          className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
          title="Aimer cette idée"
        >
          <Heart size={12} fill={element.likes && element.likes > 0 ? "currentColor" : "none"} />
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
  );
};