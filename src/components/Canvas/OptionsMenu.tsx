import React, { useState } from "react";
import { BarChart3, Activity, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OptionsMenuProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const OptionsMenu = ({ isVisible, onToggle }: OptionsMenuProps) => {
  const [activityLogs] = useState([
    { id: 1, action: "Élément créé", type: "Post-it", time: "14:32", user: "Vous" },
    { id: 2, action: "Couleur modifiée", type: "Rectangle", time: "14:30", user: "Alice Martin" },
    { id: 3, action: "Texte édité", type: "Texte", time: "14:28", user: "Vous" },
    { id: 4, action: "Élément supprimé", type: "Cercle", time: "14:25", user: "Bob Dupont" },
    { id: 5, action: "Position modifiée", type: "Post-it", time: "14:22", user: "Alice Martin" },
  ]);

  const [statistics] = useState({
    totalElements: 24,
    textElements: 8,
    shapes: 12,
    images: 3,
    connections: 6,
    collaborators: 3,
    lastActivity: "Il y a 2 minutes",
  });

  if (!isVisible) return null;

  return (
    <div className="absolute top-20 left-6 z-40 w-96 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-float animate-float-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Settings size={16} />
          Options du board
        </h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs defaultValue="statistics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 size={14} />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity size={14} />
              Activité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {statistics.totalElements}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Éléments total
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-secondary">
                    {statistics.collaborators}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Collaborateurs
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Textes</span>
                <span className="font-medium">{statistics.textElements}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Formes</span>
                <span className="font-medium">{statistics.shapes}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Images</span>
                <span className="font-medium">{statistics.images}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Connexions</span>
                <span className="font-medium">{statistics.connections}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Dernière activité: {statistics.lastActivity}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLogs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {log.action}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.type} • {log.user}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.time}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};