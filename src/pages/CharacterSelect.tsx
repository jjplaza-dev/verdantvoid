import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Sword, Zap } from "lucide-react";
import { useGameStore, CHARACTERS } from "@/stores/gameStore";

const iconMap: Record<string, any> = { Sword, Shield, Zap };

const CharacterSelect = () => {
  const navigate = useNavigate();
  const { initializeCharacter, initializeTree, saveProgress, getEffectiveStats } = useGameStore();

  const handleSelectCharacter = (characterId: string) => {
    initializeCharacter(characterId);
    initializeTree();
    saveProgress();
    navigate("/tree-instance");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/tree-select")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Choose Your Champion</h1>
          <p className="font-body text-muted-foreground">Select a champion for this delve</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {CHARACTERS.map((char) => {
            const Icon = iconMap[char.icon] ?? Sword;
            const stats = getEffectiveStats(char.id);
            return (
              <Card
                key={char.id}
                className="group cursor-pointer fantasy-border transition-all duration-300 hover:card-glow hover:scale-[1.02]"
                onClick={() => handleSelectCharacter(char.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-title text-xl">{char.name}</CardTitle>
                  <CardDescription className="font-body">{char.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex justify-between"><span className="text-muted-foreground">Health</span><span className="text-health font-semibold">{stats.health}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Energy</span><span className="text-energy font-semibold">{stats.energy}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Offense</span><span className="text-gold font-semibold">{stats.offense}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Defense</span><span className="font-semibold">{stats.defense}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Card Draw</span><span className="font-semibold">{stats.cardDraw}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Armor</span><span className="font-semibold">{stats.armor}%</span></div>
                  </div>
                  <Button className="mt-6 w-full font-title">Select</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelect;
