import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, TreePine, Lock } from "lucide-react";
import { useGameStore, TREES } from "@/stores/gameStore";

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
    <div className="min-h-screen void-bg px-4 py-8 flex flex-col items-center justify-center">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/summoner-menu")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="mb-2 font-title text-3xl font-bold glow-gold">Choose Your Path</h1>
      <p className="mb-8 font-body text-muted-foreground">Each tree presents greater challenges and rewards</p>

      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="h-12 w-12" disabled={focusIndex === 0}
          onClick={() => setFocusIndex(i => Math.max(0, i - 1))}>
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <div className="w-72 text-center fantasy-border rounded-xl p-8 bg-card transition-all duration-300">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            {locked ? <Lock className="h-10 w-10 text-muted-foreground" /> : <TreePine className="h-10 w-10 text-primary" />}
          </div>
          <h3 className="font-title text-lg mb-2 text-primary">{tree.name}</h3>
          <p className="font-body text-sm text-muted-foreground mb-2">{tree.description}</p>
          <p className={`text-sm font-body ${tree.strengthColor}`}>{tree.strengthLabel}</p>
          {completedTrees.includes(tree.id) && (
            <p className="mt-2 text-sm font-title text-primary">✓ Completed</p>
          )}
          {!locked && (
            <Button className="mt-6 w-full font-title" onClick={handleSelect}>Enter</Button>
          )}
          {locked && (
            <p className="mt-6 text-sm text-muted-foreground font-body">Complete previous tree first</p>
          )}
        </div>

        <Button variant="ghost" size="icon" className="h-12 w-12" disabled={focusIndex === TREES.length - 1}
          onClick={() => setFocusIndex(i => Math.min(TREES.length - 1, i + 1))}>
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      <div className="mt-6 flex gap-2">
        {TREES.map((_, i) => (
          <div key={i} className={`h-2 w-2 rounded-full transition-all ${i === focusIndex ? "bg-primary scale-150" : "bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};

export default TreeSelect;
