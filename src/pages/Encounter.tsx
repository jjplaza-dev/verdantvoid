import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGameStore, Card as CardType, TREES } from "@/stores/gameStore";
import { Heart, Shield, Zap, Swords, ArrowRight, Layers, Archive, Flag, Snowflake, Flame } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";

const cardTypeColors = {
  attack: "border-destructive/60 bg-destructive/10",
  skill: "border-defense bg-defense/10",
  power: "border-gold bg-gold/10",
};

const Encounter = () => {
  const navigate = useNavigate();
  const {
    character, enemy, hand, deck, discardPile, currentEnergy,
    playCard, endTurn, completeEncounter, surrenderEncounter,
    completedNodes, inEncounter, encounterResult, clearEncounterResult,
    currentTreeIndex,
  } = useGameStore();

  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [showDeckPopup, setShowDeckPopup] = useState(false);
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);
  const [enemyDamageText, setEnemyDamageText] = useState<number | null>(null);
  const [playerDamageText, setPlayerDamageText] = useState<number | null>(null);
  const [enemyShaking, setEnemyShaking] = useState(false);
  const [creditCounter, setCreditCounter] = useState(0);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardPositions = useRef<Record<string, { x: number; y: number }>>({});
  const enemyRef = useRef<HTMLDivElement>(null);
  const prevHandRef = useRef<string[]>([]);
  const prevEnemyHp = useRef<number | null>(null);
  const prevPlayerHp = useRef<number | null>(null);

  useEffect(() => {
    if (!inEncounter && !enemy && !encounterResult) {
      navigate("/tree-instance");
    }
  }, [inEncounter, enemy, encounterResult, navigate]);

  // Card draw animation
  useEffect(() => {
    const prevIds = prevHandRef.current;
    const newIds = hand.map(c => c.id);
    const addedIds = newIds.filter(id => !prevIds.includes(id));
    addedIds.forEach((id, i) => {
      const el = cardRefs.current[id];
      if (el) gsap.fromTo(el, { scale: 0, x: -200, opacity: 0 }, { scale: 1, x: 0, opacity: 1, duration: 0.4, delay: i * 0.1, ease: "back.out(1.4)" });
    });
    prevHandRef.current = newIds;
  }, [hand]);

  // Enemy damage detection
  useEffect(() => {
    if (enemy && prevEnemyHp.current !== null && enemy.currentHealth < prevEnemyHp.current) {
      const dmg = prevEnemyHp.current - enemy.currentHealth;
      setEnemyDamageText(dmg);
      setEnemyShaking(true);
      setTimeout(() => setEnemyShaking(false), 400);
      setTimeout(() => setEnemyDamageText(null), 2000);
    }
    if (enemy) prevEnemyHp.current = enemy.currentHealth;
  }, [enemy?.currentHealth]);

  // Player damage detection
  useEffect(() => {
    if (character && prevPlayerHp.current !== null && character.currentHealth < prevPlayerHp.current) {
      const dmg = prevPlayerHp.current - character.currentHealth;
      setPlayerDamageText(dmg);
      setTimeout(() => setPlayerDamageText(null), 2000);
    }
    if (character) prevPlayerHp.current = character.currentHealth;
  }, [character?.currentHealth]);

  // Victory/defeat checks
  useEffect(() => {
    if (enemy && enemy.currentHealth <= 0) {
      setTimeout(() => completeEncounter(true), 1200);
    }
    if (character && character.currentHealth <= 0) {
      setTimeout(() => completeEncounter(false), 1500);
    }
  }, [enemy?.currentHealth, character?.currentHealth]);

  // Credit counter animation
  useEffect(() => {
    if (encounterResult) {
      setCreditCounter(0);
      const target = encounterResult.credits;
      const duration = 800;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setCreditCounter(Math.round(progress * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, [encounterResult]);

  // Store card positions
  useEffect(() => {
    hand.forEach(card => {
      const el = cardRefs.current[card.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        cardPositions.current[card.id] = { x: rect.left, y: rect.top };
      }
    });
  }, [hand, draggedCard]);

  const handlePointerDown = useCallback((e: React.PointerEvent, card: CardType) => {
    if (card.cost > currentEnergy) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const el = cardRefs.current[card.id];
    if (el) {
      const rect = el.getBoundingClientRect();
      cardPositions.current[card.id] = { x: rect.left, y: rect.top };
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setDraggedCard(card.id);
    setDragPos({ x: e.clientX, y: e.clientY });
  }, [currentEnergy]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggedCard) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  }, [draggedCard]);

  const handlePointerUp = useCallback(() => {
    if (!draggedCard) return;
    const card = hand.find(c => c.id === draggedCard);
    if (!card) { setDraggedCard(null); return; }

    const enemyEl = enemyRef.current;
    let played = false;

    if (enemyEl) {
      const rect = enemyEl.getBoundingClientRect();
      const overEnemy = dragPos.x >= rect.left && dragPos.x <= rect.right && dragPos.y >= rect.top && dragPos.y <= rect.bottom;
      if (overEnemy && card.type === "attack") { playCard(draggedCard, true); played = true; }
      else if (overEnemy && card.type !== "attack") { playCard(draggedCard, false); played = true; }
    }

    if (!played && card.type !== "attack") {
      const handY = window.innerHeight - 200;
      if (dragPos.y < handY) { playCard(draggedCard, false); played = true; }
    }

    if (!played) {
      const el = cardRefs.current[draggedCard];
      if (el) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    }
    setDraggedCard(null);
  }, [draggedCard, dragPos, hand, playCard]);

  const handleSurrender = () => {
    surrenderEncounter();
    setShowSurrenderDialog(false);
  };

  const handleResultAccept = () => {
    clearEncounterResult();
    navigate("/summoner-menu");
  };

  if (encounterResult) {
    const treeName = encounterResult.treeName;
    const isDefeat = encounterResult.type === "defeat";
    const isTreeComplete = encounterResult.type === "tree_complete";

    return (
      <div className="min-h-screen void-bg flex flex-col items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <h1 className={`font-title text-5xl font-bold mb-4 ${isDefeat ? "text-destructive glow-void" : "text-primary glow-gold"}`}>
            {isDefeat ? "Defeated" : isTreeComplete ? "Tree Conquered!" : "Victory"}
          </h1>
          {isDefeat && (
            <p className="font-body text-muted-foreground mb-2">
              {treeName} — {encounterResult.encountersCleared} encounter{encounterResult.encountersCleared !== 1 ? "s" : ""} cleared
            </p>
          )}
          {isTreeComplete && (
            <p className="font-body text-primary/80 mb-2">You have conquered {treeName}!</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-6 mb-8">
            <span className="font-title text-2xl text-gold">+</span>
            <span className="font-title text-4xl text-gold animate-count-pulse">{creditCounter}</span>
            <span className="font-title text-lg text-muted-foreground">credits</span>
          </div>
          <Button size="lg" className="font-title" onClick={handleResultAccept}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (!character || !enemy) {
    return <div className="min-h-screen void-bg flex items-center justify-center">
      <p className="text-muted-foreground">Loading encounter...</p>
    </div>;
  }

  const effectiveOffense = character.attackBuffTurns > 0
    ? Math.ceil(character.offense * (1 + character.attackBuff / 100))
    : character.offense;

  return (
    <div className="min-h-screen void-bg flex flex-col select-none touch-none"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>

      {/* Surrender */}
      <Button variant="ghost" size="sm" className="absolute right-4 top-4 font-title text-xs z-10"
        onClick={() => setShowSurrenderDialog(true)}>
        <Flag className="mr-1 h-3 w-3" /> Surrender
      </Button>

      {/* Enemy area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div ref={enemyRef} className="relative">
          <div className={`
            w-32 h-40 rounded-lg flex flex-col items-center justify-center
            bg-secondary fantasy-border transition-all
            ${enemyShaking ? "animate-shake" : ""}
            ${draggedCard && hand.find(c => c.id === draggedCard)?.type === "attack" ? "ring-4 ring-destructive ring-offset-2 ring-offset-background" : ""}
          `}>
            <span className="font-title text-foreground text-sm">{enemy.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{enemy.type}</span>
          </div>

          {/* Enemy debuffs - right side */}
          {enemy.debuffs.length > 0 && (
            <div className="absolute -right-10 top-0 flex flex-col gap-1">
              {enemy.debuffs.map(d => (
                <Tooltip key={d.id}>
                  <TooltipTrigger asChild>
                    <div className="w-7 h-7 rounded bg-card flex items-center justify-center border border-border cursor-help">
                      {d.effect === "chill" ? <Snowflake className="h-4 w-4 text-chill" /> : <Flame className="h-4 w-4 text-burn" />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs max-w-[200px]">
                    <p className="font-title">{d.name} ({d.turnsLeft}t)</p>
                    <p className="font-body">{d.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          {/* HP + damage text */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="flex items-center gap-1 bg-card px-2 py-1 rounded relative">
              <Heart className="h-4 w-4 text-health" />
              <span className="text-sm font-title text-health">{enemy.currentHealth}/{enemy.maxHealth}</span>
              {enemyDamageText !== null && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-destructive font-title text-sm animate-damage-drop">
                  -{enemyDamageText}
                </span>
              )}
            </div>
            {enemy.shield > 0 && (
              <div className="flex items-center gap-1 bg-card px-2 py-1 rounded">
                <Shield className="h-4 w-4 text-defense" />
                <span className="text-sm font-title text-defense">{enemy.shield}</span>
              </div>
            )}
          </div>

          {/* Intent */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded fantasy-border">
            <div className="flex items-center gap-2">
              {enemy.intent === "attack" ? (
                <><Swords className="h-4 w-4 text-destructive" /><span className="text-sm font-title text-destructive">{enemy.intentValue}</span></>
              ) : (
                <><Shield className="h-4 w-4 text-defense" /><span className="text-sm font-title text-defense">{enemy.intentValue}</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Character bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-card/50">
        <div className="flex items-center gap-4">
          <div className="w-20 h-28 rounded-lg bg-accent/30 flex items-center justify-center fantasy-border">
            <span className="font-title text-accent-foreground text-xs">YOU</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 relative">
              <Heart className="h-5 w-5 text-health" />
              <span className="font-title text-health">{character.currentHealth}/{character.maxHealth}</span>
              {playerDamageText !== null && (
                <span className="absolute -right-8 text-destructive font-title text-sm animate-damage-drop">
                  -{playerDamageText}
                </span>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Swords className="h-4 w-4 text-attack" />
                  <span className={`font-title text-sm ${character.attackBuffTurns > 0 ? "text-gold" : "text-attack"}`}>
                    {effectiveOffense}{character.attackBuffTurns > 0 && ` (×1.5)`}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs"><p>Offense — base damage for attack cards</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Shield className="h-4 w-4 text-defense" />
                  <span className="font-title text-sm text-defense">{character.defense} def → {character.defense} shield</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs"><p>Defense — shield gained per Defend card</p></TooltipContent>
            </Tooltip>
            {character.shield > 0 && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <span className="font-title text-sm text-accent">{character.shield} shield</span>
              </div>
            )}
            {/* Buffs */}
            {character.attackBuffTurns > 0 && (
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-gold" />
                <span className="font-title text-xs text-gold">+{character.attackBuff}% ({character.attackBuffTurns}t)</span>
              </div>
            )}
            {/* Player debuffs */}
            {character.debuffs.length > 0 && (
              <div className="flex gap-1 mt-1">
                {character.debuffs.map(d => (
                  <Tooltip key={d.id}>
                    <TooltipTrigger asChild>
                      <div className="w-6 h-6 rounded bg-card flex items-center justify-center border border-border cursor-help">
                        {d.effect === "chill" ? <Snowflake className="h-3 w-3 text-chill" /> : <Flame className="h-3 w-3 text-burn" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs"><p className="font-title">{d.name} ({d.turnsLeft}t)</p><p>{d.description}</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg fantasy-border">
            <Zap className="h-6 w-6 text-energy" />
            <span className="font-title text-2xl text-energy">{currentEnergy}/{character.maxEnergy}</span>
          </div>
        </div>

        <Button onClick={endTurn} size="lg" className="font-title"
          disabled={enemy.currentHealth <= 0 || character.currentHealth <= 0}>
          End Turn<ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Hand */}
      <div className="p-4 bg-card/30">
        <div className="flex items-end gap-4">
          <button className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowDeckPopup(true)}>
            <div className="w-14 h-20 rounded-lg bg-accent/20 fantasy-border flex items-center justify-center">
              <Layers className="h-6 w-6 text-accent" />
            </div>
            <span className="text-xs font-title text-muted-foreground">{deck.length}</span>
          </button>

          <div className="flex-1 flex justify-center gap-2 flex-wrap">
            {hand.map((card) => {
              const canPlay = card.cost <= currentEnergy;
              const isDragging = draggedCard === card.id;
              return (
                <div key={card.id}
                  ref={el => { cardRefs.current[card.id] = el; }}
                  onPointerDown={(e) => handlePointerDown(e, card)}
                  style={isDragging ? {
                    position: "fixed", left: dragPos.x - dragOffset.x, top: dragPos.y - dragOffset.y,
                    zIndex: 1000, pointerEvents: "none", touchAction: "none",
                  } : undefined}
                  className={`
                    w-28 h-40 rounded-lg border-2 p-2 flex flex-col relative
                    ${cardTypeColors[card.type]}
                    ${canPlay ? "cursor-grab hover:scale-105 hover:-translate-y-2" : "opacity-50 cursor-not-allowed"}
                    ${isDragging ? "scale-110 shadow-2xl rotate-3" : "transition-all duration-200"}
                  `}>
                  <div className="flex items-center gap-1 absolute top-2 right-2">
                    <Zap className="h-3 w-3 text-energy" />
                    <span className="text-xs font-bold text-energy">{card.cost}</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-1">
                    {card.effect === "chill" && <Snowflake className="h-4 w-4 text-chill" />}
                    {card.effect === "exhaust" && <Flame className="h-4 w-4 text-burn" />}
                    {card.effect === "shieldbash" && <Shield className="h-4 w-4 text-defense" />}
                    <span className="font-title text-sm text-center">{card.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowDiscardPopup(true)}>
            <div className="w-14 h-20 rounded-lg bg-destructive/20 fantasy-border flex items-center justify-center">
              <Archive className="h-6 w-6 text-destructive/70" />
            </div>
            <span className="text-xs font-title text-muted-foreground">{discardPile.length}</span>
          </button>
        </div>
      </div>

      {/* Deck Popup */}
      <Dialog open={showDeckPopup} onOpenChange={setShowDeckPopup}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-title">Draw Pile ({deck.length})</DialogTitle></DialogHeader>
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
          <DialogHeader><DialogTitle className="font-title">Discard Pile ({discardPile.length})</DialogTitle></DialogHeader>
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

      {/* Surrender Dialog */}
      <Dialog open={showSurrenderDialog} onOpenChange={setShowSurrenderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-title">Surrender?</DialogTitle>
            <DialogDescription className="font-body">
              Your run will end. You will receive <span className="text-gold font-bold">{Math.min(40, completedNodes.length * 4)}</span> credits based on progress ({completedNodes.length} nodes cleared).
              All progress in this tree instance will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSurrenderDialog(false)}>Continue Fighting</Button>
            <Button variant="destructive" onClick={handleSurrender}>Surrender</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Encounter;
