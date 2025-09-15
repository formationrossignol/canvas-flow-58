import React, { useState, useRef, useCallback } from "react";
import { Trash2, Edit3 } from "lucide-react";
import { CanvasElement } from "./Canvas";

interface CanvasObjectProps {
  element: CanvasElement;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export const CanvasObject = ({ element, onUpdate, onDelete, isSelected }: CanvasObjectProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content || '');
  const dragStart = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    };
  }, [element.x, element.y]);

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
    if (element.type === 'sticky' || element.type === 'text') {
      setIsEditing(true);
      setEditContent(element.content || '');
    }
  }, [element.type, element.content]);

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

  const getElementStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      backgroundColor: element.color,
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
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
      
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: '1px dashed rgba(0,0,0,0.2)',
        };
      
      default:
        return baseStyle;
    }
  };

  const renderContent = () => {
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
      
      {/* Hover Controls */}
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
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
      </div>
    </div>
  );
};