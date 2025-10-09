import { useMemo, useState } from "react";
import {
  Kanban,
  ListChecks,
  Workflow,
  Network,
  Plus,
  Rocket,
  TimerReset,
  CheckCircle2,
  ArrowRight,
  Building2,
  UsersRound,
  LineChart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const methodologies = {
  kanban: {
    label: "Kanban",
    description: "Flux continu, visualisation simple et limites WIP flexibles.",
    icon: Kanban,
    focus: ["Visualiser le flux", "Limiter le WIP", "Améliorer en continu"],
  },
  scrum: {
    label: "Scrum",
    description: "Itérations courtes, rôles définis et cadence prévisible.",
    icon: ListChecks,
    focus: ["Sprints cadencés", "Backlog priorisé", "Rituels structurés"],
  },
  scrumban: {
    label: "Scrumban",
    description: "Structure Scrum avec la souplesse Kanban.",
    icon: Workflow,
    focus: ["Limites WIP", "Sprint optionnel", "Adaptation en continu"],
  },
  safe: {
    label: "SAFe",
    description: "Alignement multi-équipes et planning PI collaboratif.",
    icon: Network,
    focus: ["Vision partagée", "Backlogs multi-niveaux", "PI Planning"],
  },
};

type MethodologyKey = keyof typeof methodologies;

type ScrumEvent = "planning" | "daily" | "review" | "retro";

const WorkflowPlanner = () => {
  const [projectName, setProjectName] = useState("Programme Phoenix");
  const [selectedMethodology, setSelectedMethodology] = useState<MethodologyKey>("kanban");

  const [kanbanColumns, setKanbanColumns] = useState(
    [
      { id: "todo", name: "À faire", wip: 6 },
      { id: "doing", name: "En cours", wip: 3 },
      { id: "done", name: "Terminé", wip: 0 },
    ] as { id: string; name: string; wip: number }[],
  );
  const [newColumnName, setNewColumnName] = useState("Revues");
  const [newColumnLimit, setNewColumnLimit] = useState(2);

  const [scrumSprintLength, setScrumSprintLength] = useState(2);
  const [scrumBacklog, setScrumBacklog] = useState([
    { id: "pb1", title: "Auth SSO", estimation: 5 },
    { id: "pb2", title: "Refonte onboarding", estimation: 8 },
  ]);
  const [newBacklogTitle, setNewBacklogTitle] = useState("");
  const [newBacklogEstimation, setNewBacklogEstimation] = useState(3);
  const [scrumEvents, setScrumEvents] = useState<Record<ScrumEvent, boolean>>({
    planning: true,
    daily: true,
    review: true,
    retro: true,
  });

  const [scrumbanPolicies, setScrumbanPolicies] = useState([
    "Limiter le WIP à 4 par personne",
    "Daily ciblée sur les blocages",
    "Replenishment hebdomadaire du tableau",
  ]);
  const [scrumbanAllowSprints, setScrumbanAllowSprints] = useState(true);
  const [scrumbanSprintLength, setScrumbanSprintLength] = useState(3);
  const [scrumbanWipLimit, setScrumbanWipLimit] = useState(5);
  const [newPolicy, setNewPolicy] = useState("Limiter les bugs à 2 en parallèle");

  const [piObjectives, setPiObjectives] = useState([
    "Améliorer la valeur métier sur le parcours client",
    "Synchroniser les roadmaps Mobile & Web",
  ]);
  const [newPiObjective, setNewPiObjective] = useState("");

  const safeBacklogs = useMemo(
    () => [
      {
        level: "Portfolio",
        description: "Vision stratégique et OKR d'entreprise",
        items: ["Vision 2025", "Thématique Expérience client"],
      },
      {
        level: "Program",
        description: "ART Backlog aligné sur la valeur métier",
        items: ["Epic: Parcours onboarding", "Epic: Personnalisation"],
      },
      {
        level: "Team",
        description: "Stories prêtes pour l'itération",
        items: ["Story: accès biométrique", "Story: Email de bienvenue"],
      },
    ],
    [],
  );

  const handleAddKanbanColumn = () => {
    if (!newColumnName.trim()) {
      toast.error("Nom de colonne requis");
      return;
    }

    setKanbanColumns((prev) => [
      ...prev,
      {
        id: `col-${Date.now()}`,
        name: newColumnName,
        wip: Number.isNaN(newColumnLimit) ? 0 : newColumnLimit,
      },
    ]);
    toast.success("Colonne ajoutée");
    setNewColumnName("");
    setNewColumnLimit(2);
  };

  const handleAddBacklogItem = () => {
    if (!newBacklogTitle.trim()) {
      toast.error("Titre de backlog requis");
      return;
    }

    setScrumBacklog((prev) => [
      ...prev,
      { id: `pb-${Date.now()}`, title: newBacklogTitle, estimation: newBacklogEstimation },
    ]);
    setNewBacklogTitle("");
    setNewBacklogEstimation(3);
    toast.success("Élément ajouté au backlog");
  };

  const toggleScrumEvent = (event: ScrumEvent) => {
    setScrumEvents((prev) => ({ ...prev, [event]: !prev[event] }));
  };

  const handleAddPolicy = () => {
    if (!newPolicy.trim()) {
      toast.error("Politique requise");
      return;
    }
    setScrumbanPolicies((prev) => [...prev, newPolicy]);
    setNewPolicy("");
  };

  const handleAddPiObjective = () => {
    if (!newPiObjective.trim()) {
      toast.error("Objectif requis");
      return;
    }
    setPiObjectives((prev) => [...prev, newPiObjective]);
    setNewPiObjective("");
  };

  const renderMethodologyContent = () => {
    switch (selectedMethodology) {
      case "kanban":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tableau Kanban</CardTitle>
                  <CardDescription>Colonnes personnalisables avec limites WIP.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {kanbanColumns.map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{column.name}</p>
                          <p className="text-sm text-muted-foreground">Limite WIP : {column.wip || "Illimitée"}</p>
                        </div>
                        <Badge variant="secondary">Flux</Badge>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="grid gap-3">
                    <Label htmlFor="column-name">Nouvelle colonne</Label>
                    <Input
                      id="column-name"
                      placeholder="Ex: Revue QA"
                      value={newColumnName}
                      onChange={(event) => setNewColumnName(event.target.value)}
                    />
                    <Label htmlFor="wip-limit">Limite WIP</Label>
                    <Input
                      id="wip-limit"
                      type="number"
                      min={0}
                      value={newColumnLimit}
                      onChange={(event) => setNewColumnLimit(Number(event.target.value) || 0)}
                    />
                    <Button onClick={handleAddKanbanColumn} className="gap-2">
                      <Plus className="h-4 w-4" /> Ajouter une colonne
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Suivi du flux</CardTitle>
                  <CardDescription>Métriques clés pour piloter votre flux continu.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Temps de cycle (cycle time) par carte",
                    "Temps de traversée (lead time) depuis l'idée jusqu'à la livraison",
                    "Débit (throughput) hebdomadaire",
                    "Sessions Kaizen pour ajuster les limites WIP",
                  ].map((metric) => (
                    <div key={metric} className="flex items-start gap-3">
                      <LineChart className="h-4 w-4 text-primary mt-1" />
                      <p className="text-sm text-muted-foreground">{metric}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Principes Kanban</CardTitle>
                <CardDescription>Visualiser, limiter, mesurer, améliorer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Visualisation claire du flux sur un tableau partagé",
                  "Limites WIP par colonne ou par équipe",
                  "Tirage continu : une tâche entre quand il y a de la capacité",
                  "Rituel d'amélioration continue basé sur les métriques",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-1" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      case "scrum":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sprint & cadence</CardTitle>
                  <CardDescription>Définissez la longueur de sprint et la vélocité cible.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Durée du sprint (semaines)</Label>
                    <div className="flex items-center gap-4 pt-2">
                      {[1, 2, 3, 4].map((duration) => (
                        <Button
                          key={duration}
                          variant={scrumSprintLength === duration ? "default" : "outline"}
                          onClick={() => setScrumSprintLength(duration)}
                        >
                          {duration}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm text-muted-foreground">
                      Cadence actuelle : sprint de {scrumSprintLength} semaine{scrumSprintLength > 1 ? "s" : ""}.
                      Ajustez selon la capacité de l'équipe et la vélocité observée.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Événements Scrum</CardTitle>
                  <CardDescription>Activez les rituels pour structurer votre sprint.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(
                    [
                      { key: "planning", label: "Sprint Planning", details: "Aligner l'objectif de sprint et le backlog" },
                      { key: "daily", label: "Daily Scrum", details: "Synchronisation quotidienne" },
                      { key: "review", label: "Sprint Review", details: "Valider l'incrément" },
                      { key: "retro", label: "Sprint Retrospective", details: "Amélioration continue" },
                    ] as { key: ScrumEvent; label: string; details: string }[]
                  ).map((event) => (
                    <div key={event.key} className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                      <div>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-sm text-muted-foreground">{event.details}</p>
                      </div>
                      <Switch
                        checked={scrumEvents[event.key]}
                        onCheckedChange={() => toggleScrumEvent(event.key)}
                        aria-label={`Activer ${event.label}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Backlog et vélocité</CardTitle>
                <CardDescription>Priorisez vos items avec le Product Owner.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <Input
                    placeholder="Nouvel item backlog"
                    value={newBacklogTitle}
                    onChange={(event) => setNewBacklogTitle(event.target.value)}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={13}
                    value={newBacklogEstimation}
                    onChange={(event) => setNewBacklogEstimation(Number(event.target.value) || 1)}
                    className="md:w-32"
                    placeholder="Pts"
                  />
                  <Button onClick={handleAddBacklogItem} className="gap-2">
                    <Plus className="h-4 w-4" /> Ajouter
                  </Button>
                </div>
                <div className="grid gap-2">
                  {scrumBacklog.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">Estimation : {item.estimation} pts</p>
                      </div>
                      <Badge variant="outline">Backlog</Badge>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-primary/5 p-4 text-sm text-primary">
                  <p>
                    Mesures clés : vélocité moyenne, burn-down chart, progression par sprint pour sécuriser l'engagement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "scrumban":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadre hybride</CardTitle>
                <CardDescription>Combinez la prévisibilité de Scrum et la fluidité de Kanban.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Limite WIP globale</Label>
                    <Input
                      type="number"
                      min={1}
                      value={scrumbanWipLimit}
                      onChange={(event) => setScrumbanWipLimit(Number(event.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <TimerReset className="h-4 w-4" /> Sprint optionnel
                    </Label>
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                      <Switch checked={scrumbanAllowSprints} onCheckedChange={setScrumbanAllowSprints} />
                      <span className="text-sm text-muted-foreground">
                        {scrumbanAllowSprints ? "Sprint actif" : "Flux continu pur"}
                      </span>
                    </div>
                  </div>
                  {scrumbanAllowSprints && (
                    <div className="space-y-2">
                      <Label>Durée de timebox (semaines)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={4}
                        value={scrumbanSprintLength}
                        onChange={(event) => setScrumbanSprintLength(Number(event.target.value) || 1)}
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Politiques de flux</Label>
                  <div className="grid gap-2">
                    {scrumbanPolicies.map((policy, index) => (
                      <div key={`${policy}-${index}`} className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                        {policy}
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                    <Textarea
                      placeholder="Ajouter une nouvelle politique"
                      value={newPolicy}
                      onChange={(event) => setNewPolicy(event.target.value)}
                    />
                    <Button onClick={handleAddPolicy} className="gap-2 md:h-full">
                      <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border bg-primary/5 p-4 text-sm text-primary">
                  <p>
                    Idéal pour la maintenance et les équipes en transition : démarrez avec Scrum, ajoutez le Kanban pour plus de
                    souplesse.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "safe":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PI Planning collaboratif</CardTitle>
                <CardDescription>Préparez votre prochain Program Increment (8–12 semaines).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Objectifs PI</Label>
                  <div className="grid gap-2">
                    {piObjectives.map((objective, index) => (
                      <div key={`${objective}-${index}`} className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                        {objective}
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                    <Input
                      placeholder="Nouvel objectif PI"
                      value={newPiObjective}
                      onChange={(event) => setNewPiObjective(event.target.value)}
                    />
                    <Button onClick={handleAddPiObjective} className="gap-2 md:h-full">
                      <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">
                    Organisez des PI Planning cadencés, synchronisez vos Agile Release Trains et capturez la business value.
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 lg:grid-cols-3">
              {safeBacklogs.map((backlog) => (
                <Card key={backlog.level}>
                  <CardHeader>
                    <CardTitle>{backlog.level} Backlog</CardTitle>
                    <CardDescription>{backlog.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {backlog.items.map((item) => (
                      <div key={item} className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Rituels et alignement</CardTitle>
                <CardDescription>Assurez la cohérence multi-équipes.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {["PI Planning", "ART Sync", "PO Sync", "Inspect & Adapt"].map((ceremony) => (
                  <div key={ceremony} className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                    <p className="font-medium">{ceremony}</p>
                    <p className="text-muted-foreground">
                      {ceremony === "PI Planning"
                        ? "Cadence trimestrielle, alignement stratégique et plan de sprint."
                        : ceremony === "ART Sync"
                          ? "Synchronisation hebdo entre RTE et Scrum Masters."
                          : ceremony === "PO Sync"
                            ? "Alignement backlog Program/Product Management."
                            : "Rituel d'amélioration continue à l'échelle."}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-7 w-7" />
          <div>
            <h2 className="text-2xl font-semibold">Workflow de projet</h2>
            <p className="text-muted-foreground">
              Paramétrez votre cadre agile pour guider équipes et rituels autour de {projectName || "votre projet"}.
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <UsersRound className="h-4 w-4" /> Méthodologies agiles collaboratives
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Choisir le nom du projet</CardTitle>
          <CardDescription>Un intitulé clair favorise l'alignement entre équipes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <Input
            placeholder="Nom du projet"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            <p>Utilisez un nom évocateur : produit, initiative stratégique ou train agile.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Sélectionner la méthodologie</CardTitle>
          <CardDescription>Comparez les approches pour choisir la meilleure cadence.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          {(Object.keys(methodologies) as MethodologyKey[]).map((key) => {
            const method = methodologies[key];
            const Icon = method.icon;
            const isSelected = selectedMethodology === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMethodology(key)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isSelected ? "border-primary bg-primary/10" : "hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && <Badge variant="default">Sélectionné</Badge>}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{method.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{method.description}</p>
                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {method.focus.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Appliquer les particularités</CardTitle>
          <CardDescription>
            Configurez les pratiques propres à {methodologies[selectedMethodology].label} pour {projectName || "votre projet"}.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderMethodologyContent()}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synthèse rapide</CardTitle>
          <CardDescription>Récapitulatif des approches pour choisir rapidement.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Kanban",
              highlight: "Flux continu, visualisation, optimisation du flux.",
            },
            {
              title: "Scrum",
              highlight: "Itérations fixes, cadre prescriptif, rôles bien définis.",
            },
            {
              title: "Scrumban",
              highlight: "Mélange souple + structure, idéal pour la transition.",
            },
            {
              title: "SAFe",
              highlight: "Coordination multi-équipes, alignement stratégique.",
            },
          ].map((summary) => (
            <div key={summary.title} className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">{summary.title}</p>
              <p className="text-muted-foreground">{summary.highlight}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>
          Besoin d'aller plus loin ? Ajustez les templates par équipe, partagez le workflow avec vos administrateurs et Product
          Owners et suivez les métriques clés depuis le dashboard.
        </span>
      </div>
    </div>
  );
};

export default WorkflowPlanner;
