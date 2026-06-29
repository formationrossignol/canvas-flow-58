import { useRef } from "react";
import { FileImage, FileText, Upload, X, Crop } from "lucide-react";
import { toast } from "sonner";
import { CanvasElement } from "./Canvas";

interface ExportImportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onExportPNG: () => void;
  onExportPNGSelected: () => void;
  onExportPDF: () => void;
  onExportPDFSelected: () => void;
  onExportJSON: () => void;
  onImport: (elements: CanvasElement[]) => void;
  hasSelection: boolean;
}

const BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 14px', borderRadius: 10,
  border: '1px solid rgba(15,23,42,0.09)',
  background: '#FAFAFB', cursor: 'pointer',
  fontFamily: 'inherit', textAlign: 'left', width: '100%',
  transition: 'background 0.12s, border-color 0.12s',
};

const BTN_DISABLED: React.CSSProperties = {
  ...BTN,
  opacity: 0.38,
  cursor: 'not-allowed',
  pointerEvents: 'none',
};

const LABEL: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#0F172A', lineHeight: 1.3 };
const SUB: React.CSSProperties = { fontSize: 11, color: '#64748B', marginTop: 2 };
const ICON_WRAP = (color: string): React.CSSProperties => ({
  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
  background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
});

export const ExportImportModal = ({
  isVisible, onClose,
  onExportPNG, onExportPNGSelected,
  onExportPDF, onExportPDFSelected,
  onExportJSON,
  onImport, hasSelection,
}: ExportImportModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.elements && Array.isArray(data.elements)) {
          onImport(data.elements);
          onClose();
          toast.success('Tableau importé avec succès');
        } else {
          toast.error('Format de fichier invalide');
        }
      } catch {
        toast.error("Erreur lors de l'importation");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isVisible) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.22)', backdropFilter: 'blur(4px)' }} />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#FFFFFF', borderRadius: 16,
        border: '1px solid rgba(15,23,42,0.08)',
        boxShadow: '0 24px 56px rgba(15,23,42,0.14), 0 4px 12px rgba(15,23,42,0.06)',
        width: 420, maxWidth: 'calc(100vw - 32px)',
        padding: '20px 20px 24px',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: -0.3 }}>Exporter / Importer</span>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(15,23,42,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* EXPORT section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Exporter
          </div>

          {/* Image PNG row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <button style={BTN} onClick={() => { onExportPNG(); onClose(); }}>
              <div style={ICON_WRAP('rgba(79,70,229,0.10)')}>
                <FileImage size={16} color="#4F46E5" />
              </div>
              <div>
                <div style={LABEL}>Image PNG</div>
                <div style={SUB}>Tout le canvas</div>
              </div>
            </button>
            <button style={hasSelection ? BTN : BTN_DISABLED} onClick={() => { onExportPNGSelected(); onClose(); }}>
              <div style={ICON_WRAP('rgba(79,70,229,0.10)')}>
                <Crop size={16} color="#4F46E5" />
              </div>
              <div>
                <div style={LABEL}>PNG zone</div>
                <div style={SUB}>{hasSelection ? 'Sélection active' : 'Aucune sélection'}</div>
              </div>
            </button>
          </div>

          {/* PDF row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <button style={BTN} onClick={() => { onExportPDF(); onClose(); }}>
              <div style={ICON_WRAP('rgba(239,68,68,0.10)')}>
                <FileText size={16} color="#EF4444" />
              </div>
              <div>
                <div style={LABEL}>PDF</div>
                <div style={SUB}>Tout le canvas</div>
              </div>
            </button>
            <button style={hasSelection ? BTN : BTN_DISABLED} onClick={() => { onExportPDFSelected(); onClose(); }}>
              <div style={ICON_WRAP('rgba(239,68,68,0.10)')}>
                <Crop size={16} color="#EF4444" />
              </div>
              <div>
                <div style={LABEL}>PDF zone</div>
                <div style={SUB}>{hasSelection ? 'Sélection active' : 'Aucune sélection'}</div>
              </div>
            </button>
          </div>

          {/* JSON */}
          <button style={BTN} onClick={() => { onExportJSON(); onClose(); }}>
            <div style={ICON_WRAP('rgba(20,184,166,0.10)')}>
              <FileText size={16} color="#14B8A6" />
            </div>
            <div>
              <div style={LABEL}>Fichier JSON</div>
              <div style={SUB}>Format natif — sauvegarde complète</div>
            </div>
          </button>
        </div>

        {/* Separator */}
        <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', marginBottom: 20 }} />

        {/* IMPORT section */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Importer
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          <button style={BTN} onClick={() => fileInputRef.current?.click()}>
            <div style={ICON_WRAP('rgba(245,158,11,0.10)')}>
              <Upload size={16} color="#F59E0B" />
            </div>
            <div>
              <div style={LABEL}>Importer un fichier JSON</div>
              <div style={SUB}>Remplace les éléments actuels</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
