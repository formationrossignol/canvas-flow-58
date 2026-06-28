import { useState } from "react";
import {
  Share2, Copy, QrCode, Mail,
  MoreHorizontal, Save, RefreshCcw, Layout, Download,
  MessageCircle, Timer, ClipboardCopy, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export const CanvasHeader = ({
  boardTitle,
  onTitleChange,
  collaborators,
  onOpenTemplates,
  onOpenExport,
  onOpenComments,
  selectedCount = 0,
  onDuplicateSelected,
  boardId,
  lastSavedAt,
  isSaving,
  onSaveNow,
  onResetBoard,
  onToggleTimer,
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
    if (!emailInvite?.includes('@')) {
      toast.error("Adresse email invalide");
      return;
    }
    const link = window.location.href;
    window.location.href = `mailto:${emailInvite}?subject=Invitation à collaborer sur ${boardTitle}&body=Rejoignez-moi : ${link}`;
    toast.success("Email d'invitation ouvert");
    setEmailInvite("");
  };

  const dotColor = isSaving
    ? 'bg-yellow-400 animate-pulse'
    : lastSavedAt
    ? 'bg-green-500'
    : 'bg-red-400';

  const dotTitle = isSaving
    ? 'Enregistrement en cours…'
    : lastSavedAt
    ? `Enregistré (${lastSavedAt.toLocaleTimeString()})`
    : 'Non enregistré';

  return (
    <header className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="flex items-center justify-between px-4 h-12">

        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger />
          <div className="h-5 w-px bg-border" />
          <input
            type="text"
            value={boardTitle}
            onChange={e => onTitleChange(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none outline-none text-foreground hover:bg-muted/50 px-2 py-1 rounded-md transition-colors max-w-[200px] truncate"
            placeholder="Titre du tableau"
          />
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}
            title={dotTitle}
          />
        </div>

        {/* Center — dynamic context */}
        <div className="flex-1 flex justify-center">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1">
              <span className="text-xs font-semibold text-primary">
                {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
              </span>
              {onDuplicateSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                  onClick={onDuplicateSelected}
                >
                  <Copy size={12} className="mr-1" />
                  Dupliquer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Collaborator avatars */}
          <div className="hidden md:flex mr-1">
            {collaborators.slice(0, 4).map((c, i) => (
              <div
                key={c.id}
                className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white -ml-1.5 first:ml-0"
                style={{ backgroundColor: c.color, zIndex: collaborators.length - i }}
                title={c.name}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborators.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground -ml-1.5">
                +{collaborators.length - 4}
              </div>
            )}
          </div>

          {/* Share */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs">
                <Share2 size={13} />
                Partager
              </Button>
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
                    <Input
                      type="email"
                      placeholder="exemple@email.com"
                      value={emailInvite}
                      onChange={e => setEmailInvite(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleEmailInvite}><Mail size={14} className="mr-1" />Inviter</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* ··· Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-sm border-border z-50">
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
      </div>
    </header>
  );
};
