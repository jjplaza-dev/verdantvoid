import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Coins, Sword, Shield, Zap, Heart, Swords, TreePine, ChevronUp } from "lucide-react";
import { useGameStore, CHARACTERS, type StatUpgrades } from "@/stores/gameStore";

const iconMap: Record<string, any> = { Sword, Shield, Zap };

const upgradableStats: { key: keyof StatUpgrades; label: string; icon: any }[] = [
  { key: "health", label: "Health", icon: Heart },
  { key: "offense", label: "Offense", icon: Swords },
  { key: "defense", label: "Defense", icon: Shield },
];

const SummonerMenu = () => {
  const navigate = useNavigate();
  const { saveSlots, activeSlot, getEffectiveStats, getUpgradeCost, upgradeStat, getCharacterDeck, setCurrentTree, initializeTree, treeNodes } = useGameStore();
  const [selectedChampion, setSelectedChampion] = useState<string | null>(null);
  const [showDeck, setShowDeck] = useState(false);

  const slot = saveSlots.find(s => s.id === activeSlot);
  if (!slot) return null;

  const handleDelve = () => {
    // If already in a tree instance, go directly
    if (slot.inTreeInstance) {
      navigate("/tree-instance");
    } else {
      navigate("/tree-select");
    }
  };

  const selectedChar = CHARACTERS.find(c => c.id === selectedChampion);
  const selectedStats = selectedChampion ? getEffectiveStats(selectedChampion) : null;
  const selectedDeck = selectedChampion ? getCharacterDeck(selectedChampion) : [];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/save-slots")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mx-auto max-w-4xl">
        <div className="mb-2 text-center">
          <h1 className="mb-1 font-title text-3xl font-bold glow-gold">{slot.username}</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-body">
            <Coins className="h-4 w-4 text-gold" />
            <span className="text-gold font-title text-lg">{slot.credits}</span>
            <span>Credits</span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <Button
            size="lg"
            className="h-14 px-10 text-lg font-title tracking-wide fantasy-border hover:card-glow transition-shadow duration-300"
            onClick={handleDelve}
          >
            <TreePine className="mr-2 h-5 w-5" />
            {slot.inTreeInstance ? "Return to Tree" : "Delve into the Forest"}
          </Button>
        </div>

        <h2 className="mb-4 font-title text-xl text-center text-muted-foreground">Champions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CHARACTERS.map((char) => {
            const Icon = iconMap[char.icon] ?? Sword;
            return (
              <Card
                key={char.id}
                className="group cursor-pointer fantasy-border transition-all duration-300 hover:card-glow hover:scale-[1.02]"
                onClick={() => setSelectedChampion(char.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-title text-lg">{char.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground font-body">{char.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Champion Detail Modal */}
      <Dialog open={selectedChampion !== null} onOpenChange={() => { setSelectedChampion(null); setShowDeck(false); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedChar && selectedStats && (
            <>
              <DialogHeader>
                <DialogTitle className="font-title text-xl text-center">{selectedChar.name}</DialogTitle>
              </DialogHeader>

              {/* Static stats on top */}
              <div className="flex justify-center gap-4 mb-2">
                <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded">
                  <Zap className="h-4 w-4 text-energy" />
                  <span className="font-title text-sm">{selectedStats.energy} Energy</span>
                </div>
                <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded">
                  <ChevronUp className="h-4 w-4 text-primary" />
                  <span className="font-title text-sm">{selectedStats.cardDraw} Draw</span>
                </div>
                <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded">
                  <Shield className="h-4 w-4 text-armor" />
                  <span className="font-title text-sm">{selectedStats.armor}% Armor</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground font-body text-center mb-4">{selectedChar.description}</p>
              
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  variant={showDeck ? "outline" : "default"}
                  size="sm"
                  onClick={() => setShowDeck(false)}
                >
                  Stats
                </Button>
                <Button
                  variant={showDeck ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDeck(true)}
                >
                  Deck ({selectedDeck.length})
                </Button>
              </div>

              {!showDeck ? (
                <div className="space-y-3">
                  {upgradableStats.map(({ key, label, icon: StatIcon }) => {
                    const cost = getUpgradeCost(selectedChampion!, key);
                    const value = selectedStats[key as keyof typeof selectedStats];
                    const canAfford = slot.credits >= cost;

                    return (
                      <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <StatIcon className="h-4 w-4 text-primary" />
                          <span className="font-body text-sm">{label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-title text-lg">{value}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={!canAfford}
                            onClick={(e) => {
                              e.stopPropagation();
                              upgradeStat(selectedChampion!, key);
                            }}
                          >
                            <ChevronUp className="h-3 w-3 mr-1" />
                            {cost}
                            <Coins className="h-3 w-3 ml-1 text-gold" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {selectedDeck.map((card) => (
                    <div
                      key={card.id}
                      className={`rounded-lg border p-2 text-center text-xs ${
                        card.type === "attack" ? "border-red-500/50 bg-red-500/10" :
                        card.type === "skill" ? "border-blue-500/50 bg-blue-500/10" :
                        "border-yellow-500/50 bg-yellow-500/10"
                      }`}
                    >
                      <div className="font-title text-xs">{card.name}</div>
                      <div className="text-muted-foreground mt-1">Cost: {card.cost}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SummonerMenu;
