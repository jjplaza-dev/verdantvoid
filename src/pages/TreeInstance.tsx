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
    if (!node || !node.available || node.completed) return;
    
    selectNode(nodeId);
    startEncounter(node.type);
    navigate("/encounter");
  };

  // Group nodes by row for rendering - reversed so bottom row (0) at bottom
  const nodesByRow: Record<number, typeof treeNodes> = {};
  treeNodes.forEach(node => {
    if (!nodesByRow[node.row]) nodesByRow[node.row] = [];
    nodesByRow[node.row].push(node);
  });

  const sortedRows = Object.keys(nodesByRow)
    .map(Number)
    .sort((a, b) => b - a); // Boss (highest row) at top

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 font-title"
        onClick={() => navigate("/summoner-menu")}
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

      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-3xl font-bold glow-gold">
            Tree {(currentTreeIndex ?? 0) + 1}
          </h1>
          <p className="font-body text-muted-foreground">
            Navigate upward — one node per level
          </p>
        </div>

        {/* Tree visualization - vertical, boss at top */}
        <div className="relative flex flex-col items-center gap-6">
          {sortedRows.map((row) => {
            const nodes = nodesByRow[row].sort((a, b) => a.col - b.col);
            const isBossRow = nodes[0]?.type === "boss";
            
            return (
              <div key={row} className={`flex justify-center gap-4 md:gap-8 ${isBossRow ? "mb-4" : ""}`}>
                {nodes.map((node) => {
                  const Icon = nodeIcons[node.type];
                  const isAvailable = node.available && !node.completed;
                  const isCompleted = node.completed;
                  // Check if this node's entire row is cleared (another node on same row was completed)
                  const rowCleared = nodesByRow[node.row].some(n => n.completed);
                  const isDisabled = !isAvailable && !isCompleted;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      disabled={!isAvailable}
                      className={`
                        relative flex items-center justify-center rounded-full
                        transition-all duration-300
                        ${isBossRow ? "h-20 w-20" : "h-14 w-14"}
                        ${isCompleted ? "bg-muted opacity-50" : nodeColors[node.type]}
                        ${isAvailable ? "cursor-pointer ring-2 ring-primary ring-offset-2 ring-offset-background hover:scale-110 animate-pulse" : ""}
                        ${isDisabled && rowCleared ? "opacity-20 cursor-not-allowed" : ""}
                        ${isDisabled && !rowCleared ? "opacity-30 cursor-not-allowed" : ""}
                        fantasy-border
                      `}
                    >
                      <Icon className={`${isBossRow ? "h-10 w-10" : "h-6 w-6"} ${isCompleted ? "text-muted-foreground" : "text-white"}`} />
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
        <div className="mt-10 flex justify-center gap-6">
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
