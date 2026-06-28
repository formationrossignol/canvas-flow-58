import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Scissors, Clipboard, Trash2, Lock, Unlock, ArrowUp, ArrowDown, StickyNote, Type, Square } from "lucide-react";
import { CanvasElement } from "./Canvas";

interface ContextMenuProps {
  x: number;
  y: number;
  targetElement: CanvasElement | null;
  isLocked?: boolean;
  onClose: () => void;
  onPaste: () => void;
  onFitToScreen: () => void;
  onAddSticky: (x: number, y: number) => void;
  onAddText: (x: number, y: number) => void;
  onAddShape: (x: number, y: number) => void;
  onCopy: () => void;
  onCut: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  canvasX: number;
  canvasY: number;
}

const Item = ({
  icon: Icon,
  label,
  shortcut,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-accent transition-colors text-left ${
      danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground'
    }`}
    onClick={onClick}
  >
    <Icon size={13} className="flex-shrink-0" />
    <span className="flex-1">{label}</span>
    {shortcut && <span className="text-muted-foreground text-[10px]">{shortcut}</span>}
  </button>
);

const Separator = () => <div className="h-px bg-border my-1 mx-2" />;

export const ContextMenu = ({
  x, y, targetElement, isLocked,
  onClose, onPaste, onFitToScreen,
  onAddSticky, onAddText, onAddShape,
  onCopy, onCut, onDuplicate, onDelete, onToggleLock,
  onBringToFront, onSendToBack,
  canvasX, canvasY,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleScroll = () => onClose();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  const menuWidth = 210;
  const menuHeight = targetElement ? 240 : 160;
  const clampedX = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8));
  const clampedY = Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8));

  const wrap = (fn: () => void) => () => { fn(); onClose(); };

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-50 bg-card border border-border rounded-xl shadow-float overflow-hidden py-1 min-w-[210px]"
      style={{ left: clampedX, top: clampedY }}
      onContextMenu={e => e.preventDefault()}
    >
      {targetElement ? (
        <>
          <Item icon={Copy}     label="Dupliquer"              shortcut="⌘D" onClick={wrap(onDuplicate)} />
          <Item icon={Copy}     label="Copier"                 shortcut="⌘C" onClick={wrap(onCopy)} />
          <Item icon={Scissors} label="Couper"                 shortcut="⌘X" onClick={wrap(onCut)} />
          <Separator />
          <Item
            icon={isLocked ? Unlock : Lock}
            label={isLocked ? 'Déverrouiller' : 'Verrouiller'}
            onClick={wrap(onToggleLock)}
          />
          <Item icon={ArrowUp}   label="Mettre au premier plan" onClick={wrap(onBringToFront)} />
          <Item icon={ArrowDown} label="Envoyer en arrière-plan" onClick={wrap(onSendToBack)} />
          <Separator />
          <Item icon={Trash2}   label="Supprimer"              shortcut="⌫" onClick={wrap(onDelete)} danger />
        </>
      ) : (
        <>
          <Item icon={StickyNote} label="Ajouter un post-it"  shortcut="S" onClick={wrap(() => onAddSticky(canvasX, canvasY))} />
          <Item icon={Type}       label="Ajouter du texte"    shortcut="T" onClick={wrap(() => onAddText(canvasX, canvasY))} />
          <Item icon={Square}     label="Ajouter une forme"               onClick={wrap(() => onAddShape(canvasX, canvasY))} />
          <Separator />
          <Item icon={Clipboard}  label="Coller"              shortcut="⌘V" onClick={wrap(onPaste)} />
          <button
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-accent transition-colors text-left text-foreground"
            onClick={() => { onFitToScreen(); onClose(); }}
          >
            <span className="text-[13px] flex-shrink-0 leading-none">⊡</span>
            <span className="flex-1">Ajuster à l'écran</span>
            <span className="text-muted-foreground text-[10px]">⌘⇧H</span>
          </button>
        </>
      )}
    </div>
  );

  return createPortal(menu, document.body);
};
