# Canvas UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bottom-center toolbar, heavy header, and side property panel with a Miro-like layout: vertical left toolbar, slim bottom bar, floating contextual bar above selection, and rich right-click context menu.

**Architecture:** 4 independent phases — each phase is a self-contained change that keeps the canvas functional. Phase 1: new toolbar components. Phase 2: header refactor. Phase 3: contextual bar replaces PropertyPanel. Phase 4: context menu.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide icons, existing Arcade Pop design system (CSS vars on `:root`).

**Spec:** `docs/superpowers/specs/2026-06-28-canvas-ux-redesign.md`

---

## File Map

### Created
- `src/components/Canvas/ToolbarLeft.tsx` — vertical pill toolbar (tools: select/pen/eraser/sticky/text/shapes/image/comment/connect)
- `src/components/Canvas/BottomBar.tsx` — slim centered pill (undo/redo + zoom + fit-to-screen)
- `src/components/Canvas/ContextualBar.tsx` — floating bar above selected elements (color, font, duplicate, delete)
- `src/components/Canvas/ContextMenu.tsx` — right-click portal menu (canvas vs element modes)

### Modified
- `src/components/Canvas/Canvas.tsx` — wire new components in, remove old ones (4 phases)
- `src/components/Canvas/CanvasHeader.tsx` — minimal header with save dot + dynamic center + `···` menu

### Deleted (after their replacement is wired in)
- `src/components/Canvas/CanvasToolbar.tsx` — removed after Task 3
- `src/components/Canvas/PropertyPanel.tsx` — removed after Task 6

---

## Phase 1 — Toolbar

---

### Task 1: Create ToolbarLeft.tsx

