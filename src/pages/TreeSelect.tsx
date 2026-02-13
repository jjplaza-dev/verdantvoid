import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, TreePine, Lock } from "lucide-react";
import { useGameStore, TREES } from "@/stores/gameStore";
import { useAudioStore } from "@/stores/audioStore";

const TreeSelect = () => {
  const navigate = useNavigate();
  const { setCurrentTree, saveSlots, activeSlot } = useGameStore();
  const { playMenuMusic } = useAudioStore();
  const [focusIndex, setFocusIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => { playMenuMusic(); }, [playMenuMusic]);

  const slot = saveSlots.find(s => s.id === activeSlot);
  const completedTrees = slot?.completedTrees ?? [];

  const isUnlocked = (treeId: number) => {
    if (treeId === 0) return true;
    return completedTrees.includes(treeId - 1);
  };

  const handleNav = (dir: "left" | "right") => {
    if (animating) return;
    const newIdx = dir === "left" ? Math.max(0, focusIndex - 1) : Math.min(TREES.length - 1, focusIndex + 1);
    if (newIdx === focusIndex) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setFocusIndex(newIdx);
      setAnimating(false);
      setDirection(null);
    }, 300);
  };

  const tree = TREES[focusIndex];
  const locked = !isUnlocked(tree.id);
  const prevTree = focusIndex > 0 ? TREES[focusIndex - 1] : null;
  const nextTree = focusIndex < TREES.length - 1 ? TREES[focusIndex + 1] : null;

  const handleSelect = () => {
    if (locked) return;
    setCurrentTree(tree.id);
    navigate("/character-select");
  };

  const renderTreeCard = (t: typeof TREES[0], isFocused: boolean, locked: boolean) => (
    <div className={`
      w-56 md:w-64 text-center rounded-xl p-6 bg-card transition-all duration-300 fantasy-border
      ${isFocused ? "scale-100 opacity-100 z-10" : "scale-90 opacity-40 z-0"}
    `}>
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {locked ? <Lock className="h-8 w-8 text-muted-foreground" /> : <TreePine className="h-8 w-8 text-primary" />}
      </div>
      <h3 className="font-title text-base mb-1 text-primary">{t.name}</h3>
      <p className="font-body text-xs text-muted-foreground mb-1">{t.description}</p>
      <p className={`text-xs font-body ${t.strengthColor}`}>{t.strengthLabel}</p>
      {completedTrees.includes(t.id) && <p className="mt-1 text-xs font-title text-primary">✓ Completed</p>}
      {isFocused && !locked && (
        <Button className="mt-4 w-full font-title" size="sm" onClick={handleSelect}>Enter</Button>
      )}
      {isFocused && locked && (
        <p className="mt-4 text-xs text-muted-foreground font-body">Complete previous tree first</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen void-bg px-4 py-8 flex flex-col items-center justify-center">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/summoner-menu")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="mb-2 font-title text-3xl font-bold glow-gold">Choose Your Path</h1>
      <p className="mb-8 font-body text-muted-foreground">Each tree presents greater challenges and rewards</p>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-12 w-12" disabled={focusIndex === 0 || animating}
          onClick={() => handleNav("left")}>
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <div className={`flex items-center gap-2 transition-transform duration-300 ${
          animating && direction === "left" ? "translate-x-4" : 
          animating && direction === "right" ? "-translate-x-4" : ""
        }`}>
          {prevTree && renderTreeCard(prevTree, false, !isUnlocked(prevTree.id))}
          {renderTreeCard(tree, true, locked)}
          {nextTree && renderTreeCard(nextTree, false, !isUnlocked(nextTree.id))}
          {!prevTree && <div className="w-56 md:w-64" />}
          {!nextTree && <div className="w-56 md:w-64" />}
        </div>

        <Button variant="ghost" size="icon" className="h-12 w-12" disabled={focusIndex === TREES.length - 1 || animating}
          onClick={() => handleNav("right")}>
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
