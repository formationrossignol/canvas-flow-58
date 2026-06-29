/**
 * FLOWBOARD v2 — Color Tokens
 * Système de couleurs premium & cohérent
 * Exportable pour Tailwind, CSS, React
 */

export const COLORS = {
  // ─── PRIMAIRE (Indigo Premium)
  primary: {
    50: '#F0F3FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // ─── SECONDAIRE (Violet)
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // ─── ACCENT (Turquoise)
  accent: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // ─── SUCCÈS (Émeraude)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBFBDC',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#145231',
  },

  // ─── ALERTE (Ambre)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // ─── DANGER (Rouge)
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // ─── GRIS (Neutre)
  neutral: {
    50: '#F8FAFC',
    100: '#F1F3F6',
    150: '#E8EAF0',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // ─── BACKGROUNDS
  bg: {
    dark: '#0F172A',      // Surfaces sombres
    light: '#F1F5F9',     // Canvas, surfaces claires
    surface: '#FAFAFB',   // Modales, panneaux
    overlay: 'rgba(15, 23, 42, 0.3)', // Backdrop
  },

  // ─── TEXTE
  text: {
    primary: '#0F172A',     // Sur fond clair
    secondary: '#64748B',   // Texte secondaire
    tertiary: '#94A3B8',    // Texte désactivé
    light: '#F1F5F9',       // Sur fond sombre
    muted: '#CBD5E1',       // Gris clair
  },

  // ─── BORDERS & DIVIDERS
  border: {
    default: 'rgba(15, 23, 42, 0.07)',
    light: 'rgba(15, 23, 42, 0.04)',
    strong: 'rgba(15, 23, 42, 0.12)',
  },
} as const;

// ─── PALETTES COMPOSITES (Sticky notes, etc.)
export const STICKY_COLORS = [
  { bg: '#FFF7D6', border: '#F59E0B', label: 'Jaune crème' },
  { bg: '#FADADD', border: '#F472B6', label: 'Rose poudré' },
  { bg: '#FFD8B1', border: '#F97316', label: 'Pêche' },
  { bg: '#E6E0FF', border: '#8B5CF6', label: 'Lavande' },
  { bg: '#DCEEFF', border: '#3B82F6', label: 'Bleu glacier' },
  { bg: '#DDF5E5', border: '#22C55E', label: 'Vert menthe' },
] as const;

export const PEN_COLORS = [
  { value: '#1F2937', label: 'Noir' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#10B981', label: 'Vert' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#F59E0B', label: 'Ambre' },
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#F97316', label: 'Orange' },
] as const;

// ─── UTILITIES
export const getColorByName = (name: string, intensity = 500) => {
  const [colorName, level] = name.split('-');
  const actualLevel = level ? parseInt(level) : intensity;
  return COLORS[colorName as keyof typeof COLORS]?.[actualLevel as keyof any] || COLORS.primary[500];
};

// ─── GRADIENTS PREMIUM
export const GRADIENTS = {
  primaryGradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  accentGradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
  successGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  darkGradient: 'linear-gradient(135deg, #0F1117 0%, #1E293B 100%)',
  stickyGradient: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)',
} as const;

// ─── SHADOWS PREMIUM
export const SHADOWS = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.10)',
  xl: '0 12px 32px rgba(0, 0, 0, 0.12)',
  '2xl': '0 24px 64px rgba(0, 0, 0, 0.18)',
  
  // Spécifiques
  sticky: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  stickySelected: '0 0 0 2px #6366F1, 0 8px 24px rgba(0, 0, 0, 0.10)',
  primary: '0 1px 4px rgba(99, 102, 241, 0.35)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 1)',
} as const;

// ─── OPACITIES
export const OPACITIES = {
  disabled: 0.4,
  hover: 0.12,
  active: 0.15,
  backdrop: 0.3,
  focus: 0.08,
} as const;
