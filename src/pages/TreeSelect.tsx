import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, TreePine, Lock } from "lucide-react";
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
  const { setCurrentTree, saveSlots, activeSlot } = useGameStore();
  const [focusIndex, setFocusIndex] = useState(0);

  const slot = saveSlots.find(s => s.id === activeSlot);
  const completedTrees = slot?.completedTrees ?? [];

  const isUnlocked = (treeId: number) => {
    if (treeId === 0) return true;
    return completedTrees.includes(treeId - 1);
  };

  const tree = TREES[focusIndex];
  const locked = !isUnlocked(tree.id);

  const handleSelect = () => {
    if (locked) return;
    setCurrentTree(tree.id);
    navigate("/character-select");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center justify-center">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/summoner-menu")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="mb-2 font-title text-3xl font-bold glow-gold">Choose Your Path</h1>
      <p className="mb-8 font-body text-muted-foreground">Each tree presents greater challenges and rewards</p>

      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12"
          disabled={focusIndex === 0}
          onClick={() => setFocusIndex(i => Math.max(0, i - 1))}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <div className="w-72 text-center fantasy-border rounded-xl p-8 bg-card transition-all duration-300">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            {locked ? <Lock className="h-10 w-10 text-muted-foreground" /> : <TreePine className="h-10 w-10 text-primary" />}
          </div>
          <h2 className="font-title text-xl mb-1">Tree {tree.id + 1}</h2>
          <h3 className="font-title text-lg mb-2 text-primary">{tree.name}</h3>
          <p className="font-body text-sm text-muted-foreground mb-2">{tree.description}</p>
          <p className={`text-sm font-body ${tree.id === 0 ? "text-muted-foreground" : "text-orange-400"}`}>{tree.modifier}</p>
          {completedTrees.includes(tree.id) && (
            <p className="mt-2 text-sm font-title text-green-400">✓ Completed</p>
          )}
          {!locked && (
            <Button className="mt-6 w-full font-title" onClick={handleSelect}>
              Enter
            </Button>
          )}
          {locked && (
            <p className="mt-6 text-sm text-muted-foreground font-body">Complete Tree {tree.id} first</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12"
          disabled={focusIndex === TREES.length - 1}
          onClick={() => setFocusIndex(i => Math.min(TREES.length - 1, i + 1))}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex gap-2">
        {TREES.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${i === focusIndex ? "bg-primary scale-150" : "bg-muted-foreground/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TreeSelect;
