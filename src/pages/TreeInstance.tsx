import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Heart, LogOut, Skull } from "lucide-react";
import { useGameStore, TREES } from "@/stores/gameStore";
import { useAudioStore } from "@/stores/audioStore";

const TreeInstance = () => {
  const navigate = useNavigate();
  const {
    treeNodes, character, currentTreeIndex, completedNodes,
    selectNode, startEncounter, initializeTree, emergeFromForest,
  } = useGameStore();
  const { playMenuMusic } = useAudioStore();
  const [showEmergeDialog, setShowEmergeDialog] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { playMenuMusic(); }, [playMenuMusic]);

  useEffect(() => {
    if (treeNodes.length === 0) initializeTree();
  }, [treeNodes.length, initializeTree]);

  // Scroll to bottom on mount
  useEffect(() => {
    if (treeNodes.length > 0 && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [treeNodes.length]);

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
  const colWidth = 48;
  const rowHeight = 60;
  const nodeSize = 28;
  const totalRows = sortedRows.length;
  const treeName = TREES[currentTreeIndex ?? 0]?.name ?? "Unknown";
  const treeWidth = totalCols * colWidth;

  const getNodeStyle = (type: string, isCompleted: boolean) => {
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
    if (type === "boss") return "h-5 w-5";
    if (type === "elite") return "h-4 w-4";
    return "h-3.5 w-3.5";
  };

  return (
    <div ref={containerRef} className="min-h-screen void-bg px-2 py-8 overflow-y-auto overflow-x-hidden">
      <Button variant="ghost" className="absolute left-2 top-4 font-title text-sm z-20" onClick={() => navigate("/summoner-menu")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <Button variant="outline" className="absolute right-2 top-14 font-title text-xs z-20" size="sm" onClick={() => setShowEmergeDialog(true)}>
        <LogOut className="mr-1 h-3 w-3" /> Emerge
      </Button>

      {character && (
        <div className="absolute right-2 top-4 flex items-center gap-1 rounded-lg bg-card px-2 py-1 fantasy-border z-20">
          <Heart className="h-3 w-3 text-health" />
          <span className="font-title text-xs text-health">{character.currentHealth}/{character.maxHealth}</span>
        </div>
      )}

      <div className="mx-auto" style={{ maxWidth: treeWidth + 32 }}>
        <div className="mb-4 text-center pt-2">
          <h1 className="mb-1 font-title text-xl font-bold glow-gold">{treeName}</h1>
        </div>

        <div className="relative mx-auto" style={{ width: treeWidth, minHeight: totalRows * rowHeight + 40 }}>
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
                    strokeWidth={isActive || isPath ? 2 : 1}
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
            const size = isBoss ? nodeSize + 6 : nodeSize;

            return (
              <button key={node.id} onClick={() => handleNodeClick(node.id)} disabled={!isAvailable}
                className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300
                  ${getNodeStyle(node.type, isCompleted)}
                  ${isAvailable ? "cursor-pointer ring-2 ring-accent ring-offset-1 ring-offset-background hover:scale-110 animate-pulse" : ""}
                  ${isDisabled ? "opacity-25 cursor-not-allowed" : ""}
                `}
                style={{ width: size, height: size, left: left + (isBoss ? -3 : 0), top: top + (isBoss ? -3 : 0), zIndex: 1 }}>
                <Skull className={`${getSkullSize(node.type)} ${getSkullColor(node.type, isCompleted)}`} />
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                    <span className="text-[10px] font-bold text-primary">✓</span>
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
