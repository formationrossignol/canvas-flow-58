import { useState } from "react";
import { Settings, Download, Share2, Users, MessageCircle, Layout, Lock, Unlock, Copy, QrCode, Mail, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  onLockSelected?: () => void;
  onUnlockSelected?: () => void;
  onDuplicateSelected?: () => void;
}

export const CanvasHeader = ({ 
  boardTitle, 
  onTitleChange, 
  collaborators,
  onOpenTemplates,
  onOpenExport,
  onOpenComments,
  selectedCount = 0,
  onLockSelected,
  onUnlockSelected,
  onDuplicateSelected,
}: CanvasHeaderProps) => {
  const navigate = useNavigate();
  const [emailInvite, setEmailInvite] = useState("");
  
  const handleShare = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink);
    toast.success("Lien copié dans le presse-papier");
  };

  const handleEmailInvite = () => {
    if (!emailInvite || !emailInvite.includes('@')) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }
    
    // For now, just copy to clipboard - would need backend for actual email sending
    const shareLink = window.location.href;
    const mailtoLink = `mailto:${emailInvite}?subject=Invitation à collaborer sur ${boardTitle}&body=Rejoignez-moi sur ce tableau collaboratif : ${shareLink}`;
    window.location.href = mailtoLink;
    toast.success("Email d'invitation ouvert");
    setEmailInvite("");
  };
  
  return (
    <header className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          
          <div className="h-6 w-px bg-border" />
          
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-medium bg-transparent border-none outline-none text-foreground hover:bg-muted/50 px-2 py-1 rounded-md transition-colors"
            placeholder="Titre du tableau"
          />
        </div>

        {/* Center Section - Collaborators or Selection Actions */}
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
            <Badge variant="secondary">{selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}</Badge>
            
            {onDuplicateSelected && (
              <Button variant="ghost" size="sm" onClick={onDuplicateSelected} className="gap-2">
                <Copy size={16} />
                Dupliquer
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{collaborators.length} collaborateur{collaborators.length > 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex -space-x-2">
              {collaborators.slice(0, 4).map((collaborator, index) => (
                <div
                  key={collaborator.id}
                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white shadow-soft"
                  style={{ 
                    backgroundColor: collaborator.color,
                    zIndex: collaborators.length - index,
                  }}
                  title={collaborator.name}
                >
                  {collaborator.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {collaborators.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{collaborators.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            En ligne
          </Badge>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 bg-gradient-primary">
                <Share2 size={16} />
                Partager
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Partager le tableau</DialogTitle>
                <DialogDescription>
                  Partagez ce tableau avec d'autres personnes
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="link" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="link">
                    <Copy size={14} className="mr-1" />
                    Lien
                  </TabsTrigger>
                  <TabsTrigger value="qr">
                    <QrCode size={14} className="mr-1" />
                    QR Code
                  </TabsTrigger>
                  <TabsTrigger value="email">
                    <Mail size={14} className="mr-1" />
                    Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="link" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="share-link">Lien de partage</Label>
                    <div className="flex gap-2">
                      <Input
                        id="share-link"
                        value={window.location.href}
                        readOnly
                        className="flex-1"
                      />
                      <Button onClick={handleShare}>Copier</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4">
                  <div className="flex flex-col items-center gap-4 py-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Scannez ce QR code pour accéder au tableau
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <QRCodeSVG 
                        value={window.location.href}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const svg = document.querySelector('svg');
                        if (svg) {
                          const svgData = new XMLSerializer().serializeToString(svg);
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx?.drawImage(img, 0, 0);
                            const pngFile = canvas.toDataURL('image/png');
                            const downloadLink = document.createElement('a');
                            downloadLink.download = `${boardTitle}-qrcode.png`;
                            downloadLink.href = pngFile;
                            downloadLink.click();
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                        }
                        toast.success("QR code téléchargé");
                      }}
                    >
                      Télécharger le QR code
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-invite">Email du collaborateur</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email-invite"
                        type="email"
                        placeholder="exemple@email.com"
                        value={emailInvite}
                        onChange={(e) => setEmailInvite(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleEmailInvite}>
                        <Mail size={16} className="mr-1" />
                        Inviter
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Un email d'invitation sera envoyé avec le lien du tableau
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Menu size={16} />
                <span>Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-sm border-border z-50">
              <DropdownMenuItem onClick={onOpenComments} className="gap-2 cursor-pointer">
                <MessageCircle size={16} />
                <span>Commentaires</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenTemplates} className="gap-2 cursor-pointer">
                <Layout size={16} />
                <span>Templates</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenExport} className="gap-2 cursor-pointer">
                <Download size={16} />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 cursor-pointer">
                <Settings size={16} />
                <span>Paramètres</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};