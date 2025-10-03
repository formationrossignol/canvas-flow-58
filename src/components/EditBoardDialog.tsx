import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EditBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditBoardData) => void;
  initialData: {
    name: string;
    description: string;
    teamId?: string;
    tags?: string[];
  };
}

export interface EditBoardData {
  name: string;
  description: string;
  teamId?: string;
  tags: string[];
}

const teams = [
  { id: "team1", name: "Équipe Marketing" },
  { id: "team2", name: "Équipe Dev" },
  { id: "team3", name: "Projets Perso" }
];

export const EditBoardDialog = ({ isOpen, onClose, onSave, initialData }: EditBoardDialogProps) => {
  const [formData, setFormData] = useState<EditBoardData>({
    name: initialData.name,
    description: initialData.description,
    teamId: initialData.teamId,
    tags: initialData.tags || []
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setFormData({
      name: initialData.name,
      description: initialData.description,
      teamId: initialData.teamId,
      tags: initialData.tags || []
    });
  }, [initialData]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Modifier le tableau</DialogTitle>
          <DialogDescription>
            Modifiez les informations de votre tableau
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="board-name" className="text-sm font-medium">
              Nom du tableau
            </Label>
            <Input
              id="board-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Mon tableau"
              className="h-11"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="board-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="board-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du tableau..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label htmlFor="board-team" className="text-sm font-medium">
              Équipe
            </Label>
            <Select
              value={formData.teamId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}
            >
              <SelectTrigger id="board-team" className="h-11">
                <SelectValue placeholder="Sélectionner une équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="board-tags" className="text-sm font-medium">
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="board-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ajouter un tag"
                className="h-11 flex-1"
              />
              <Button onClick={handleAddTag} variant="secondary" className="h-11">
                Ajouter
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-2 px-3 py-1.5">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim()} className="bg-gradient-primary">
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