**Files:**
- Create: `src/components/Canvas/ToolbarLeft.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/Canvas/ToolbarLeft.tsx
import { MousePointer2, Edit3, Eraser, StickyNote, Type, Shapes, Image, MessageCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasElement } from "./Canvas";

interface ToolbarLeftProps {
  selectedTool: string;
  isConnecting: boolean;
  onToolSelect: (tool: string) => void;
  onAddElement: (type: CanvasElement['type']) => void;
  onToggleConnecting: () => void;
  onToggleShapeLibrary: () => void;
}

const modeTools = [
  { id: 'select', icon: MousePointer2, label: 'Sélection', shortcut: 'V' },
  { id: 'pen',    icon: Edit3,         label: 'Crayon',    shortcut: 'P' },
  { id: 'eraser', icon: Eraser,        label: 'Gomme',     shortcut: 'E' },
];

const createTools = [
  { id: 'sticky',  icon: StickyNote,    label: 'Post-it',   shortcut: 'S' },
  { id: 'text',    icon: Type,          label: 'Texte',     shortcut: 'T' },
  { id: 'shapes',  icon: Shapes,        label: 'Formes',    shortcut: 'F' },
  { id: 'image',   icon: Image,         label: 'Image',     shortcut: 'I' },
];

const collabTools = [
  { id: 'comment', icon: MessageCircle, label: 'Commentaire', shortcut: 'C' },
  { id: 'connect', icon: Link2,         label: 'Connecter',   shortcut: 'L' },
];

export const ToolbarLeft = ({
  selectedTool,
  isConnecting,
  onToolSelect,
  onAddElement,
  onToggleConnecting,
  onToggleShapeLibrary,
}: ToolbarLeftProps) => {
  const handleClick = (toolId: string) => {
    if (toolId === 'connect') {
      onToolSelect(toolId);
      onToggleConnecting();
      return;
    }
    if (toolId === 'shapes') {
      onToolSelect(toolId);
      onToggleShapeLibrary();
      return;
    }
    onToolSelect(toolId);
    if (!['select', 'pen', 'eraser'].includes(toolId)) {
      onAddElement(toolId as CanvasElement['type']);
    }
  };

  const isActive = (toolId: string) =>
    toolId === 'connect' ? isConnecting : selectedTool === toolId;

  const renderGroup = (tools: typeof modeTools) =>
    tools.map(({ id, icon: Icon, label, shortcut }) => (
      <Button
        key={id}
        variant={isActive(id) ? 'default' : 'ghost'}
        size="sm"
        className={`w-9 h-9 p-0 relative group ${
          isActive(id)
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => handleClick(id)}
        title={`${label} (${shortcut})`}
      >
        <Icon size={16} />
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label} <span className="opacity-60">({shortcut})</span>
        </div>
      </Button>
    ));

  return (
    <div className="fixed left-3 top-1/2 -translate-y-1/2 z-20">
      <div className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl shadow-float p-2">
        {renderGroup(modeTools)}
        <div className="w-6 h-px bg-border my-1" />
        {renderGroup(createTools)}
        <div className="w-6 h-px bg-border my-1" />
        {renderGroup(collabTools)}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `ToolbarLeft.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas/ToolbarLeft.tsx
git commit -m "feat(canvas): add ToolbarLeft vertical toolbar component"
```

---

### Task 2: Create BottomBar.tsx

**Files:**
- Create: `src/components/Canvas/BottomBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/Canvas/BottomBar.tsx
import { Undo2, Redo2, Minus, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BottomBarProps {
  canUndo: boolean;
  canRedo: boolean;
  scale: number;
  onUndo: () => void;
  onRedo: () => void;
  onZoomChange: (scale: number) => void;
  onFitToScreen: () => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;

export const BottomBar = ({
  canUndo,
  canRedo,
  scale,
  onUndo,
  onRedo,
  onZoomChange,
  onFitToScreen,
}: BottomBarProps) => {
  const [editingZoom, setEditingZoom] = useState(false);
  const [zoomInput, setZoomInput] = useState('');

  const zoomPercent = Math.round(scale * 100);

  const handleZoomIn = () =>
    onZoomChange(Math.min(MAX_SCALE, scale * 1.2));

  const handleZoomOut = () =>
    onZoomChange(Math.max(MIN_SCALE, scale / 1.2));

  const handleZoomCommit = () => {
    const val = parseInt(zoomInput, 10);
    if (!isNaN(val) && val >= 10 && val <= 300) {
      onZoomChange(val / 100);
    }
    setEditingZoom(false);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl shadow-float px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          onClick={onUndo}
          disabled={!canUndo}
          title="Annuler (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          onClick={onRedo}
          disabled={!canRedo}
          title="Refaire (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleZoomOut}
          title="Zoom arrière"
        >
          <Minus size={14} />
        </Button>

        {editingZoom ? (
          <input
            autoFocus
            className="w-14 text-center text-xs font-semibold bg-muted rounded-md px-1 py-0.5 outline-none border border-primary"
            value={zoomInput}
            onChange={e => setZoomInput(e.target.value)}
            onBlur={handleZoomCommit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleZoomCommit();
              if (e.key === 'Escape') setEditingZoom(false);
            }}
          />
        ) : (
          <button
            className="w-14 text-center text-xs font-semibold text-foreground bg-muted hover:bg-accent rounded-md px-1 py-0.5 transition-colors"
            onClick={() => { setZoomInput(String(zoomPercent)); setEditingZoom(true); }}
            title="Cliquer pour saisir un zoom exact"
          >
            {zoomPercent}%
          </button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleZoomIn}
          title="Zoom avant"
        >
          <Plus size={14} />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={onFitToScreen}
          title="Ajuster à l'écran (Ctrl+Shift+H)"
        >
          <Maximize2 size={14} />
        </Button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas/BottomBar.tsx
git commit -m "feat(canvas): add BottomBar zoom and undo/redo component"
```

---

### Task 3: Wire ToolbarLeft + BottomBar into Canvas.tsx, remove CanvasToolbar

**Files:**
- Modify: `src/components/Canvas/Canvas.tsx`
- Delete: `src/components/Canvas/CanvasToolbar.tsx`

- [ ] **Step 1: Add imports at top of Canvas.tsx**

Replace the existing CanvasToolbar import line:
```tsx
import { CanvasToolbar } from "./CanvasToolbar";
```
With:
```tsx
import { ToolbarLeft } from "./ToolbarLeft";
import { BottomBar } from "./BottomBar";
```

- [ ] **Step 2: Add fitToScreen handler in Canvas.tsx**

After the existing `setCanvasTransform` usages (around line 595), add:

```tsx
const handleFitToScreen = useCallback(() => {
  if (!elements.length) {
    setCanvasTransform({ x: 0, y: 0, scale: 1 });
    return;
  }
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  const minX = Math.min(...elements.map(el => el.x));
  const minY = Math.min(...elements.map(el => el.y));
  const maxX = Math.max(...elements.map(el => el.x + el.width));
  const maxY = Math.max(...elements.map(el => el.y + el.height));
  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const scale = Math.min(
    (rect.width - 128) / contentW,
    (rect.height - 128) / contentH,
    1
  );
  const x = (rect.width - contentW * scale) / 2 - minX * scale;
  const y = (rect.height - contentH * scale) / 2 - minY * scale;
  setCanvasTransform({ x, y, scale });
}, [elements, setCanvasTransform]);
```

- [ ] **Step 3: Replace <CanvasToolbar ... /> in the JSX**

Find the `<CanvasToolbar` block (around line 818) and replace the entire block with:

```tsx
<ToolbarLeft
  selectedTool={selectedTool}
  isConnecting={isConnecting}
  onToolSelect={setSelectedTool}
  onAddElement={handleAddElement}
  onToggleConnecting={() => setIsConnecting(!isConnecting)}
  onToggleShapeLibrary={() => setIsShapeLibraryVisible(!isShapeLibraryVisible)}
/>

<BottomBar
  canUndo={canUndo}
  canRedo={canRedo}
  scale={canvasTransform.scale}
  onUndo={() => { const prev = undo(); if (prev) setElements(prev); }}
  onRedo={() => { const next = redo(); if (next) setElements(next); }}
  onZoomChange={(scale) => setCanvasTransform(prev => ({ ...prev, scale }))}
  onFitToScreen={handleFitToScreen}
/>
```

- [ ] **Step 4: Also add Ctrl+Shift+H shortcut to the existing keyboard handler**

Find the keyboard handler in Canvas.tsx (around line 559 where `Ctrl+Z` is handled). Add inside the same switch/if block:

```tsx
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
  e.preventDefault();
  handleFitToScreen();
}
```

- [ ] **Step 5: Verify TypeScript compiles and app runs**

```bash
npx tsc --noEmit
npm run dev
```

Open browser, verify:
- Left toolbar appears vertically with tool groups
- Bottom bar appears with zoom % + undo/redo
- Clicking a tool (e.g. Post-it) then clicking on canvas creates element
- Undo/Redo work
- Zoom +/− buttons work
- Fit-to-screen button works
- Keyboard shortcuts V/P/E/S/T/I/C still work

- [ ] **Step 6: Delete CanvasToolbar.tsx and commit**

```bash
rm src/components/Canvas/CanvasToolbar.tsx
git add -A
git commit -m "feat(canvas): replace bottom toolbar with ToolbarLeft + BottomBar (Phase 1)"
```

---

## Phase 2 — Header

---

### Task 4: Refactor CanvasHeader.tsx

**Files:**
- Modify: `src/components/Canvas/CanvasHeader.tsx`

- [ ] **Step 1: Replace entire file content**

The new header removes: "En ligne" badge, element count, save status text, Comments button from top level. Adds: save dot, dynamic center slot, simplified `···` menu with Comments + Timer.

```tsx
// src/components/Canvas/CanvasHeader.tsx
import { useState } from "react";
import {
  Share2, Users, Copy, QrCode, Mail, Loader2,
  MoreHorizontal, Save, RefreshCcw, Layout, Download,
  MessageCircle, Timer, ClipboardCopy, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CanvasHeaderProps {
  boardTitle: string;
  onTitleChange: (title: string) => void;
  collaborators: Array<{ id: string; name: string; avatar: string; color: string }>;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onOpenComments: () => void;
  selectedCount?: number;
  onDuplicateSelected?: () => void;
  boardId?: string;
  lastSavedAt?: Date | null;
  isSaving?: boolean;
  onSaveNow?: () => void;
  onResetBoard?: () => void;
  onToggleTimer?: () => void;
}

export const CanvasHeader = ({
  boardTitle,
  onTitleChange,
  collaborators,
  onOpenTemplates,
  onOpenExport,
  onOpenComments,
  selectedCount = 0,
  onDuplicateSelected,
  boardId,
  lastSavedAt,
  isSaving,
  onSaveNow,
  onResetBoard,
  onToggleTimer,
}: CanvasHeaderProps) => {
  const navigate = useNavigate();
  const [emailInvite, setEmailInvite] = useState("");

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier");
  };

  const handleCopyBoardId = () => {
    if (!boardId) return;
    navigator.clipboard.writeText(boardId);
    toast.success("Identifiant du tableau copié");
  };

  const handleEmailInvite = () => {
    if (!emailInvite?.includes('@')) {
      toast.error("Adresse email invalide");
      return;
    }
    const link = window.location.href;
    window.location.href = `mailto:${emailInvite}?subject=Invitation à collaborer sur ${boardTitle}&body=Rejoignez-moi : ${link}`;
    toast.success("Email d'invitation ouvert");
    setEmailInvite("");
  };

  // Save dot color
  const dotColor = isSaving ? 'bg-yellow-400 animate-pulse' : lastSavedAt ? 'bg-green-500' : 'bg-red-400';
  const dotTitle = isSaving
    ? 'Enregistrement en cours…'
    : lastSavedAt
    ? `Enregistré (${lastSavedAt.toLocaleTimeString()})`
    : 'Non enregistré';

  return (
    <header className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="flex items-center justify-between px-4 h-12">

        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger />
          <div className="h-5 w-px bg-border" />
          <input
            type="text"
            value={boardTitle}
            onChange={e => onTitleChange(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none outline-none text-foreground hover:bg-muted/50 px-2 py-1 rounded-md transition-colors max-w-[200px] truncate"
            placeholder="Titre du tableau"
          />
          {/* Save dot */}
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}
            title={dotTitle}
          />
        </div>

        {/* Center — dynamic context */}
        <div className="flex-1 flex justify-center">
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1">
              <span className="text-xs font-semibold text-primary">
                {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
              </span>
              {onDuplicateSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                  onClick={onDuplicateSelected}
                >
                  <Copy size={12} className="mr-1" />
                  Dupliquer
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Collaborator avatars */}
          <div className="hidden md:flex -space-x-2 mr-1">
            {collaborators.slice(0, 4).map((c, i) => (
              <div
                key={c.id}
                className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: c.color, zIndex: collaborators.length - i }}
                title={c.name}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborators.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                +{collaborators.length - 4}
              </div>
            )}
          </div>

          {/* Share */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs">
                <Share2 size={13} />
                Partager
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Partager le tableau</DialogTitle>
                <DialogDescription>Partagez ce tableau avec d'autres personnes</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="link" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="link"><Copy size={13} className="mr-1" />Lien</TabsTrigger>
                  <TabsTrigger value="qr"><QrCode size={13} className="mr-1" />QR</TabsTrigger>
                  <TabsTrigger value="email"><Mail size={13} className="mr-1" />Email</TabsTrigger>
                </TabsList>
                <TabsContent value="link" className="space-y-3">
                  <Label>Lien de partage</Label>
                  <div className="flex gap-2">
                    <Input value={window.location.href} readOnly className="flex-1" />
                    <Button onClick={handleShare}>Copier</Button>
                  </div>
                </TabsContent>
                <TabsContent value="qr" className="flex flex-col items-center gap-4 py-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG value={window.location.href} size={180} level="H" includeMargin />
                  </div>
                </TabsContent>
                <TabsContent value="email" className="space-y-3">
                  <Label>Email du collaborateur</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="exemple@email.com"
                      value={emailInvite}
                      onChange={e => setEmailInvite(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleEmailInvite}><Mail size={14} className="mr-1" />Inviter</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* ··· Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-sm border-border z-50">
              {onSaveNow && (
                <DropdownMenuItem onClick={onSaveNow} className="gap-2 cursor-pointer">
                  <Save size={15} /><span>Enregistrer maintenant</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onOpenTemplates} className="gap-2 cursor-pointer">
                <Layout size={15} /><span>Templates</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenExport} className="gap-2 cursor-pointer">
                <Download size={15} /><span>Exporter (PDF…)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenComments} className="gap-2 cursor-pointer">
                <MessageCircle size={15} /><span>Commentaires</span>
              </DropdownMenuItem>
              {onToggleTimer && (
                <DropdownMenuItem onClick={onToggleTimer} className="gap-2 cursor-pointer">
                  <Timer size={15} /><span>Timer</span>
                </DropdownMenuItem>
              )}
              {boardId && (
                <DropdownMenuItem onClick={handleCopyBoardId} className="gap-2 cursor-pointer">
                  <ClipboardCopy size={15} /><span>Copier l'identifiant</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 cursor-pointer">
                <Settings size={15} /><span>Paramètres</span>
              </DropdownMenuItem>
              {onResetBoard && (
                <DropdownMenuItem onClick={onResetBoard} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <RefreshCcw size={15} /><span>Réinitialiser</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Update Canvas.tsx to pass new props to CanvasHeader**

Find the `<CanvasHeader` usage in Canvas.tsx (around line 700) and replace the entire block with:

```tsx
<CanvasHeader
  boardTitle={boardTitle}
  onTitleChange={setBoardTitle}
  collaborators={collaborators}
  onOpenTemplates={() => setIsTemplatePanelVisible(true)}
  onOpenExport={() => setIsExportModalVisible(true)}
  onOpenComments={() => setIsCommentsListVisible(true)}
  selectedCount={selection.selectedIds.length}
  onDuplicateSelected={
    selection.selectedIds.length > 0
      ? () => selection.selectedIds.forEach(id => handleElementDuplicate(id))
      : undefined
  }
  boardId={boardId}
  lastSavedAt={lastSavedAt}
  isSaving={isSaving}
  onSaveNow={handleForceSave}
  onResetBoard={handleResetBoard}
  onToggleTimer={() => setIsTimerVisible(!isTimerVisible)}
/>
```

Props removed vs current: `elementCount`, `commentCount`, `onLockSelected`, `onUnlockSelected`, `isSelectionLocked`.

- [ ] **Step 3: Verify TypeScript compiles and app runs**

```bash
npx tsc --noEmit
npm run dev
```

Verify:
- Header is 48px tall, minimal
- Save dot is green when saved, yellow+pulsing when saving
- "N éléments sélectionnés" appears in center when elements are selected
- `···` menu contains Templates, Export, Comments, Timer, Settings
- Share dialog still works

- [ ] **Step 4: Commit**

```bash
git add src/components/Canvas/CanvasHeader.tsx src/components/Canvas/Canvas.tsx
git commit -m "feat(canvas): refactor CanvasHeader to minimal dynamic layout (Phase 2)"
```

---

## Phase 3 — Contextual Bar

---

### Task 5: Create ContextualBar.tsx

**Files:**
- Create: `src/components/Canvas/ContextualBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/Canvas/ContextualBar.tsx
import { useState, useRef, useEffect } from "react";
import { Copy, Trash2, Lock, Unlock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasElement } from "./Canvas";

interface ContextualBarProps {
  selectedElements: CanvasElement[];
  canvasTransform: { x: number; y: number; scale: number };
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const QUICK_COLORS = ['#FFE066', '#FF8A80', '#81C784', '#64B5F6', '#FFB74D'];
const ALL_COLORS = [
  '#FFE066', '#FF8A80', '#81C784', '#64B5F6',
  '#FFB74D', '#E1BEE7', '#A5D6A7', '#F48FB1',
  '#90CAF9', '#FFCC02', '#FF5722', '#4CAF50',
  '#2196F3', '#FF9800', '#9C27B0', '#ffffff',
];
const HEADER_HEIGHT = 48;
const BAR_HEIGHT = 44;

function getBoundingBox(elements: CanvasElement[]) {
  const minX = Math.min(...elements.map(el => el.x));
  const minY = Math.min(...elements.map(el => el.y));
  const maxX = Math.max(...elements.map(el => el.x + el.width));
  return { minX, minY, midX: (minX + maxX) / 2 };
}

export const ContextualBar = ({
  selectedElements,
  canvasTransform,
  onUpdate,
  onDelete,
  onDuplicate,
}: ContextualBarProps) => {
  const [showAllColors, setShowAllColors] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  if (!selectedElements.length) return null;

  const { midX, minY } = getBoundingBox(selectedElements);
  const { x: panX, y: panY, scale } = canvasTransform;

  const screenCenterX = midX * scale + panX;
  const screenTopY = minY * scale + panY;

  const barTop = screenTopY - BAR_HEIGHT - 12;
  const clampedTop = Math.max(HEADER_HEIGHT + 8, barTop);

  const isMulti = selectedElements.length > 1;
  const first = selectedElements[0];
  const isText = first.type === 'text';
  const isLocked = selectedElements.every(el => el.locked);

  const updateAll = (updates: Partial<CanvasElement>) =>
    selectedElements.forEach(el => onUpdate(el.id, updates));

  const handleColorClick = (color: string) => {
    updateAll({ color });
    setShowAllColors(false);
  };

  const handleFontSizeStep = (delta: number) => {
    const current = first.fontSize ?? 14;
    updateAll({ fontSize: Math.max(8, Math.min(96, current + delta)) });
  };

  return (
    <div
      ref={barRef}
      className="fixed z-30 pointer-events-none"
      style={{ left: screenCenterX, top: clampedTop, transform: 'translateX(-50%)' }}
    >
      <div className="pointer-events-auto flex items-center gap-1 bg-card border border-border rounded-xl shadow-float px-2 py-1.5 whitespace-nowrap">

        {/* Text controls */}
        {isText && !isMulti && (
          <>
            <div className="flex items-center gap-0.5 bg-muted rounded-md px-1">
              <button
                className="w-5 h-5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleFontSizeStep(-2)}
              >−</button>
              <span className="text-xs font-semibold text-foreground px-1 min-w-[24px] text-center">
                {first.fontSize ?? 14}
              </span>
              <button
                className="w-5 h-5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleFontSizeStep(2)}
              >+</button>
            </div>
            <div className="w-px h-5 bg-border mx-0.5" />
          </>
        )}

        {/* Color swatches */}
        <div className="flex items-center gap-1">
          {QUICK_COLORS.map(color => (
            <button
              key={color}
              className={`w-5 h-5 rounded transition-transform hover:scale-110 ${
                first.color === color ? 'ring-2 ring-primary ring-offset-1' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
              title={color}
            />
          ))}
          {/* More colors */}
          <div className="relative">
            <button
              className="w-5 h-5 rounded border border-dashed border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors"
              onClick={() => setShowAllColors(v => !v)}
              title="Plus de couleurs"
            >
              <ChevronDown size={10} className="text-muted-foreground" />
            </button>
            {showAllColors && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl p-2 shadow-float grid grid-cols-4 gap-1.5 z-50">
                {ALL_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded transition-transform hover:scale-110 border ${
                      first.color === color ? 'border-primary scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorClick(color)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Lock */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => updateAll({ locked: !isLocked })}
          title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
        >
          {isLocked ? <Unlock size={13} /> : <Lock size={13} />}
        </Button>

        {/* Duplicate */}
        {!isMulti && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => onDuplicate(first.id)}
            title="Dupliquer (⌘D)"
          >
            <Copy size={13} />
          </Button>
        )}

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
          onClick={() => selectedElements.forEach(el => onDelete(el.id))}
          title="Supprimer (⌫)"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas/ContextualBar.tsx
git commit -m "feat(canvas): add ContextualBar floating selection toolbar"
```

---

### Task 6: Wire ContextualBar into Canvas.tsx, remove PropertyPanel

**Files:**
- Modify: `src/components/Canvas/Canvas.tsx`
- Delete: `src/components/Canvas/PropertyPanel.tsx`

- [ ] **Step 1: Add ContextualBar import, remove PropertyPanel import**

Replace:
```tsx
import { PropertyPanel } from "./PropertyPanel";
```
With:
```tsx
import { ContextualBar } from "./ContextualBar";
```

- [ ] **Step 2: Remove propertyPanelElementId state**

Find and remove:
```tsx
const [propertyPanelElementId, setPropertyPanelElementId] = useState<string | null>(null);
```

Also remove the line (around line 323):
```tsx
setPropertyPanelElementId(prev => prev === id ? null : prev);
```

- [ ] **Step 3: Replace <PropertyPanel ... /> with <ContextualBar ... />**

Find the `{/* Property Panel */}` block and replace with:

```tsx
{/* Contextual Bar */}
<ContextualBar
  selectedElements={elements.filter(el => selection.selectedIds.includes(el.id))}
  canvasTransform={canvasTransform}
  onUpdate={handleElementUpdate}
  onDelete={handleElementDelete}
  onDuplicate={handleElementDuplicate}
/>
```

- [ ] **Step 4: Remove onOpenProperties from CanvasObject**

In Canvas.tsx, find `onOpenProperties` prop on `<CanvasObject` and remove it. Also update CanvasObject.tsx to remove the prop:

In `src/components/Canvas/CanvasObject.tsx`, remove:
- `onOpenProperties?: (id: string) => void;` from the interface
- `onOpenProperties,` from the destructuring
- The button JSX that calls `onOpenProperties(element.id)` (around line 467)

- [ ] **Step 5: Verify TypeScript compiles and app runs**

```bash
npx tsc --noEmit
npm run dev
```

Verify:
- Clicking any element shows contextual bar above it
- Bar is centered above the element, flips below header if element is near top
- Color swatches work (changes element color)
- Font size +/− works for text elements
- Duplicate button works
- Delete button works
- Multi-selecting elements → bar shows with color + delete only
- No PropertyPanel side panel appears anymore

- [ ] **Step 6: Delete PropertyPanel.tsx and commit**

```bash
rm src/components/Canvas/PropertyPanel.tsx
git add -A
git commit -m "feat(canvas): replace PropertyPanel with ContextualBar (Phase 3)"
```

---

## Phase 4 — Context Menu

---

### Task 7: Create ContextMenu.tsx

**Files:**
- Create: `src/components/Canvas/ContextMenu.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/Canvas/ContextMenu.tsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Scissors, Clipboard, Trash2, Lock, Unlock, ArrowUp, ArrowDown, StickyNote, Type, Square } from "lucide-react";
import { CanvasElement } from "./Canvas";

interface ContextMenuProps {
  x: number;
  y: number;
  targetElement: CanvasElement | null; // null = canvas (no element hit)
  isLocked?: boolean;
  onClose: () => void;
  // Canvas actions
  onPaste: () => void;
  onFitToScreen: () => void;
  onAddSticky: (x: number, y: number) => void;
  onAddText: (x: number, y: number) => void;
  onAddShape: (x: number, y: number) => void;
  // Element actions
  onCopy: () => void;
  onCut: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  // Canvas coords for add actions
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

  // Clamp to viewport
  const menuWidth = 210;
  const menuHeight = targetElement ? 240 : 160;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);

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
          <Item icon={Copy}     label="Dupliquer"            shortcut="⌘D" onClick={wrap(onDuplicate)} />
          <Item icon={Copy}     label="Copier"               shortcut="⌘C" onClick={wrap(onCopy)} />
          <Item icon={Scissors} label="Couper"               shortcut="⌘X" onClick={wrap(onCut)} />
          <Separator />
          <Item
            icon={isLocked ? Unlock : Lock}
            label={isLocked ? 'Déverrouiller' : 'Verrouiller'}
            onClick={wrap(onToggleLock)}
          />
          <Item icon={ArrowUp}   label="Mettre au premier plan" onClick={wrap(onBringToFront)} />
          <Item icon={ArrowDown} label="Envoyer en arrière-plan" onClick={wrap(onSendToBack)} />
          <Separator />
          <Item icon={Trash2}   label="Supprimer"            shortcut="⌫" onClick={wrap(onDelete)} danger />
        </>
      ) : (
        <>
          <Item icon={StickyNote} label="Ajouter un post-it" shortcut="S" onClick={wrap(() => onAddSticky(canvasX, canvasY))} />
          <Item icon={Type}       label="Ajouter du texte"   shortcut="T" onClick={wrap(() => onAddText(canvasX, canvasY))} />
          <Item icon={Square}     label="Ajouter une forme"             onClick={wrap(() => onAddShape(canvasX, canvasY))} />
          <Separator />
          <Item icon={Clipboard}  label="Coller"             shortcut="⌘V" onClick={wrap(onPaste)} />
        </>
      )}
    </div>
  );

  return createPortal(menu, document.body);
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas/ContextMenu.tsx
git commit -m "feat(canvas): add ContextMenu right-click portal component"
```

---

### Task 8: Wire ContextMenu into Canvas.tsx

**Files:**
- Modify: `src/components/Canvas/Canvas.tsx`
- Modify: `src/components/Canvas/CanvasObject.tsx`

- [ ] **Step 1: Add import and state in Canvas.tsx**

Add import:
```tsx
import { ContextMenu } from "./ContextMenu";
```

Add state after existing state declarations:
```tsx
const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  targetElement: CanvasElement | null;
  canvasX: number;
  canvasY: number;
} | null>(null);

const clipboardRef = useRef<CanvasElement | null>(null);
```

- [ ] **Step 2: Add handleCanvasContextMenu in Canvas.tsx**

After `handleCanvasMouseUp`, add:

```tsx
const handleCanvasContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  e.preventDefault();
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
  const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;
  setContextMenu({ x: e.clientX, y: e.clientY, targetElement: null, canvasX, canvasY });
}, [canvasTransform]);

const handleElementContextMenu = useCallback((e: React.MouseEvent, element: CanvasElement) => {
  e.preventDefault();
  e.stopPropagation();
  setContextMenu({ x: e.clientX, y: e.clientY, targetElement: element, canvasX: 0, canvasY: 0 });
}, []);
```

- [ ] **Step 3: Add clipboard handlers in Canvas.tsx**

```tsx
const handleCopy = useCallback(() => {
  const target = contextMenu?.targetElement;
  if (target) clipboardRef.current = { ...target };
}, [contextMenu]);

const handleCut = useCallback(() => {
  const target = contextMenu?.targetElement;
  if (target) {
    clipboardRef.current = { ...target };
    handleElementDelete(target.id);
  }
}, [contextMenu, handleElementDelete]);

const handlePaste = useCallback(() => {
  const el = clipboardRef.current;
  if (!el) return;
  const pasted: CanvasElement = {
    ...el,
    id: `${el.type}-${Date.now()}`,
    x: el.x + 20,
    y: el.y + 20,
  };
  setElements(prev => {
    const next = [...prev, pasted];
    addToHistory(next);
    return next;
  });
}, [addToHistory]);

const handleBringToFront = useCallback(() => {
  const target = contextMenu?.targetElement;
  if (!target) return;
  const maxZ = Math.max(...elements.map(el => el.zIndex ?? 0));
  handleElementUpdate(target.id, { zIndex: maxZ + 1 });
}, [contextMenu, elements, handleElementUpdate]);

const handleSendToBack = useCallback(() => {
  const target = contextMenu?.targetElement;
  if (!target) return;
  const minZ = Math.min(...elements.map(el => el.zIndex ?? 0));
  handleElementUpdate(target.id, { zIndex: minZ - 1 });
}, [contextMenu, elements, handleElementUpdate]);
```

- [ ] **Step 4: Add onContextMenu to the canvas div in Canvas.tsx JSX**

Find the main canvas `<div` that has `onMouseDown={handleCanvasMouseDown}` and add:
```tsx
onContextMenu={handleCanvasContextMenu}
```

- [ ] **Step 5: Add <ContextMenu /> to Canvas.tsx JSX**

After the `<ContextualBar` block, add:

```tsx
{contextMenu && (
  <ContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    targetElement={contextMenu.targetElement}
    isLocked={contextMenu.targetElement?.locked}
    canvasX={contextMenu.canvasX}
    canvasY={contextMenu.canvasY}
    onClose={() => setContextMenu(null)}
    onPaste={handlePaste}
    onFitToScreen={handleFitToScreen}
    onAddSticky={(x, y) => createElementAtPosition('sticky', x, y)}
    onAddText={(x, y) => createElementAtPosition('text', x, y)}
    onAddShape={(x, y) => { setIsShapeLibraryVisible(true); }}
    onCopy={handleCopy}
    onCut={handleCut}
    onDuplicate={() => contextMenu.targetElement && handleElementDuplicate(contextMenu.targetElement.id)}
    onDelete={() => contextMenu.targetElement && handleElementDelete(contextMenu.targetElement.id)}
    onToggleLock={() => contextMenu.targetElement && handleElementUpdate(contextMenu.targetElement.id, { locked: !contextMenu.targetElement.locked })}
    onBringToFront={handleBringToFront}
    onSendToBack={handleSendToBack}
  />
)}
```

- [ ] **Step 6: Add onContextMenu to CanvasObject.tsx**

In `src/components/Canvas/CanvasObject.tsx`, add to the interface:
```tsx
onContextMenu?: (e: React.MouseEvent, element: CanvasElement) => void;
```

Add to destructuring:
```tsx
onContextMenu,
```

Find the outermost `<div` of the element and add:
```tsx
onContextMenu={onContextMenu ? (e) => onContextMenu(e, element) : undefined}
```

Then in Canvas.tsx, pass the prop on `<CanvasObject`:
```tsx
onContextMenu={handleElementContextMenu}
```

- [ ] **Step 7: Verify TypeScript compiles and app runs**

```bash
npx tsc --noEmit
npm run dev
```

Verify:
- Right-click on empty canvas → menu appears: "Ajouter un post-it / texte / forme / Coller"
- Right-click on an element → menu: dupliquer / copier / couper / verrouiller / z-order / supprimer
- Menu closes on Escape, click outside, or after action
- Copy then Paste creates offset duplicate
- Cut removes element and pastes it offset
- Bring to front / Send to back reorders elements
- Lock toggles `locked` on element

- [ ] **Step 8: Commit**

```bash
git add src/components/Canvas/Canvas.tsx src/components/Canvas/CanvasObject.tsx
git commit -m "feat(canvas): add right-click ContextMenu for canvas and elements (Phase 4)"
```

---

## Final Verification

- [ ] **Run full build**

```bash
npm run build
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Visual smoke test in browser**

Open `npm run dev` and verify end-to-end:

1. Left toolbar visible, tools grouped, tooltips on hover, shortcuts work (V/P/E/S/T/F/I/C/L)
2. Bottom bar shows zoom %, clicking zoom % → editable input, undo/redo disabled state correct
3. Header minimal, save dot changes color on save, selecting elements shows center pill
4. Clicking element → contextual bar above it with colors + actions
5. Text element → font size control appears in bar
6. Multi-select → bar shows colors + delete only
7. Right-click canvas → add menu
8. Right-click element → full element menu
9. All existing features still work: drawing, minimap, template panel, export, comments, timer (via `···`)

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat(canvas): complete Miro-like UX redesign (toolbar left, contextual bar, context menu)"
```
