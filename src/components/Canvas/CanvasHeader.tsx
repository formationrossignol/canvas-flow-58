import { useState } from "react";
import {
  Share2, Copy, QrCode, Mail,
  MoreHorizontal, Save, RefreshCcw, Layout, Download,
  MessageCircle, Timer, ClipboardCopy, Settings, Monitor, Bell, Layers,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  elementCount?: number;
  onPresent?: () => void;
}

export const CanvasHeader = ({
  boardTitle, onTitleChange, collaborators,
  onOpenTemplates, onOpenExport, onOpenComments,
  selectedCount = 0, onDuplicateSelected,
  boardId, lastSavedAt, isSaving, onSaveNow, onResetBoard, onToggleTimer,
  elementCount = 0, onPresent,
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
    if (!emailInvite?.includes('@')) { toast.error("Adresse email invalide"); return; }
    window.location.href = `mailto:${emailInvite}?subject=Invitation à collaborer sur ${boardTitle}&body=Rejoignez-moi : ${window.location.href}`;
    toast.success("Email d'invitation ouvert");
    setEmailInvite("");
  };

  const saveText = isSaving ? 'Enregistrement...' : lastSavedAt ? 'Sauvegardé' : 'Non enregistré';
  const saveDot = isSaving ? 'bg-yellow-400 animate-pulse' : lastSavedAt ? 'bg-emerald-500' : 'bg-red-400';

  return (
    <header
      className="absolute top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4"
      style={{ height: 52, borderBottom: '1px solid rgba(15,23,42,0.07)', flexShrink: 0 }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger
          className="w-[30px] h-[30px] rounded-[7px] text-gray-500 hover:bg-gray-100 transition-colors"
          style={{ border: '1px solid rgba(15,23,42,0.09)' }}
        />
        <div className="h-4 w-px bg-black/[0.07]" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-[5px] text-[13px] text-gray-400 flex-shrink-0 select-none">
          <span>Design</span>
          <span className="text-gray-300">/</span>
        </div>

        {/* Board title */}
        <input
          type="text"
          value={boardTitle}
          onChange={e => onTitleChange(e.target.value)}
          className="text-[14px] font-semibold text-gray-900 bg-transparent border-none outline-none cursor-text min-w-[60px] max-w-[200px] px-1 py-0.5 rounded-[5px] hover:bg-gray-50 transition-colors"
          style={{ letterSpacing: '-0.3px' }}
          placeholder="Titre du tableau"
        />

        <div className="h-4 w-px bg-black/[0.07]" />

        {/* Save status */}
        <div className="flex items-center gap-[5px] text-[12px] text-gray-400 flex-shrink-0 select-none">
          <div className={`w-[5px] h-[5px] rounded-full ${saveDot}`} />
          <span>{saveText}</span>
        </div>

        {/* Element count pill */}
        <div
          className="flex items-center gap-1 px-2 py-[3px] rounded-full text-[11.5px] text-gray-500 flex-shrink-0 select-none"
          style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.07)' }}
        >
          <Layers size={11} />
          <span>{elementCount}</span>
        </div>
      </div>

      {/* Center — collaborators (absolute) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 pointer-events-none select-none">
        {collaborators.length > 0 && (
          <>
            <div className="flex items-center">
              {collaborators.slice(0, 4).map((c, i) => (
                <div
                  key={c.id}
                  className="w-[26px] h-[26px] rounded-full border-[2px] border-white flex items-center justify-center text-[10px] font-bold text-white -ml-[6px] first:ml-0"
                  style={{ backgroundColor: c.color, zIndex: collaborators.length - i }}
                  title={c.name}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {collaborators.length > 4 && (
                <div
                  className="w-[26px] h-[26px] rounded-full border-[2px] border-white flex items-center justify-center text-[9px] font-medium -ml-[6px]"
                  style={{ background: '#E5E7EB', color: '#6B7280' }}
                >
                  +{collaborators.length - 4}
                </div>
              )}
            </div>
            <div
              className="flex items-center gap-[5px] rounded-full px-[9px] py-1"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
              <div className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
              <span className="text-[11.5px] font-medium" style={{ color: '#059669' }}>
                {collaborators.length} en ligne
              </span>
            </div>
          </>
        )}
        {selectedCount > 0 && (
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1 pointer-events-auto"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}
          >
            <span className="text-xs font-semibold text-indigo-600">
              {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
            {onDuplicateSelected && (
              <button
                onClick={onDuplicateSelected}
                className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
              >
                <Copy size={10} /> Dupliquer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Présenter */}
        <button
          onClick={onPresent}
          className="h-[30px] px-[10px] rounded-[7px] text-[12.5px] font-medium text-gray-700 flex items-center gap-[5px] hover:bg-gray-50 transition-colors"
          style={{ border: '1px solid rgba(15,23,42,0.09)' }}
        >
          <Monitor size={13} />
          Présenter
        </button>

        {/* Notifications */}
        <button
          className="h-[30px] w-[30px] rounded-[7px] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative"
          style={{ border: '1px solid rgba(15,23,42,0.09)' }}
          onClick={onOpenComments}
          title="Commentaires"
        >
          <Bell size={14} />
        </button>

        {/* Partager */}
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="h-[30px] px-[10px] rounded-[7px] text-[12.5px] font-semibold text-white flex items-center gap-[5px] hover:opacity-90 transition-opacity"
              style={{ background: '#6366F1' }}
            >
              <Share2 size={13} />
              Partager
            </button>
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
                  <Input type="email" placeholder="exemple@email.com" value={emailInvite} onChange={e => setEmailInvite(e.target.value)} className="flex-1" />
                  <Button onClick={handleEmailInvite}><Mail size={14} className="mr-1" />Inviter</Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-[30px] w-[30px] rounded-[7px] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid rgba(15,23,42,0.09)' }}
            >
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
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
    </header>
  );
};
