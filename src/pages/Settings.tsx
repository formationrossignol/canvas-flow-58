import { useRef, type ChangeEvent } from "react";
import { Settings as SettingsIcon, Check, ImagePlus, RefreshCw } from "lucide-react";
import { PageTitle } from "@/contexts/PageHeaderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBranding } from "@/contexts/BrandingContext";

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { logoUrl, setLogoUrl, brandName, setBrandName } = useBranding();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveTheme = (theme === "system" ? resolvedTheme : theme) ?? "light";

  const themeOptions = [
    {
      id: "light",
      name: "Parchemin doré",
      description: "Palette lumineuse et chaleureuse par défaut.",
      preview: ["#f8efd4", "#8fc5a3", "#f6ad55"],
    },
    {
      id: "dark",
      name: "Nocturne",
      description: "Contrastes profonds pour travailler tard.",
      preview: ["#0f172a", "#1e293b", "#4ade80"],
    },
    {
      id: "theme-ocean",
      name: "Océan profond",
      description: "Bleus apaisants inspirés des lagons.",
      preview: ["#e0f2fe", "#38bdf8", "#0f172a"],
    },
    {
      id: "theme-forest",
      name: "Forêt boréale",
      description: "Verts brumeux pour une ambiance organique.",
      preview: ["#ecfdf5", "#34d399", "#064e3b"],
    },
    {
      id: "theme-sunset",
      name: "Crépuscule urbain",
      description: "Dégradés chaleureux façon golden hour.",
      preview: ["#fff4e6", "#fb923c", "#7c2d12"],
    },
  ];

  const handleThemeSelect = (id: string) => {
    setTheme(id);
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo
    if (file.size > MAX_SIZE) {
      toast.error("Le logo doit faire moins de 2 Mo.");
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image (PNG, JPG ou SVG).");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoReset = () => {
    setLogoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8">
      <PageTitle title="Paramètres" />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>Personnalisez l'apparence de votre espace de travail</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Thèmes
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choisissez l'un des templates d'apparence pour colorer l'interface.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {themeOptions.map((option) => {
                  const isSelected = option.id === effectiveTheme;

                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => handleThemeSelect(option.id)}
                      className={cn(
                        "relative flex h-full flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all",
                        isSelected
                          ? "border-primary shadow-soft"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {isSelected && (
                        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      <div className="space-y-1 pr-6">
                        <h3 className="text-base font-semibold text-foreground">{option.name}</h3>
                        <p className="text-sm leading-snug text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="mt-auto flex gap-2">
                        {option.preview.map((color) => (
                          <span
                            key={color}
                            className="h-10 flex-1 rounded-lg"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Nom de l'espace</Label>
                <Input
                  id="workspace-name"
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                  placeholder="Nom affiché dans la barre latérale"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  Ce nom est affiché à côté du logo dans la barre latérale.
                </p>
              </div>
              <div className="space-y-3">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo personnalisé" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center px-2">Aucun logo</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                        <ImagePlus className="h-4 w-4" />
                        Importer
                      </Button>
                      {logoUrl && (
                        <Button type="button" size="sm" variant="outline" onClick={handleLogoReset} className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Réinitialiser
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG ou SVG, taille maximale 2 Mo.</p>
                  </div>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="animations">Animations</Label>
              <Switch id="animations" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaboration</CardTitle>
            <CardDescription>Gérez vos préférences de collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications en temps réel</Label>
              <Switch id="notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cursor">Afficher les curseurs des autres</Label>
              <Switch id="cursor" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canvas</CardTitle>
            <CardDescription>Options du tableau blanc</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="grid">Afficher la grille</Label>
              <Switch id="grid" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="snap">Aimanter aux objets</Label>
              <Switch id="snap" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
