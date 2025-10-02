import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layout, Plus, Search, FileEdit } from "lucide-react";
import { templates } from "@/components/Canvas/templates";

const Templates = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseTemplate = (templateId: string) => {
    const boardId = `board-${Date.now()}`;
    navigate(`/canvas/${boardId}?template=${templateId}`);
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Layout className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Templates</h2>
          </div>
          <Button onClick={() => navigate('/canvas/new?createTemplate=true')} className="gap-2">
            <FileEdit className="h-4 w-4" />
            Créer un template
          </Button>
        </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: template.color }}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <Badge variant="secondary">
                    {template.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-3">
                  {template.elements.length} éléments
                </div>
                <Button 
                  onClick={() => handleUseTemplate(template.id)} 
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Utiliser ce template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun template trouvé</h3>
            <p className="text-muted-foreground">
              Essayez avec d'autres mots-clés
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </ScrollArea>
  );
};

export default Templates;
