import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Heart, LogOut, Skull } from "lucide-react";
import { useGameStore, TREES } from "@/stores/gameStore";
import { useEffect } from "react";

const TreeInstance = () => {
  const navigate = useNavigate();
  const {
    treeNodes, character, currentTreeIndex, completedNodes,
    selectNode, startEncounter, initializeTree, emergeFromForest,
  } = useGameStore();
  const [showEmergeDialog, setShowEmergeDialog] = useState(false);

  useEffect(() => {
    if (treeNodes.length === 0) initializeTree();
  }, [treeNodes.length, initializeTree]);

  const handleNodeClick = (nodeId: string) => {
    const node = treeNodes.find(n => n.id === nodeId);
    if (!node || !node.available || node.completed) return;
    selectNode(nodeId);
    startEncounter(node.type);
    navigate("/encounter");
  };

  const handleEmerge = () => {
    emergeFromForest();
    setShowEmergeDialog(false);
    navigate("/summoner-menu");
  };

  const nodesByRow: Record<number, typeof treeNodes> = {};
  treeNodes.forEach(node => {
    if (!nodesByRow[node.row]) nodesByRow[node.row] = [];
    nodesByRow[node.row].push(node);
  });

  const sortedRows = Object.keys(nodesByRow).map(Number).sort((a, b) => b - a);
  const getNodePosition = (nodeId: string) => {
    const node = treeNodes.find(n => n.id === nodeId);
    return node ? { row: node.row, col: node.col } : null;
  };

  const totalCols = 7;
  const colWidth = 64;
  const rowHeight = 80;
  const nodeSize = 36;
  const totalRows = sortedRows.length;
  const treeName = TREES[currentTreeIndex ?? 0]?.name ?? "Unknown";

  // Skull variant: basic = normal, elite = larger stroke orange, boss = red
  const getNodeStyle = (type: string, isCompleted: boolean, isAvailable: boolean) => {
    if (isCompleted) return "bg-muted/40 border-muted";
    if (type === "boss") return "bg-destructive/20 border-destructive";
    if (type === "elite") return "bg-accent/20 border-orange-500";
    return "bg-secondary/30 border-accent/40";
  };

  const getSkullColor = (type: string, isCompleted: boolean) => {
    if (isCompleted) return "text-muted-foreground";
    if (type === "boss") return "text-destructive";
    if (type === "elite") return "text-orange-400";
    return "text-foreground/70";
  };

  const getSkullSize = (type: string) => {
    if (type === "boss") return "h-6 w-6";
    if (type === "elite") return "h-5 w-5";
    return "h-4 w-4";
  };

  return (
    <div className="min-h-screen void-bg px-4 py-8">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/summoner-menu")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Button variant="outline" className="absolute right-4 top-16 font-title text-sm" onClick={() => setShowEmergeDialog(true)}>
        <LogOut className="mr-2 h-4 w-4" /> Emerge
      </Button>

      {character && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-card px-3 py-1 fantasy-border">
          <Heart className="h-4 w-4 text-health" />
          <span className="font-title text-sm text-health">{character.currentHealth} / {character.maxHealth}</span>
        </div>
      )}

      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-1 font-title text-2xl font-bold glow-gold">{treeName}</h1>
        </div>

        <div className="relative mx-auto" style={{ width: totalCols * colWidth, minHeight: totalRows * rowHeight + 40 }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {treeNodes.map(node =>
              node.connections.map(connId => {
                const fromPos = getNodePosition(connId);
                if (!fromPos) return null;
                const x1 = fromPos.col * colWidth + nodeSize / 2;
                const y1 = (totalRows - 1 - fromPos.row) * rowHeight + nodeSize / 2 + 20;
                const x2 = node.col * colWidth + nodeSize / 2;
                const y2 = (totalRows - 1 - node.row) * rowHeight + nodeSize / 2 + 20;
                const fromNode = treeNodes.find(n => n.id === connId);
                const isActive = fromNode?.completed && node.available;
                const isPath = fromNode?.completed && node.completed;

                return (
                  <line key={`${connId}-${node.id}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isPath ? "hsl(140, 60%, 45%)" : isActive ? "hsl(280, 60%, 50%)" : "hsl(270, 15%, 22%)"}
                    strokeWidth={isActive || isPath ? 2.5 : 1}
                    strokeOpacity={isActive || isPath ? 0.9 : 0.25}
                    strokeDasharray={isActive ? "4 3" : undefined}
                  />
                );
              })
            )}
          </svg>

          {treeNodes.map(node => {
            const isAvailable = node.available && !node.completed;
            const isCompleted = node.completed;
            const isDisabled = !isAvailable && !isCompleted;
            const isBoss = node.type === "boss";
            const left = node.col * colWidth;
            const top = (totalRows - 1 - node.row) * rowHeight + 20;
            const size = isBoss ? nodeSize + 10 : nodeSize;

            return (
              <button key={node.id} onClick={() => handleNodeClick(node.id)} disabled={!isAvailable}
                className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300
                  ${getNodeStyle(node.type, isCompleted, isAvailable)}
                  ${isAvailable ? "cursor-pointer ring-2 ring-accent ring-offset-1 ring-offset-background hover:scale-110 animate-pulse" : ""}
                  ${isDisabled ? "opacity-25 cursor-not-allowed" : ""}
                `}
                style={{
                  width: size, height: size,
                  left: left + (isBoss ? -5 : 0),
                  top: top + (isBoss ? -5 : 0),
                  zIndex: 1,
                }}>
                <Skull className={`${getSkullSize(node.type)} ${getSkullColor(node.type, isCompleted)}`} />
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                    <span className="text-xs font-bold text-primary">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
