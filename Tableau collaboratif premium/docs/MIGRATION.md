# FLOWBOARD v2 — Migration Guide

Ce document explique comment migrer le DC existant vers la nouvelle architecture TypeScript modulaire.

## Phase 1 : Préparation

1. **Copier les fichiers de tokens & utilitaires** :
   ```bash
   src/tokens/colors.ts          # Palettes premium
   src/state/CanvasStateManager.ts
   src/utils/canvasHelpers.ts
   src/hooks/useCanvas.ts
   src/components/UI/SharedComponents.tsx
   ```

2. **Mettre à jour les imports dans les composants** :
   ```typescript
   // Avant
   const primaryColor = '#6366F1';
   
   // Après
   import { COLORS } from '@/tokens/colors';
   const primaryColor = COLORS.primary[500];
   ```

## Phase 2 : Remplacer les styles inline

### Avant
```jsx
style={{
  background: '#6366F1',
  color: 'white',
  boxShadow: '0 1px 4px rgba(99,102,241,0.35)',
}}
```

### Après
```jsx
import { COLORS, SHADOWS } from '@/tokens/colors';

style={{
  background: COLORS.primary[500],
  color: 'white',
  boxShadow: SHADOWS.primary,
}}
```

## Phase 3 : Intégrer CanvasStateManager

### Avant (Props drilling)
```typescript
const [elements, setElements] = useState([]);
const [selectedIds, setSelectedIds] = useState([]);
const [history, setHistory] = useState([[]]);

// ... 100 lignes de setState
```

### Après (Centralisé)
```typescript
import { CanvasStateManager } from '@/state/CanvasStateManager';

const stateManager = new CanvasStateManager();

stateManager.subscribe(state => {
  // Mettre à jour le composant
});

stateManager.addElement(element);
stateManager.undo();
```

## Phase 4 : Utiliser les hooks

```typescript
// useSelection
const { selectedIds, selectSingle, toggleSelection } = useSelection();

// useHistory
const { current, push, undo, redo } = useHistory(initialValue);

// useToast
const { addToast } = useToast();
addToast('Élément créé', 'success');
```

## Phase 5 : Remplacer les composants inline

### Avant
```jsx
<button style={{...buttonStyles}}>Créer</button>
```

### Après
```jsx
import { Button } from '@/components/UI/SharedComponents';

<Button variant="primary" onClick={handleCreate}>
  Créer
</Button>
```

## Checklist de migration

- [ ] Importer les tokens dans tous les fichiers de styles
- [ ] Remplacer les couleurs hardcodées par `COLORS.*`
- [ ] Remplacer les shadows hardcodées par `SHADOWS.*`
- [ ] Instancier `CanvasStateManager` dans App.tsx
- [ ] Connecter les composants au state manager via hooks
- [ ] Supprimer les useState pour les données globales
- [ ] Tester la persistence en localStorage
- [ ] Tester undo/redo
- [ ] Valider que l'UI reste identique

## Changements de couleurs visibles

### Avant (Multiple sources)
```
Boutons: #6366F1 (hardcoded)
Texte: #111827 (hardcoded)
Borders: rgba(15,23,42,0.07) (hardcoded)
```

### Après (Tokens centralisés)
```
Boutons: COLORS.primary[500] = #6366F1
Texte: COLORS.text.primary = #111827
Borders: COLORS.border.default = rgba(15,23,42,0.07)
```

**Visuellement : aucun changement** (mais maintenabilité +++++)

## Questions fréquentes

**Q : Ça casse le DC existant ?**  
A : Non ! La structure TypeScript s'ajoute à côté. Le DC reste fonctionnel pendant la migration.

**Q : Comment tester la nouvelle architecture ?**  
A : Créer des tests unitaires pour `CanvasStateManager` et `canvasHelpers`:
```typescript
describe('CanvasStateManager', () => {
  it('should add element', () => {
    const manager = new CanvasStateManager();
    manager.addElement(element);
    expect(manager.getState().elements).toHaveLength(1);
  });
});
```

**Q : Je dois garder le code existant ?**  
A : Oui, jusqu'à la migration complète. Coexistez côte à côte pendant la refactorisation.

## Performance

- ✅ State manager : O(1) dispatch
- ✅ Subscribers : notifiés seulement si état change
- ✅ Hooks : useCallback pour éviter les re-renders inutiles
- ✅ localStorage : debounced (sauvegarde max toutes les 2s)

## Committer cette migration

Recommandé : 1 commit volumineux pour garder l'historique propre :

```bash
git add -A
git commit -m "refactor: modularize flowboard into TypeScript architecture

Convert monolithic DC.html into organized modules:
- tokens/colors.ts: Premium indigo color system
- state/CanvasStateManager.ts: Centralized state + undo/redo
- utils/canvasHelpers.ts: Pure utilities & transformations
- hooks/useCanvas.ts: Custom React hooks
- components/UI/SharedComponents.tsx: Reusable UI components

Benefits:
- Single source of truth for state
- Easier to test & maintain
- Consistent design tokens
- Reusable component library
- TypeScript type safety

No visual changes. Full backward compatibility with DC.html.
"
```

---

**Besoin d'aide ?** Consultez `docs/ARCHITECTURE.md`
