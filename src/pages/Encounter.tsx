import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGameStore, Card as CardType } from "@/stores/gameStore";
import { Heart, Shield, Zap, Swords, ArrowRight, Layers, Archive } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";

const cardTypeColors = {
  attack: "border-red-500 bg-red-500/10",
  skill: "border-blue-500 bg-blue-500/10",
  power: "border-yellow-500 bg-yellow-500/10",
};

const Encounter = () => {
  const navigate = useNavigate();
  const {
    character,
    enemy,
    hand,
    deck,
    discardPile,
    currentEnergy,
    playCard,
    endTurn,
    completeEncounter,
    inEncounter,
  } = useGameStore();

  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [showDeckPopup, setShowDeckPopup] = useState(false);
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const handRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const enemyRef = useRef<HTMLDivElement>(null);
  const prevHandRef = useRef<string[]>([]);

  useEffect(() => {
    if (!inEncounter || !enemy) {
      navigate("/tree-instance");
    }
  }, [inEncounter, enemy, navigate]);

  // GSAP card draw animation
  useEffect(() => {
    const prevIds = prevHandRef.current;
    const newIds = hand.map(c => c.id);
    const addedIds = newIds.filter(id => !prevIds.includes(id));
    
    addedIds.forEach((id, i) => {
      const el = cardRefs.current[id];
      if (el) {
        gsap.fromTo(el, 
          { scale: 0, x: -200, opacity: 0 },
          { scale: 1, x: 0, opacity: 1, duration: 0.4, delay: i * 0.1, ease: "back.out(1.4)" }
        );
      }
    });
    
    prevHandRef.current = newIds;
  }, [hand]);

  // Victory/defeat checks
  useEffect(() => {
    if (enemy && enemy.currentHealth <= 0) {
      setBattleLog(prev => [...prev, `${enemy.name} defeated!`]);
      setTimeout(() => {
        completeEncounter(true);
      }, 1200);
    }
    
    if (character && character.currentHealth <= 0) {
      setBattleLog(prev => [...prev, "You have been defeated!"]);
      setTimeout(() => {
        completeEncounter(false);
        navigate("/summoner-menu");
      }, 1500);
    }
  }, [enemy?.currentHealth, character?.currentHealth]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, card: CardType) => {
    if (card.cost > currentEnergy) return;
    e.preventDefault();
    setDraggedCard(card.id);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragPos({ x: e.clientX, y: e.clientY });
  }, [currentEnergy]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedCard) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  }, [draggedCard]);

  const handleMouseUp = useCallback(() => {
    if (!draggedCard) return;
    
    const card = hand.find(c => c.id === draggedCard);
    if (!card) { setDraggedCard(null); return; }

    // Check if dropped on enemy
    const enemyEl = enemyRef.current;
    if (enemyEl) {
      const rect = enemyEl.getBoundingClientRect();
      if (dragPos.x >= rect.left && dragPos.x <= rect.right && dragPos.y >= rect.top && dragPos.y <= rect.bottom) {
        if (card.type === "attack") {
          playCard(draggedCard, true);
          setBattleLog(prev => [...prev, `${card.name} dealt damage!`]);
        } else {
          playCard(draggedCard, false);
          setBattleLog(prev => [...prev, `Played ${card.name}`]);
        }
      } else if (card.type !== "attack") {
        // Non-attack cards can be dropped anywhere
        playCard(draggedCard, false);
        setBattleLog(prev => [...prev, `Played ${card.name}`]);
      }
    }
    
    // Reset drag - card returns to hand via state
    setDraggedCard(null);
    setDragStartPos(null);
  }, [draggedCard, dragPos, hand, playCard]);

  const handleEndTurn = () => {
    if (enemy) {
      setBattleLog(prev => [...prev, `${enemy.name} ${enemy.intent === "attack" ? `attacks for ${enemy.intentValue}` : `gains ${enemy.intentValue} shield`}`]);
    }
    endTurn();
  };

  if (!character || !enemy) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading encounter...</p>
    </div>;
  }

  return (
    <div 
      className="min-h-screen bg-background flex flex-col select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top bar - Enemy area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div ref={enemyRef} className="relative">
          {/* Enemy placeholder */}
          <div className={`
            w-32 h-40 rounded-lg flex flex-col items-center justify-center
            ${enemy.type === "basic" ? "bg-blue-600" : enemy.type === "elite" ? "bg-orange-600" : "bg-red-700"}
            fantasy-border transition-all
            ${draggedCard && hand.find(c => c.id === draggedCard)?.type === "attack" ? "ring-4 ring-red-500 ring-offset-2 ring-offset-background" : ""}
          `}>
            <span className="font-title text-white text-sm">{enemy.name}</span>
            <span className="text-xs text-white/70 capitalize">{enemy.type}</span>
          </div>
          
          {/* Enemy stats */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="flex items-center gap-1 bg-card px-2 py-1 rounded">
              <Heart className="h-4 w-4 text-health" />
              <span className="text-sm font-title text-health">{enemy.currentHealth}/{enemy.maxHealth}</span>
            </div>
            {enemy.shield > 0 && (
              <div className="flex items-center gap-1 bg-card px-2 py-1 rounded">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-title text-blue-400">{enemy.shield}</span>
              </div>
            )}
          </div>
          
          {/* Enemy intent */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded fantasy-border">
            <div className="flex items-center gap-2">
              {enemy.intent === "attack" ? (
                <>
                  <Swords className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-title text-red-400">{enemy.intentValue}</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-title text-blue-400">{enemy.intentValue}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle - Character and game info */}
      <div className="flex items-center justify-between px-8 py-4 bg-card/50">
        {/* Character placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-28 rounded-lg bg-primary flex items-center justify-center fantasy-border">
            <span className="font-title text-primary-foreground text-xs">YOU</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-health" />
              <span className="font-title text-health">{character.currentHealth}/{character.maxHealth}</span>
            </div>
            {character.shield > 0 && (
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="font-title text-blue-400">{character.shield}</span>
              </div>
            )}
            {character.attackBuffTurns > 0 && (
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-yellow-400" />
                <span className="font-title text-yellow-400">+{character.attackBuff}% ({character.attackBuffTurns}t)</span>
              </div>
            )}
          </div>
        </div>

        {/* Energy */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg fantasy-border">
            <Zap className="h-6 w-6 text-energy" />
            <span className="font-title text-2xl text-energy">{currentEnergy}/{character.maxEnergy}</span>
          </div>
        </div>

        {/* End turn button */}
        <Button 
          onClick={handleEndTurn} 
          size="lg" 
          className="font-title"
          disabled={enemy.currentHealth <= 0 || character.currentHealth <= 0}
        >
          End Turn
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Bottom - Hand with Deck/Discard */}
      <div className="p-4 bg-card/30">
        <div className="flex items-end gap-4">
          {/* Deck pile */}
          <button
            className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowDeckPopup(true)}
          >
            <div className="w-14 h-20 rounded-lg bg-blue-900 fantasy-border flex items-center justify-center">
              <Layers className="h-6 w-6 text-blue-300" />
            </div>
            <span className="text-xs font-title text-muted-foreground">{deck.length}</span>
          </button>

          {/* Hand cards */}
          <div ref={handRef} className="flex-1 flex justify-center gap-2 flex-wrap">
            {hand.map((card) => {
              const canPlay = card.cost <= currentEnergy;
              const isDragging = draggedCard === card.id;
              
              return (
                <div
                  key={card.id}
                  ref={el => { cardRefs.current[card.id] = el; }}
                  onMouseDown={(e) => handleMouseDown(e, card)}
                  style={isDragging ? {
                    position: "fixed",
                    left: dragPos.x - 56,
                    top: dragPos.y - 80,
                    zIndex: 1000,
                    pointerEvents: "none",
                  } : undefined}
                  className={`
                    w-28 h-40 rounded-lg border-2 p-2 flex flex-col
                    transition-all duration-200
                    ${cardTypeColors[card.type]}
                    ${canPlay ? "cursor-grab hover:scale-105 hover:-translate-y-2" : "opacity-50 cursor-not-allowed"}
                    ${isDragging ? "scale-110 shadow-2xl rotate-3" : ""}
                  `}
                >
                  {/* Cost */}
                  <div className="flex items-center gap-1 self-start">
                    <Zap className="h-3 w-3 text-energy" />
                    <span className="text-xs font-bold text-energy">{card.cost}</span>
                  </div>
                  {/* Name */}
                  <div className="flex-1 flex items-center justify-center">
                    <span className="font-title text-sm text-center">{card.name}</span>
                  </div>
                  {/* Description */}
                  <p className="text-xs text-muted-foreground text-center">{card.description}</p>
                </div>
              );
            })}
          </div>

          {/* Discard pile */}
          <button
            className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowDiscardPopup(true)}
          >
            <div className="w-14 h-20 rounded-lg bg-red-900/50 fantasy-border flex items-center justify-center">
              <Archive className="h-6 w-6 text-red-300" />
            </div>
            <span className="text-xs font-title text-muted-foreground">{discardPile.length}</span>
          </button>
        </div>
        
        {draggedCard && hand.find(c => c.id === draggedCard)?.type === "attack" && (
          <p className="text-center mt-2 text-sm text-muted-foreground animate-pulse">
            Drag to the enemy to attack
          </p>
        )}
      </div>

      {/* Deck Popup */}
      <Dialog open={showDeckPopup} onOpenChange={setShowDeckPopup}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-title">Draw Pile ({deck.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {deck.map((card, i) => (
              <div key={`${card.id}-${i}`} className={`rounded-lg border p-2 text-center text-xs ${cardTypeColors[card.type]}`}>
                <div className="font-title">{card.name}</div>
                <div className="text-muted-foreground">Cost: {card.cost}</div>
              </div>
            ))}
            {deck.length === 0 && <p className="col-span-3 text-center text-muted-foreground text-sm">Empty</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Discard Popup */}
      <Dialog open={showDiscardPopup} onOpenChange={setShowDiscardPopup}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-title">Discard Pile ({discardPile.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {discardPile.map((card, i) => (
              <div key={`${card.id}-${i}`} className={`rounded-lg border p-2 text-center text-xs ${cardTypeColors[card.type]}`}>
                <div className="font-title">{card.name}</div>
                <div className="text-muted-foreground">Cost: {card.cost}</div>
              </div>
            ))}
            {discardPile.length === 0 && <p className="col-span-3 text-center text-muted-foreground text-sm">Empty</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Encounter;
