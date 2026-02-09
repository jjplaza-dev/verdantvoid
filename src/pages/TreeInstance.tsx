import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Skull, Swords, Star, Heart } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { useEffect } from "react";

const nodeColors = {
  basic: "bg-blue-500",
  elite: "bg-orange-500",
  boss: "bg-red-600",
};

const nodeIcons = {
  basic: Swords,
  elite: Star,
  boss: Skull,
};

const TreeInstance = () => {
  const navigate = useNavigate();
  const { 
    treeNodes, 
    character, 
    currentTreeIndex, 
    selectNode, 
    startEncounter,
    initializeTree 
  } = useGameStore();

  useEffect(() => {
    if (treeNodes.length === 0) {
      initializeTree();
    }
  }, [treeNodes.length, initializeTree]);

  const handleNodeClick = (nodeId: string) => {
    const node = treeNodes.find(n => n.id === nodeId);
    if (!node || !node.available) return;
    
    selectNode(nodeId);
    startEncounter(node.type);
    navigate("/encounter");
  };

  // Group nodes by row for rendering
  const nodesByRow: Record<number, typeof treeNodes> = {};
  treeNodes.forEach(node => {
    if (!nodesByRow[node.row]) nodesByRow[node.row] = [];
    nodesByRow[node.row].push(node);
  });

  const sortedRows = Object.keys(nodesByRow)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 font-title"
        onClick={() => navigate("/tree-select")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Character health display */}
      {character && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-card px-4 py-2 fantasy-border">
          <Heart className="h-5 w-5 text-health" />
          <span className="font-title text-health">
            {character.currentHealth} / {character.maxHealth}
          </span>
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-3xl font-bold glow-gold">
            Tree {(currentTreeIndex ?? 0) + 1}
          </h1>
          <p className="font-body text-muted-foreground">
            Click an available node to begin an encounter
          </p>
        </div>

        {/* Tree visualization */}
        <div className="relative flex flex-col items-center gap-8">
          {sortedRows.map((row) => {
            const nodes = nodesByRow[row].sort((a, b) => a.col - b.col);
            
            return (
              <div key={row} className="flex justify-center gap-8 md:gap-16">
                {nodes.map((node) => {
                  const Icon = nodeIcons[node.type];
                  const isAvailable = node.available && !node.completed;
                  const isCompleted = node.completed;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      disabled={!isAvailable}
                      className={`
                        relative flex h-16 w-16 items-center justify-center rounded-full
                        transition-all duration-300
                        ${isCompleted ? "bg-muted opacity-50" : nodeColors[node.type]}
                        ${isAvailable ? "cursor-pointer ring-2 ring-primary ring-offset-2 ring-offset-background hover:scale-110 animate-pulse" : ""}
                        ${!isAvailable && !isCompleted ? "opacity-30 cursor-not-allowed" : ""}
                        fantasy-border
                      `}
                    >
                      <Icon className={`h-8 w-8 ${isCompleted ? "text-muted-foreground" : "text-white"}`} />
                      {isCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                          <span className="text-xs font-bold text-green-400">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${nodeColors.basic}`} />
            <span className="text-sm font-body text-muted-foreground">Basic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${nodeColors.elite}`} />
            <span className="text-sm font-body text-muted-foreground">Elite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${nodeColors.boss}`} />
            <span className="text-sm font-body text-muted-foreground">Boss</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeInstance;
