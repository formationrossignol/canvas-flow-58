# Canvas UX Redesign — Miro-like Ergonomics

**Date:** 2026-06-28  
**Status:** Approved — ready for implementation

---

## Understanding Summary

- **What:** Full UX layout redesign of the canvas editor to match Miro/Klaxoon ergonomics
- **Why:** Current UX has a bottom-center toolbar (10 tools in one row), a heavy header, and a side property panel — all feel cluttered compared to industry standards
- **Who:** Users of the collaborative canvas tool
- **Scope:** Canvas page only (`/canvas/:id`) — Dashboard, AppSidebar, and backend/save logic untouched
- **Design system:** Arcade Pop (Fredoka/Nunito, warm colors) stays unchanged — only layout and behavior change
- **Non-goals:** Copying Miro/Klaxoon pixel-perfect; adding new features; changing AppSidebar navigation

---

## Assumptions

- AppSidebar (left nav) remains; left toolbar sits to the right of it when sidebar is open
- MiniMap stays bottom-right, unchanged
- All existing keyboard shortcuts preserved
- Timer moved to `···` menu (it's a utility, not a drawing mode)
- "Group" feature not in scope (not currently in app)
- PropertyPanel can be removed entirely — ContextualBar replaces all frequent actions; advanced props (tags, exact dimensions) accessible via context menu or deferred to later phase

---

## Decisions Log

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Toolbar vertical left | Bottom-center (current), bottom redesigned | Industry standard (Miro/Figma); separates modes from actions |
| Bottom bar for zoom+undo | Zoom in toolbar, zoom bottom-right only | Separates "mode tools" from "canvas navigation" cleanly |
| Floating contextual bar above selection | Side panel (current), right panel | No screen real estate cost; action is spatially close to object |
| Rich right-click context menu | No menu, minimal menu | Core Miro ergonomic; discovered actions without hunting toolbar |
| Phased rebuild (4 phases) | Big bang, CSS repositioning | Lower risk; canvas is complex; each phase independently testable |
| Header balanced (dynamic center) | Minimal (Miro), Rich (current) | Minimal at rest; context appears when relevant — no noise |
| Timer in `···` menu | Timer in toolbar | Timer is occasional utility, not a drawing mode |

---

## Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (48px)  logo · title · dot · [dynamic] · avatars · Share · ···  │
├──┬──────────────────────────────────────────────────────┤
│  │                                                      │
│ T│              CANVAS (infinite)                       │
│ O│                                                      │
│ O│    [contextual bar floats above selected element]    │
│ L│                                                      │
│ S│                                          [MINIMAP]   │
│  │                                                      │
├──┴──────────────────────────────────────────────────────┤
│         BOTTOM BAR  ↩ ↪ | − 100% + | ⊡                 │
└─────────────────────────────────────────────────────────┘
```

### Component Map

| New component | Replaces | Location |
|---|---|---|
| `ToolbarLeft.tsx` | `CanvasToolbar.tsx` | `fixed left-3 top-1/2 -translate-y-1/2` |
| `BottomBar.tsx` | part of `CanvasToolbar.tsx` | `fixed bottom-3 left-1/2 -translate-x-1/2` |
| `ContextualBar.tsx` | `PropertyPanel.tsx` | `absolute`, positioned above selection |
| `ContextMenu.tsx` | _(new)_ | `fixed`, at cursor position (React portal) |

`CanvasHeader.tsx` is refactored in-place (no rename).

---

### Phase 1 — Toolbar Rebuild

**New: `ToolbarLeft.tsx`**

Vertical pill, 3 groups separated by dividers:

| Group | Tools | Shortcut |
|---|---|---|
| Mode | Select, Pen, Eraser | V P E |
| Create | Sticky, Text, Shapes, Image | S T F I |
| Collaborate | Comment, Connect | C L |

- Active tool highlighted with `bg-primary` (purple)
- Tooltip on hover: label + shortcut key
- Clicking a "create" tool switches mode; element drops on next canvas click (behavior change from current auto-add-on-tool-click)
- "Shapes" tool (F) opens the existing `ShapeLibrary` panel — no new component needed, just a new trigger

**New: `BottomBar.tsx`**

Slim floating pill, centered:

```
↩  ↪  |  −  100%  +  |  ⊡
```

- Undo/Redo: disabled state at 30% opacity
- Zoom %: clickable → input to type exact value
- Fit-to-screen (⊡): `Ctrl+Shift+H`
- Zoom range: 10% – 300%

**Breaking change in `Canvas.tsx`:** remove `CanvasToolbar` import/usage, add `ToolbarLeft` + `BottomBar`.

---

### Phase 2 — Header Redesign

Refactor `CanvasHeader.tsx`:

**Left (fixed):**
- SidebarTrigger
- Logo mark (small purple square, links to `/`)
- Separator
- Board title (editable input, same as now)
- Save status dot: green (saved) / orange+pulse (saving) / red (error) — tooltip on hover with text

**Center (dynamic):**
- At rest: empty
- 1+ elements selected: `"N éléments sélectionnés"` pill (purple tint) + Duplicate shortcut
- While saving: nothing (dot handles it)

**Right (fixed):**
- Collaborator avatars (max 4, +N overflow)
- Share button
- `···` dropdown: Save now / Templates / Export / Comments / Timer / Copy board ID / separator / Settings / Reset board

**Removed from header:** "En ligne" badge, element count badge, save status text, Comments button (→ moved to `···` menu).

---

### Phase 3 — Contextual Bar

**New: `ContextualBar.tsx`**

Rendered as `position: absolute` child of canvas container. Position calculated from element bounding box transformed to screen coords:

```ts
const barX = (el.x + el.width / 2) * scale + panX
const barY = el.y * scale + panY - BAR_HEIGHT - 12
// Flip below if barY < HEADER_HEIGHT + 8
```

**Content — Post-it / Shape selected:**
- 5 color swatches (most used) + `+` for full palette
- Separator
- Opacity % (click → slider appears)
- Separator  
- Duplicate icon / Lock icon / Delete icon (red tint)

**Content — Text selected:**
- Font size control (− value +)
- Bold / Italic toggle
- 3 color swatches + `+`
- Separator
- Duplicate / Delete

**Multi-select (2+ elements):**
- Color swatches only
- Separator
- Duplicate / Delete

PropertyPanel.tsx can be deleted after this phase.

---

### Phase 4 — Context Menu

**New: `ContextMenu.tsx`**

React portal (`document.body`), `position: fixed` at `{x: e.clientX, y: e.clientY}`.

Close on: click outside, Escape key, scroll.

**On canvas (no element hit):**
```
📝 Ajouter un post-it       S
T  Ajouter du texte         T
◻  Ajouter une forme
───
📋 Coller                  ⌘V
⊡  Ajuster à l'écran      ⌘⇧H
```

**On element:**
```
⊞  Dupliquer               ⌘D
📋 Copier                  ⌘C
✂️  Couper                  ⌘X
───
🔒 Verrouiller / Déverrouiller
⬆  Mettre au premier plan
⬇  Envoyer en arrière-plan
───
🗑  Supprimer               ⌫   (red)
```

Canvas `onContextMenu`: `e.preventDefault()`, record cursor position, set element hit target.  
Element `onContextMenu`: `e.stopPropagation()` + same.

---

## Non-Functional

- All interactions stay under 16ms paint budget (no layout thrash from contextual bar repositioning)
- Contextual bar position recalculated on element move/resize
- Context menu closes immediately on Escape — no animation delay
- No accessibility regressions: all toolbar buttons keep `title` + `aria-label`
