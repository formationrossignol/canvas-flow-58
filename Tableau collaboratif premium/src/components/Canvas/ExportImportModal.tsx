import { useState } from "react";
import { Download, Upload, FileImage, FileText, X, FileDown, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CanvasElement } from "./Canvas";

interface ExportImportModalProps {
  isVisible: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  onImport: (elements: CanvasElement[]) => void;
  canvasTransform: { x: number; y: number; scale: number };
  onExportPDF?: () => void;
  onExportSelectedArea?: () => void;
  hasSelection?: boolean;
}

export const ExportImportModal = ({
  isVisible,
  onClose,
  elements,
  onImport,
  canvasTransform,
  onExportPDF,
  onExportSelectedArea,
  hasSelection = false
}: ExportImportModalProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsJSON = () => {
    const data = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      elements: elements,
      transform: canvasTransform
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collabboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Tableau exporté avec succès !");
  };

  const exportAsPNG = async () => {
    setIsExporting(true);
    try {
      // Create a virtual canvas for export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate bounds of all elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      elements.forEach(element => {
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x + element.width);
        maxY = Math.max(maxY, element.y + element.height);
      });

      const padding = 50;
      const width = Math.max(800, maxX - minX + padding * 2);
      const height = Math.max(600, maxY - minY + padding * 2);
      
      canvas.width = width;
      canvas.height = height;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw elements
      for (const element of elements) {
        const x = element.x - minX + padding;
        const y = element.y - minY + padding;

        ctx.save();
        ctx.globalAlpha = element.opacity || 1;

        if (element.type === 'sticky' || element.type === 'rectangle') {
          ctx.fillStyle = element.color;
          if (element.borderRadius) {
            // Rounded rectangle
            const radius = element.borderRadius;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + element.width - radius, y);
            ctx.quadraticCurveTo(x + element.width, y, x + element.width, y + radius);
            ctx.lineTo(x + element.width, y + element.height - radius);
            ctx.quadraticCurveTo(x + element.width, y + element.height, x + element.width - radius, y + element.height);
            ctx.lineTo(x + radius, y + element.height);
            ctx.quadraticCurveTo(x, y + element.height, x, y + element.height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(x, y, element.width, element.height);
          }
        } else if (element.type === 'circle') {
          ctx.fillStyle = element.color;
          ctx.beginPath();
          ctx.ellipse(x + element.width/2, y + element.height/2, element.width/2, element.height/2, 0, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Draw text content
        if (element.content) {
          ctx.fillStyle = element.type === 'text' ? element.color : '#000000';
          ctx.font = `${element.fontSize || 14}px Inter, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          
          const lines = element.content.split('\n');
          const lineHeight = (element.fontSize || 14) * 1.2;
          lines.forEach((line, index) => {
            ctx.fillText(line, x + 10, y + 10 + index * lineHeight, element.width - 20);
          });
        }

        ctx.restore();
      }

      // Download the image
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collabboard-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Image exportée avec succès !");
      }, 'image/png');

    } catch (error) {
      toast.error("Erreur lors de l'export de l'image");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.elements && Array.isArray(data.elements)) {
          onImport(data.elements);
          onClose();
          toast.success("Tableau importé avec succès !");
        } else {
          toast.error("Format de fichier invalide");
        }
      } catch (error) {
        toast.error("Erreur lors de l'importation du fichier");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export & Import</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-3">
              {onExportPDF && (
                <Button 
                  onClick={onExportPDF}
                  className="w-full justify-start gap-3 h-12"
                  variant="outline"
                >
                  <FileDown size={20} />
                  <div className="text-left">
                    <div className="font-medium">PDF Complet</div>
                    <div className="text-xs text-muted-foreground">Exporter tout le board en PDF</div>
                  </div>
                </Button>
              )}
              
              {onExportSelectedArea && hasSelection && (
                <Button 
                  onClick={onExportSelectedArea}
                  className="w-full justify-start gap-3 h-12"
                  variant="outline"
                >
                  <Crop size={20} />
                  <div className="text-left">
                    <div className="font-medium">PDF Sélection</div>
                    <div className="text-xs text-muted-foreground">Exporter les éléments sélectionnés</div>
                  </div>
                </Button>
              )}
              
              <Button 
                onClick={exportAsJSON}
                className="w-full justify-start gap-3 h-12"
                variant="outline"
              >
                <FileText size={20} />
                <div className="text-left">
                  <div className="font-medium">Fichier JSON</div>
                  <div className="text-xs text-muted-foreground">Format natif CollabBoard</div>
                </div>
              </Button>
              
              <Button 
                onClick={exportAsPNG}
                disabled={isExporting}
                className="w-full justify-start gap-3 h-12"
                variant="outline"
              >
                <FileImage size={20} />
                <div className="text-left">
                  <div className="font-medium">
                    {isExporting ? "Export en cours..." : "Image PNG"}
                  </div>
                  <div className="text-xs text-muted-foreground">Image haute qualité</div>
                </div>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="w-full justify-start gap-3 h-12 cursor-pointer flex items-center px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Upload size={20} />
                  <div className="text-left">
                    <div className="font-medium">Importer un fichier JSON</div>
                    <div className="text-xs text-muted-foreground">Restaurer un tableau sauvegardé</div>
                  </div>
                </div>
              </label>
              
              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <strong>Note :</strong> L'importation remplacera tous les éléments actuels du tableau. Pensez à exporter votre travail actuel avant d'importer.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};