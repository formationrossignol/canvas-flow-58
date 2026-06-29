/**
 * FLOWBOARD v2 — Composants réutilisables
 * Blocs UI standardisés
 */

import React from 'react';
import { COLORS, SHADOWS } from '../tokens/colors';

// ─── TOOLBAR BUTTON
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  danger?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  active = false,
  onClick,
  danger = false,
}) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      width: 36,
      height: 36,
      borderRadius: 9,
      background: active ? COLORS.primary[500] : 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: active ? 'white' : danger ? COLORS.danger[500] : COLORS.neutral[600],
      transition: 'background 0.12s, color 0.12s',
    }}
  >
    {icon}
  </button>
);

// ─── COLOR SWATCH
interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  selected = false,
  onClick,
  label,
}) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      width: 30,
      height: 30,
      borderRadius: 7,
      background: color,
      border: selected ? `2px solid ${COLORS.primary[500]}` : `1.5px solid rgba(0,0,0,0.15)`,
      cursor: 'pointer',
      transform: selected ? 'scale(1.12)' : 'scale(1)',
      transition: 'transform 0.1s, border 0.1s',
      boxShadow: selected ? `0 0 0 2px ${COLORS.primary[300]}` : 'none',
    }}
  />
);

// ─── PANEL HEADER
interface PanelHeaderProps {
  title: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, onClose, icon }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      borderBottom: `1px solid ${COLORS.border.default}`,
      flexShrink: 0,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
        {title}
      </span>
    </div>
    {onClose && (
      <button
        onClick={onClose}
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          background: COLORS.neutral[100],
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.neutral[500],
          fontSize: 12,
        }}
      >
        ✕
      </button>
    )}
  </div>
);

// ─── SECTION LABEL
interface SectionLabelProps {
  children: React.ReactNode;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children }) => (
  <div
    style={{
      fontSize: '10.5px',
      fontWeight: 600,
      color: COLORS.neutral[500],
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 8,
    }}
  >
    {children}
  </div>
);

// ─── PROPERTY INPUT
interface PropertyInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  unit?: string;
}

export const PropertyInput: React.FC<PropertyInputProps> = ({
  label,
  value,
  onChange,
  unit,
}) => (
  <div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}
    >
      <SectionLabel>{label}</SectionLabel>
      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text.primary }}>
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{
        width: '100%',
        accentColor: COLORS.primary[500],
        cursor: 'pointer',
      }}
    />
  </div>
);

// ─── DIVIDER
export const Divider: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => (
  <div
    style={{
      background: COLORS.border.default,
      ...(vertical
        ? { width: 1, height: 16, margin: '0 2px' }
        : { height: 1, margin: '8px 0' }),
    }}
  />
);

// ─── TAG BADGE
interface TagBadgeProps {
  label: string;
  color?: string;
  onRemove?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  label,
  color = COLORS.primary[500],
  onRemove,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      fontWeight: 600,
      color,
      background: `${color}1A`,
      padding: '2px 7px',
      borderRadius: 20,
      userSelect: 'none',
    }}
  >
    {label}
    {onRemove && (
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          fontSize: 10,
          padding: 0,
          marginLeft: 2,
        }}
      >
        ✕
      </button>
    )}
  </div>
);

// ─── BUTTON (Primary, Secondary, Danger)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    primary: {
      background: COLORS.primary[500],
      color: 'white',
      boxShadow: SHADOWS.primary,
    },
    secondary: {
      background: COLORS.neutral[100],
      color: COLORS.text.primary,
      border: `1px solid ${COLORS.border.default}`,
    },
    danger: {
      background: COLORS.danger[50],
      color: COLORS.danger[500],
      border: `1px solid ${COLORS.danger[200]}`,
    },
  };

  const sizes = {
    sm: { height: 28, fontSize: 12, padding: '0 10px' },
    md: { height: 36, fontSize: 13, padding: '0 14px' },
    lg: { height: 44, fontSize: 14, padding: '0 18px' },
  };

  return (
    <button
      style={{
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'all 0.12s',
        ...variants[variant],
        ...sizes[size],
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// ─── MODAL OVERLAY
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = '540px',
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: `rgba(15, 23, 42, 0.3)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 700,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '28px 32px',
          width,
          boxShadow: SHADOWS['2xl'],
          animation: 'scaleIn 0.2s ease-out',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <PanelHeader title={title} onClose={onClose} />
        <div style={{ marginTop: 20 }}>{children}</div>
      </div>
    </div>
  );
};
