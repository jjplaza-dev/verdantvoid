import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TreePine, Lock } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";

const TREES = [
  { id: 0, name: "The Whispering Woods", description: "A dark forest filled with lesser creatures", modifier: "Base difficulty" },
  { id: 1, name: "The Corrupted Grove", description: "Twisted trees and stronger beasts", modifier: "+10% enemy stats" },
  { id: 2, name: "The Shadow Thicket", description: "Where light fears to tread", modifier: "+20% enemy stats" },
  { id: 3, name: "The Blighted Depths", description: "Ancient horrors lurk within", modifier: "+30% enemy stats" },
  { id: 4, name: "The Nightmare Canopy", description: "Only the strongest survive", modifier: "+40% enemy stats" },
];

const TreeSelect = () => {
  const navigate = useNavigate();
  const { setCurrentTree } = useGameStore();

  const unlockedTrees = 5;

  const handleSelectTree = (treeIndex: number) => {
    if (treeIndex >= unlockedTrees) return;
    setCurrentTree(treeIndex);
    navigate("/character-select");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/summoner-menu")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Choose Your Path</h1>
          <p className="font-body text-muted-foreground">Each tree presents greater challenges and rewards</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TREES.map((tree) => {
            const isLocked = tree.id >= unlockedTrees;
            return (
              <Card
                key={tree.id}
                className={`group fantasy-border transition-all duration-300 ${
                  isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:card-glow hover:scale-[1.02]"
                }`}
                onClick={() => !isLocked && handleSelectTree(tree.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    {isLocked ? <Lock className="h-8 w-8 text-muted-foreground" /> : <TreePine className="h-8 w-8 text-primary" />}
                  </div>
                  <CardTitle className="font-title text-lg">Tree {tree.id + 1}: {tree.name}</CardTitle>
                  <CardDescription className="font-body">{tree.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className={`text-sm font-body ${tree.id === 0 ? "text-muted-foreground" : "text-orange-400"}`}>{tree.modifier}</p>
                  {!isLocked && <Button className="mt-4 w-full font-title">Enter</Button>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TreeSelect;
