import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Skull, Swords, Star, Heart, LogOut } from "lucide-react";
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
    completedNodes,
    selectNode, 
    startEncounter,
    initializeTree,
    emergeFromForest,
  } = useGameStore();
  
  const [showEmergeDialog, setShowEmergeDialog] = useState(false);

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

  const handleEmerge = () => {
    const credits = Math.min(40, completedNodes.length * 4);
    emergeFromForest();
    setShowEmergeDialog(false);
    navigate("/summoner-menu");
  };

  // Group nodes by row
  const nodesByRow: Record<number, typeof treeNodes> = {};
  treeNodes.forEach(node => {
    if (!nodesByRow[node.row]) nodesByRow[node.row] = [];
    nodesByRow[node.row].push(node);
  });

  const sortedRows = Object.keys(nodesByRow)
    .map(Number)
    .sort((a, b) => b - a);

  // Build connection lines: for each node, draw lines to nodes it connects FROM (previous row)
  const getNodePosition = (nodeId: string) => {
    const node = treeNodes.find(n => n.id === nodeId);
    if (!node) return null;
    return { row: node.row, col: node.col };
  };

  const totalCols = 7;
  const colWidth = 56; // px per column
  const rowHeight = 72; // px per row
  const nodeSize = 40;
  const totalRows = sortedRows.length;

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

      {/* Emerge button */}
      <Button
        variant="outline"
        className="absolute right-4 top-16 font-title text-sm"
        onClick={() => setShowEmergeDialog(true)}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Emerge
      </Button>

      {character && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-card px-3 py-1 fantasy-border">
          <Heart className="h-4 w-4 text-health" />
          <span className="font-title text-sm text-health">
            {character.currentHealth} / {character.maxHealth}
          </span>
        </div>
      )}

      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-1 font-title text-2xl font-bold glow-gold">
            Tree {(currentTreeIndex ?? 0) + 1}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Navigate upward — one node per level
          </p>
        </div>

        {/* Tree visualization with SVG lines */}
        <div className="relative mx-auto" style={{ width: totalCols * colWidth, minHeight: totalRows * rowHeight + 40 }}>
          {/* SVG for connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {treeNodes.map(node => 
              node.connections.map(connId => {
                const fromPos = getNodePosition(connId);
                if (!fromPos) return null;
                // From node is in previous row (below), current node is above
                const x1 = fromPos.col * colWidth + nodeSize / 2;
                const y1 = (totalRows - 1 - fromPos.row) * rowHeight + nodeSize / 2 + 20;
                const x2 = node.col * colWidth + nodeSize / 2;
                const y2 = (totalRows - 1 - node.row) * rowHeight + nodeSize / 2 + 20;
                
                // Highlight if from-node is completed and this node is available
                const fromNode = treeNodes.find(n => n.id === connId);
                const isActive = fromNode?.completed && node.available;
                const isPath = fromNode?.completed && node.completed;
                
                return (
                  <line
                    key={`${connId}-${node.id}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isPath ? "hsl(45, 80%, 50%)" : isActive ? "hsl(45, 80%, 50%)" : "hsl(240, 10%, 25%)"}
                    strokeWidth={isActive || isPath ? 2 : 1}
                    strokeOpacity={isActive || isPath ? 0.8 : 0.3}
                  />
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {treeNodes.map(node => {
            const Icon = nodeIcons[node.type];
            const isAvailable = node.available && !node.completed;
            const isCompleted = node.completed;
            const rowCleared = nodesByRow[node.row]?.some(n => n.completed);
            const isDisabled = !isAvailable && !isCompleted;
            const isBoss = node.type === "boss";

            const left = node.col * colWidth;
            const top = (totalRows - 1 - node.row) * rowHeight + 20;

            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                disabled={!isAvailable}
                className={`
                  absolute flex items-center justify-center rounded-full
                  transition-all duration-300
                  ${isBoss ? "w-12 h-12" : "w-10 h-10"}
                  ${isCompleted ? "bg-muted opacity-50" : nodeColors[node.type]}
                  ${isAvailable ? "cursor-pointer ring-2 ring-primary ring-offset-1 ring-offset-background hover:scale-110 animate-pulse" : ""}
                  ${isDisabled && rowCleared ? "opacity-20 cursor-not-allowed" : ""}
                  ${isDisabled && !rowCleared ? "opacity-30 cursor-not-allowed" : ""}
                  fantasy-border
                `}
                style={{
                  left: left + (isBoss ? -6 : 0),
                  top: top + (isBoss ? -6 : 0),
                  zIndex: 1,
                }}
              >
                <Icon className={`${isBoss ? "h-6 w-6" : "h-4 w-4"} ${isCompleted ? "text-muted-foreground" : "text-white"}`} />
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <span className="text-xs font-bold text-green-400">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${nodeColors.basic}`} />
            <span className="text-xs font-body text-muted-foreground">Basic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${nodeColors.elite}`} />
            <span className="text-xs font-body text-muted-foreground">Elite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${nodeColors.boss}`} />
            <span className="text-xs font-body text-muted-foreground">Boss</span>
          </div>
        </div>
      </div>

      {/* Emerge Dialog */}
      <Dialog open={showEmergeDialog} onOpenChange={setShowEmergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-title">Emerge from the Forest?</DialogTitle>
            <DialogDescription className="font-body">
              Your current run will end. You will receive <span className="text-gold font-bold">{Math.min(40, completedNodes.length * 4)}</span> credits based on your progress ({completedNodes.length} nodes cleared).
              Your champion will be released and all progress in this tree will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmergeDialog(false)}>Stay</Button>
            <Button variant="destructive" onClick={handleEmerge}>Emerge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreeInstance;
