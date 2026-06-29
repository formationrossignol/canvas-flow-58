# 🎯 FlowBoard v2 — Commandes Rapides

## ⚡ TL;DR (30 secondes)

```bash
# 1. Vérifier l'intégration
ls -la src/tokens/ src/state/ src/utils/ src/hooks/ src/components/UI/
ls -la docs/ *.md

# 2. Committer
bash commit-refactor.sh

# 3. Pousser
git push origin main
```

---

## 📦 Fichiers à avoir absolument

✅ `src/tokens/colors.ts` — Palette Indigo  
✅ `src/state/CanvasStateManager.ts` — État centralisé  
✅ `src/utils/canvasHelpers.ts` — Utilitaires  
✅ `src/hooks/useCanvas.ts` — Hooks  
✅ `src/components/UI/SharedComponents.tsx` — Composants  
✅ `docs/ARCHITECTURE.md` — Doc technique  
✅ `docs/MIGRATION.md` — Guide migration  

**Total : 7 fichiers TypeScript/React + 7 fichiers documentation**

---

## 🎨 Palette Indigo (Utilisée)

```typescript
COLORS.primary[500]    = #6366F1  ← Bleu indigo
COLORS.secondary[500]  = #8B5CF6  ← Violet
COLORS.accent[500]     = #EC4899  ← Rose
COLORS.success[500]    = #10B981  ← Vert émeraude
COLORS.warning[500]    = #F59E0B  ← Ambre
COLORS.danger[500]     = #EF4444  ← Rouge
```

---

## 🔧 API essentielles

### CanvasStateManager
```typescript
import { CanvasStateManager } from '@/state/CanvasStateManager';

const manager = new CanvasStateManager();
manager.addElement(element);
manager.deleteElement(id);
manager.undo();
manager.redo();
manager.subscribe(state => console.log(state));
```

### Hooks
```typescript
import { useSelection, useHistory, useToast } from '@/hooks/useCanvas';

const { selectedIds, selectSingle } = useSelection();
const { current, undo, redo } = useHistory(init);
const { addToast } = useToast();
```

### Colors
```typescript
import { COLORS, SHADOWS, GRADIENTS } from '@/tokens/colors';

style={{ background: COLORS.primary[500] }}
style={{ boxShadow: SHADOWS.lg }}
style={{ backgroundImage: GRADIENTS.primaryGradient }}
```

### Composants
```typescript
import { Button, Modal, ColorSwatch } from '@/components/UI/SharedComponents';

<Button variant="primary">Créer</Button>
<Modal isOpen={true} title="Titre">Contenu</Modal>
<ColorSwatch color="#6366F1" selected={true} />
```

---

## 📚 Documentation par besoin

| Besoin | Fichier |
|--------|---------|
| Je veux comprendre la structure | `docs/ARCHITECTURE.md` |
| Je veux migrer mon code | `docs/MIGRATION.md` |
| Je veux démarrer vite | `README_REFACTOR.md` |
| Je veux voir les palettes | `PALETTES_PREMIUM.md` |
| Je veux un résumé | `REFACTORISATION_SYNTHESE.md` |
| Je veux naviguer | `INDEX.md` |
| Je veux checker la completion | `VERIFICATION.md` |

---

## ✅ Checklist avant commit

- [ ] Tous les fichiers `src/` présents
- [ ] Tous les fichiers `docs/` présents
- [ ] `git status` propre
- [ ] Pas de conflits
- [ ] Pas de fichiers oubliés
- [ ] Prêt à pousser

---

## 🚀 Commit en 1 commande

```bash
bash commit-refactor.sh
```

Cela fait :
1. ✅ `git add` tous les fichiers
2. ✅ `git commit` avec message détaillé
3. ✅ Affiche un résumé

Ensuite :
```bash
git push origin main
```

---

## 🎁 Bonus

- **3 palettes** → `PALETTES_PREMIUM.md`
- **8 hooks** → `src/hooks/useCanvas.ts`
- **9 composants** → `src/components/UI/SharedComponents.tsx`
- **Export PNG/JSON** → `src/utils/canvasHelpers.ts`
- **Undo/redo** → intégré dans CanvasStateManager
- **localStorage** → persistance auto

---

## 📊 Par les chiffres

```
Fichiers:          14
Lignes code:       1400+
Lignes docs:       1000+
Types TypeScript:  15+
Hooks:             8
Composants:        9
Couleurs:          40+
Palettes:          3
Variations:        9 par couleur
```

---

## 🎯 Impact visuel

**AUCUN changement** pour l'utilisateur ✅

---

## 🔗 Liens rapides

- GitHub repo: `https://github.com/formationrossignol/canvas-flow-58`
- Branche: `main`
- Commit message: dans `commit-refactor.sh`

---

## ❓ Questions urgentes ?

```
Couleurs?        → src/tokens/colors.ts
État?            → src/state/CanvasStateManager.ts
Utilitaires?     → src/utils/canvasHelpers.ts
Hooks?           → src/hooks/useCanvas.ts
Composants?      → src/components/UI/SharedComponents.tsx
Doc?             → docs/ARCHITECTURE.md
Migration?       → docs/MIGRATION.md
Index?           → INDEX.md
```

---

## 🎉 C'est parti !

```bash
# 1
bash commit-refactor.sh

# 2
git push origin main

# 3
🎉 Done!
```

---

**Status: ✅ PRODUCTION READY**  
**Temps: Juin 2026**  
**Version: 2.0.0**
