# FlowBoard v2 — Refactorisation Complète

> **État** : Structure modulaire TypeScript + Palette Premium Indigo  
> **Version** : 2.0.0  
> **Date** : Juin 2026

## 📦 Quoi de neuf ?

### 🎨 Palette Premium Indigo
- Couleurs cohérentes et maintenables via `src/tokens/colors.ts`
- Variations 50-900 pour chaque couleur (primaire, secondaire, accent, etc.)
- Gradients et shadows prédéfinis
- Conforme aux standards WCAG AA pour l'accessibilité

### 🏗️ Architecture Modulaire
Refactorisation du monolithe DC en modules TypeScript réutilisables :

```
src/
├── tokens/colors.ts              # 🎨 Palette premium centralisée
├── state/CanvasStateManager.ts   # 🔄 Gestion d'état + undo/redo
├── utils/canvasHelpers.ts        # 🛠️ Utilitaires purs
├── hooks/useCanvas.ts            # 🪝 Hooks personnalisés
├── components/UI/                # 📦 Composants réutilisables
└── docs/
    ├── ARCHITECTURE.md           # 📐 Documentation technique
    └── MIGRATION.md              # 🚀 Guide de migration
```

### ✨ Avantages immédiats

| Aspect | Avant | Après |
|--------|-------|-------|
| **Maintenance des couleurs** | Hardcoded partout | Token unique source of truth |
| **Gestion d'état** | Props drilling | CanvasStateManager centralisé |
| **Historique** | Implémentation custom | Built-in undo/redo |
| **Réutilisabilité** | Copier-coller | Hooks + Composants |
| **Type safety** | Minimal | Full TypeScript |
| **Testabilité** | Difficile | Facile (state manager pur) |

## 🚀 Démarrage rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Importer les tokens dans vos composants
```typescript
import { COLORS, SHADOWS, GRADIENTS } from '@/tokens/colors';

// Utiliser les couleurs
style={{ background: COLORS.primary[500] }}

// Utiliser les shadows
style={{ boxShadow: SHADOWS.lg }}

// Utiliser les gradients
style={{ backgroundImage: GRADIENTS.primaryGradient }}
```

### 3. Utiliser CanvasStateManager
```typescript
import { CanvasStateManager } from '@/state/CanvasStateManager';

const manager = new CanvasStateManager();

// S'abonner aux changements
manager.subscribe(state => {
  console.log('État mis à jour:', state);
});

// Dispatcher des actions
manager.addElement(element);
manager.deleteElement(id);
manager.undo();
manager.redo();
```

### 4. Utiliser les hooks
```typescript
import { useSelection, useHistory, useToast } from '@/hooks/useCanvas';

const { selectedIds, selectSingle } = useSelection();
const { current, push, undo, redo } = useHistory(initialValue);
const { addToast } = useToast();
```

### 5. Utiliser les composants
```typescript
import { Button, ColorSwatch, Modal } from '@/components/UI/SharedComponents';

<Button variant="primary" onClick={handleClick}>
  Créer un élément
</Button>

<ColorSwatch
  color={COLORS.primary[500]}
  selected={isSelected}
  onClick={() => setColor(COLORS.primary[500])}
/>
```

## 📚 Documentation complète

- **Architecture** → `docs/ARCHITECTURE.md`
- **Guide de migration** → `docs/MIGRATION.md`
- **Types** → `src/state/CanvasStateManager.ts`

## 🔄 Compatibilité

✅ **Rétro-compatible** avec le DC.html existant  
✅ **Pas de breaking changes** pour les utilisateurs  
✅ **Coexiste** avec l'ancienne structure pendant la migration

## 🎯 Prochaines étapes

- [ ] Intégrer `CanvasStateManager` dans Canvas.tsx
- [ ] Remplacer tous les styles inline par les tokens
- [ ] Tester undo/redo exhaustivement
- [ ] Ajouter tests unitaires pour le state manager
- [ ] Implémenter collaborateurs temps réel (WebSocket)
- [ ] Déprécier le code hardcoded petit à petit

## 📦 Fichiers refactorisés

| Fichier | Lignes | Type | Description |
|---------|--------|------|-------------|
| `src/tokens/colors.ts` | 180 | TypeScript | Palette premium + variations |
| `src/state/CanvasStateManager.ts` | 280 | TypeScript | Gestion d'état centralisée |
| `src/utils/canvasHelpers.ts` | 240 | TypeScript | Utilitaires + export PNG/JSON |
| `src/hooks/useCanvas.ts` | 220 | TypeScript | 6 hooks personnalisés |
| `src/components/UI/SharedComponents.tsx` | 280 | React/TS | 9 composants réutilisables |
| `docs/ARCHITECTURE.md` | 190 | Markdown | Documentation technique |
| `docs/MIGRATION.md` | 150 | Markdown | Guide de migration |

**Total** : ~1540 lignes de code réutilisable et bien documenté

## 💡 Exemples d'usage

### Changer une couleur globalement
```typescript
// Avant : chercher & remplacer partout
// Après : 1 ligne
const primaryColor = COLORS.primary[600]; // Plus foncé
```

### Ajouter un élément avec historique
```typescript
manager.addElement({
  id: 'el-123',
  type: 'sticky',
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  color: COLORS.warning[50],
  content: 'Mon idée',
});

// Automatiquement sauvegardé en localStorage
// Undo disponible immédiatement
```

### Créer un composant UI cohérent
```typescript
import { Button, ColorSwatch, SectionLabel } from '@/components/UI/SharedComponents';
import { COLORS } from '@/tokens/colors';

export const MyPanel = () => (
  <div>
    <SectionLabel>Couleur</SectionLabel>
    <div style={{ display: 'flex', gap: 8 }}>
      {[COLORS.primary[500], COLORS.accent[500], COLORS.success[500]].map(color => (
        <ColorSwatch
          key={color}
          color={color}
          onClick={() => setColor(color)}
        />
      ))}
    </div>
    <Button variant="primary" onClick={handleApply}>
      Appliquer
    </Button>
  </div>
);
```

## 🔗 Commandes git

### Cloner et démarrer
```bash
git clone https://github.com/formationrossignol/canvas-flow-58.git
cd canvas-flow-58
npm install
npm run dev
```

### Voir les changements
```bash
git log --oneline | head -1
# refactor: modularize flowboard into TypeScript architecture

git show --stat
# src/tokens/colors.ts
# src/state/CanvasStateManager.ts
# src/utils/canvasHelpers.ts
# src/hooks/useCanvas.ts
# src/components/UI/SharedComponents.tsx
# docs/ARCHITECTURE.md
# docs/MIGRATION.md
```

## 🤝 Contribution

Les fichiers refactorisés suivent les conventions :
- **Types** : Interfaces en PascalCase (`CanvasElement`, `CanvasState`)
- **Const** : SCREAMING_SNAKE_CASE (`COLORS`, `DEFAULT_SIZES`)
- **Fonctions** : camelCase (`smoothPath`, `screenToCanvas`)
- **Hooks** : `use*` prefix (`useSelection`, `useHistory`)
- **Composants** : PascalCase (`Button`, `ColorSwatch`)

## 📞 Support

Questions sur la nouvelle architecture ?
→ Consultez `docs/ARCHITECTURE.md`

Besoin de migrer votre code ?
→ Consultez `docs/MIGRATION.md`

Bug ou suggestion ?
→ Ouvrez une issue sur GitHub

---

**Made with ❤️ for FlowBoard v2 — Juin 2026**
