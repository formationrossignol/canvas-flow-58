# FlowBoard v2 — Documentation d'architecture

## 📁 Structure des fichiers

```
src/
├── tokens/
│   └── colors.ts                 # Palette de couleurs premium (Indigo)
├── state/
│   └── CanvasStateManager.ts     # Gestion d'état centralisée
├── utils/
│   └── canvasHelpers.ts          # Utilitaires & fonctions pures
├── hooks/
│   └── useCanvas.ts              # Hooks personnalisés
├── components/
│   ├── UI/
│   │   └── SharedComponents.tsx  # Composants réutilisables
│   ├── Canvas/
│   │   ├── Canvas.tsx
│   │   ├── CanvasToolbar.tsx
│   │   ├── PropertyPanel.tsx
│   │   └── [autres composants]
│   └── App.tsx
└── index.tsx
```

## 🎨 Palette Premium (Indigo)

**Couleurs principales :**
- Primaire : `#6366F1` (Indigo)
- Secondaire : `#8B5CF6` (Violet)
- Accent : `#EC4899` (Rose)
- Succès : `#10B981` (Émeraude)
- Alerte : `#F59E0B` (Ambre)
- Danger : `#EF4444` (Rouge)

Consultez `src/tokens/colors.ts` pour la palette complète avec variations (50-900).

## 🏗️ Gestion d'état

### CanvasStateManager

Centralise tout l'état de l'application :

```typescript
const manager = new CanvasStateManager();
const unsubscribe = manager.subscribe(state => {
  // Réagir aux changements d'état
});

// Dispatchers
manager.addElement(element);
manager.deleteElement(id);
manager.updateElement(id, { color: '#6366F1' });
manager.selectElements([id1, id2]);
manager.undo();
manager.redo();
```

**Avantages :**
- Logique d'état centralisée
- Historique (undo/redo) intégré
- Persistence automatique en localStorage
- Facile à tester unitairement

## 🪝 Hooks personnalisés

### useSelection
```typescript
const { selectedIds, selectSingle, toggleSelection, clearSelection } = useSelection();
```

### useHistory
```typescript
const { current, push, undo, redo, canUndo, canRedo } = useHistory(initialValue);
```

### useDrag
```typescript
const { isDragging, deltaX, deltaY, handleMouseDown } = useDrag();
```

### useToast
```typescript
const { toasts, addToast } = useToast();
addToast('Action réussie', 'success');
```

## 🛠️ Utilitaires

### screenToCanvas / canvasToScreen
Conversion des coordonnées :
```typescript
const canvasCoords = screenToCanvas(clientX, clientY, rect, transform);
```

### smoothPath
Génère un chemin SVG lissé pour le dessin au stylo :
```typescript
const pathD = smoothPath(points); // points: [number, number][]
```

### getBoundingBox
Calcule la boîte englobante de plusieurs éléments :
```typescript
const bbox = getBoundingBox(elements);
// { minX, minY, maxX, maxY, width, height }
```

### relativeTime
Formate un timestamp en temps relatif :
```typescript
relativeTime(Date.now() - 300000); // "5m"
```

## 📦 Composants réutilisables

Tous les composants UI sont dans `src/components/UI/SharedComponents.tsx` :

- `<ToolbarButton />` — Bouton de barre d'outils
- `<ColorSwatch />` — Nuancier de couleur cliquable
- `<PanelHeader />` — En-tête de panneau
- `<SectionLabel />` — Label de section
- `<PropertyInput />` — Champ de propriété avec slider
- `<Divider />` — Séparateur
- `<TagBadge />` — Badge de tag
- `<Button />` — Bouton (primary/secondary/danger)
- `<Modal />` — Fenêtre modale

**Usage :**
```typescript
import { Button, ColorSwatch, Modal } from '@/components/UI/SharedComponents';

<Button variant="primary" onClick={handleClick}>
  Créer un élément
</Button>

<ColorSwatch
  color="#6366F1"
  selected={true}
  onClick={() => setColor('#6366F1')}
  label="Indigo"
/>
```

## 🔄 Flux de données

```
User Action
    ↓
Event Handler (Component)
    ↓
CanvasStateManager.dispatch(action)
    ↓
State Update + History Push
    ↓
Subscribers notified
    ↓
Component Re-render (via hooks)
```

## 💾 Persistence

L'état est automatiquement sauvegardé en localStorage sous la clé `flowboard_v2`.

Pour charger l'état au démarrage :
```typescript
manager.loadState();
```

## 📤 Export/Import

### PNG Export
```typescript
import { renderToPNG } from '@/utils/canvasHelpers';

const blob = await renderToPNG(elements, {
  padding: 48,
  backgroundColor: '#F1F3F6',
});
```

### JSON Export/Import
```typescript
import { exportToJSON, importFromJSON } from '@/utils/canvasHelpers';

const json = exportToJSON(elements, boardTitle);
const { elements, boardTitle } = importFromJSON(jsonString);
```

## 🎯 Points clés de refactorisation

1. ✅ **Tokens séparés** — Coloration cohérente via `colors.ts`
2. ✅ **État centralisé** — Logique métier dans `CanvasStateManager`
3. ✅ **Utilitaires purs** — Fonctions sans side-effects dans `canvasHelpers.ts`
4. ✅ **Hooks réutilisables** — Logique UI partagée dans `useCanvas.ts`
5. ✅ **Composants UI** — Blocs visuels dans `SharedComponents.tsx`

## 🚀 Prochaines étapes

- [ ] Intégrer les hooks dans les composants Canvas
- [ ] Remplacer les styles inline par les tokens
- [ ] Tester unitairement CanvasStateManager
- [ ] Ajouter les collaborateurs en temps réel (WebSocket)
- [ ] Implémenter les templates avancés

## 📝 Committer cette structure

```bash
git add src/
git commit -m "refactor: extract state, hooks, utils, and components into modular TypeScript

- Move colors to dedicated token system (Indigo premium palette)
- Implement CanvasStateManager for centralized state + history
- Extract pure utilities into canvasHelpers.ts
- Create custom hooks (useSelection, useHistory, useDrag, useToast)
- Componentize shared UI elements (Button, Modal, ColorSwatch, etc.)
- Add comprehensive type definitions (CanvasElement, CanvasState, etc.)
- Maintain localStorage persistence
- 100% backward compatible with existing DC

BREAKING CHANGE: Color values now come from tokens/colors.ts
"
```
