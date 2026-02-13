import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGameStore, Card as CardType, TREES } from "@/stores/gameStore";
import { useAudioStore } from "@/stores/audioStore";
import Settings from "@/pages/Settings";
import { Heart, Shield, Zap, Swords, ArrowRight, Layers, Archive, Flag, Snowflake, Flame, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";

const cardTypeColors = {
  attack: "border-destructive/60 bg-destructive/10",
  skill: "border-defense bg-defense/10",
  power: "border-gold bg-gold/10",
};

const cardDescriptions: Record<string, (card: CardType) => string> = {
  Strike: (c) => `Deal ×1.0 offense damage (${c.value})`,
  Slash: (c) => `Deal ×1.2 offense damage (${c.value})`,
  Icicle: (c) => `Deal ×0.8 offense damage (${c.value})\nInflict Chill (enemy damage -20%)`,
  Cinder: (c) => `Deal ×1.2 offense damage (${c.value})`,
  "Shield Bash": (c) => `Deal ×1.0 offense damage (${c.value})\nGain ${c.effectValue} shield`,
  Exhaust: (c) => `Deal ×0.5 offense damage (${c.value})\nInflict Exhaust (enemy damage -25%)`,
  Defend: (c) => `Gain ${c.value} shield`,
  Preparation: () => `+50% attack damage for 2 turns`,
};

const Encounter = () => {
  const navigate = useNavigate();
  const {
    character, enemy, hand, deck, discardPile, currentEnergy,
    playCard, endTurn, completeEncounter, surrenderEncounter,
    completedNodes, inEncounter, encounterResult, clearEncounterResult,
    currentTreeIndex,
  } = useGameStore();
  const { playBattleMusic, playMenuMusic, playSfx } = useAudioStore();

  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showDeckPopup, setShowDeckPopup] = useState(false);
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCardDetail, setShowCardDetail] = useState<CardType | null>(null);
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

  useEffect(() => { playBattleMusic(); return () => { }; }, [playBattleMusic]);

  useEffect(() => {
    if (!inEncounter && !enemy && !encounterResult) {
      playMenuMusic();
      navigate("/tree-instance");
    }
  }, [inEncounter, enemy, encounterResult, navigate, playMenuMusic]);

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
      playSfx("enemy_hit");
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
      playSfx("player_hit");
      setTimeout(() => setPlayerDamageText(null), 2000);
    }
    if (character) prevPlayerHp.current = character.currentHealth;
  }, [character?.currentHealth]);

  // Victory/defeat checks
  useEffect(() => {
    if (enemy && enemy.currentHealth <= 0) setTimeout(() => completeEncounter(true), 1200);
    if (character && character.currentHealth <= 0) setTimeout(() => completeEncounter(false), 1500);
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

  const DRAG_THRESHOLD = 5;

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
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  }, [currentEnergy]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggedCard) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    if (!isDragging) {
      const dx = Math.abs(e.clientX - dragStart.x);
      const dy = Math.abs(e.clientY - dragStart.y);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        setIsDragging(true);
        playSfx("card_drag");
      }
    }
  }, [draggedCard, isDragging, dragStart, playSfx]);

  const handlePointerUp = useCallback(() => {
    if (!draggedCard) return;
    const card = hand.find(c => c.id === draggedCard);

    // Click (no drag) → show card detail
    if (!isDragging && card) {
      playSfx("card_click");
      setShowCardDetail(card);
      setDraggedCard(null);
      setIsDragging(false);
      return;
    }

    if (!card) { setDraggedCard(null); setIsDragging(false); return; }

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
    setIsDragging(false);
  }, [draggedCard, dragPos, hand, playCard, isDragging, playSfx]);

  const handleSurrender = () => { surrenderEncounter(); setShowSurrenderDialog(false); };

  const handleResultAccept = () => {
    clearEncounterResult();
    playMenuMusic();
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
          {isTreeComplete && <p className="font-body text-primary/80 mb-2">You have conquered {treeName}!</p>}
          <div className="flex items-center justify-center gap-2 mt-6 mb-8">
            <span className="font-title text-2xl text-gold">+</span>
            <span className="font-title text-4xl text-gold animate-count-pulse">{creditCounter}</span>
            <span className="font-title text-lg text-muted-foreground">credits</span>
          </div>
          <Button size="lg" className="font-title" onClick={handleResultAccept}>Continue</Button>
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

  // Fan-style hand calculations
  const handCount = hand.length;
  const maxArc = 15; // max rotation spread
  const arcPerCard = handCount > 1 ? maxArc / (handCount - 1) : 0;

  return (
    <div className="min-h-screen void-bg flex flex-col select-none touch-none"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>

      {/* Settings button top-left */}
      <Button variant="ghost" size="sm" className="absolute left-2 top-2 font-title text-xs z-20"
        onClick={() => setShowSettings(true)}>
        <SettingsIcon className="h-4 w-4" />
      </Button>

      {/* Surrender top-right */}
      <Button variant="ghost" size="sm" className="absolute right-2 top-2 font-title text-xs z-10"
        onClick={() => setShowSurrenderDialog(true)}>
        <Flag className="mr-1 h-3 w-3" /> Surrender
      </Button>

      {/* Enemy area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div ref={enemyRef} className="relative">
          <div className={`
            w-28 h-36 md:w-32 md:h-40 rounded-lg flex flex-col items-center justify-center
            bg-secondary fantasy-border transition-all
            ${enemyShaking ? "animate-shake" : ""}
            ${draggedCard && isDragging && hand.find(c => c.id === draggedCard)?.type === "attack" ? "ring-4 ring-destructive ring-offset-2 ring-offset-background" : ""}
          `}>
            <span className="font-title text-foreground text-xs md:text-sm text-center px-1">{enemy.name}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{enemy.type}</span>
          </div>

          {/* Enemy debuffs - right side */}
          {enemy.debuffs.length > 0 && (
            <div className="absolute -right-9 top-0 flex flex-col gap-1">
              {enemy.debuffs.map(d => (
                <Tooltip key={d.id}>
                  <TooltipTrigger asChild>
                    <div className="w-6 h-6 rounded bg-card flex items-center justify-center border border-border cursor-help">
                      {d.effect === "chill" ? <Snowflake className="h-3 w-3 text-chill" /> : <Flame className="h-3 w-3 text-burn" />}
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
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
            <div className="flex items-center gap-1 bg-card px-2 py-0.5 rounded relative">
              <Heart className="h-3 w-3 text-health" />
              <span className="text-xs font-title text-health">{enemy.currentHealth}/{enemy.maxHealth}</span>
              {enemyDamageText !== null && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-destructive font-title text-xs animate-damage-drop">
                  -{enemyDamageText}
                </span>
              )}
            </div>
            {enemy.shield > 0 && (
              <div className="flex items-center gap-1 bg-card px-2 py-0.5 rounded">
                <Shield className="h-3 w-3 text-defense" />
                <span className="text-xs font-title text-defense">{enemy.shield}</span>
              </div>
            )}
          </div>

          {/* Intent */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-card px-2 py-0.5 rounded fantasy-border">
            <div className="flex items-center gap-1">
              {enemy.intent === "attack" ? (
                <><Swords className="h-3 w-3 text-destructive" /><span className="text-xs font-title text-destructive">{enemy.intentValue}</span></>
              ) : (
                <><Shield className="h-3 w-3 text-defense" /><span className="text-xs font-title text-defense">{enemy.intentValue}</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Character bar — responsive layout */}
      <div className="flex flex-col md:flex-row items-center justify-between px-3 md:px-8 py-3 bg-card/50 gap-2">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-14 h-20 md:w-20 md:h-28 rounded-lg bg-accent/30 flex items-center justify-center fantasy-border shrink-0">
            <span className="font-title text-accent-foreground text-[10px] md:text-xs">YOU</span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1 relative">
              <Heart className="h-4 w-4 text-health shrink-0" />
              <span className="font-title text-sm text-health">{character.currentHealth}/{character.maxHealth}</span>
              {playerDamageText !== null && (
                <span className="absolute -right-7 text-destructive font-title text-xs animate-damage-drop">-{playerDamageText}</span>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Swords className="h-3 w-3 text-attack shrink-0" />
                  <span className={`font-title text-xs ${character.attackBuffTurns > 0 ? "text-gold" : "text-attack"}`}>
                    {effectiveOffense}{character.attackBuffTurns > 0 && " (×1.5)"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs"><p>Offense — base damage for attack cards</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Shield className="h-3 w-3 text-defense shrink-0" />
                  <span className="font-title text-xs text-defense">{character.defense} def → {character.defense} shield</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs"><p>Defense — shield gained per Defend card</p></TooltipContent>
            </Tooltip>
            {character.shield > 0 && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-accent shrink-0" />
                <span className="font-title text-xs text-accent">{character.shield} shield</span>
              </div>
            )}
            {character.attackBuffTurns > 0 && (
              <div className="flex items-center gap-1">
                <Swords className="h-3 w-3 text-gold shrink-0" />
                <span className="font-title text-[10px] text-gold">+{character.attackBuff}% ({character.attackBuffTurns}t)</span>
              </div>
            )}
            {character.debuffs.length > 0 && (
              <div className="flex gap-1 mt-0.5">
                {character.debuffs.map(d => (
                  <Tooltip key={d.id}>
                    <TooltipTrigger asChild>
                      <div className="w-5 h-5 rounded bg-card flex items-center justify-center border border-border cursor-help">
                        {d.effect === "chill" ? <Snowflake className="h-2.5 w-2.5 text-chill" /> : <Flame className="h-2.5 w-2.5 text-burn" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs"><p className="font-title">{d.name} ({d.turnsLeft}t)</p><p>{d.description}</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Energy + End Turn — centered on mobile */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-lg fantasy-border">
            <Zap className="h-5 w-5 text-energy" />
            <span className="font-title text-xl text-energy">{currentEnergy}/{character.maxEnergy}</span>
          </div>
          <Button onClick={endTurn} size="sm" className="font-title"
            disabled={enemy.currentHealth <= 0 || character.currentHealth <= 0}>
            End Turn<ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Hand — fan style, always horizontal */}
      <div className="p-2 md:p-4 bg-card/30">
        <div className="flex items-end justify-center">
          <button className="flex flex-col items-center gap-0.5 min-w-[40px] md:min-w-[60px] cursor-pointer hover:scale-105 transition-transform mr-2"
            onClick={() => setShowDeckPopup(true)}>
            <div className="w-10 h-14 md:w-14 md:h-20 rounded-lg bg-accent/20 fantasy-border flex items-center justify-center">
              <Layers className="h-4 w-4 md:h-6 md:w-6 text-accent" />
            </div>
            <span className="text-[10px] font-title text-muted-foreground">{deck.length}</span>
          </button>

          <div className="flex-1 flex justify-center relative" style={{ minHeight: 100 }}>
            {hand.map((card, idx) => {
              const canPlay = card.cost <= currentEnergy;
              const isBeingDragged = draggedCard === card.id && isDragging;
              const rotation = handCount > 1 ? -maxArc / 2 + arcPerCard * idx : 0;
              const yOffset = Math.abs(rotation) * 0.8; // slight arch
              // Overlap: each card is offset by 65% of card width from previous
              const cardW = 80; // approximate card width for mobile
              const totalW = cardW + (handCount - 1) * cardW * 0.65;
              const startX = -totalW / 2 + cardW / 2;
              const xPos = startX + idx * cardW * 0.65;

              return (
                <div key={card.id}
                  ref={el => { cardRefs.current[card.id] = el; }}
                  onPointerDown={(e) => handlePointerDown(e, card)}
                  style={isBeingDragged ? {
                    position: "fixed", left: dragPos.x - dragOffset.x, top: dragPos.y - dragOffset.y,
                    zIndex: 1000, pointerEvents: "none", touchAction: "none",
                  } : {
                    position: "absolute",
                    left: `calc(50% + ${xPos}px)`,
                    bottom: 4 + yOffset,
                    transform: `rotate(${rotation}deg)`,
                    zIndex: idx + 1,
                    transformOrigin: "bottom center",
                  }}
                  className={`
                    w-[70px] h-[100px] md:w-[90px] md:h-[130px] rounded-lg border-2 p-1.5 md:p-2 flex flex-col relative
                    ${cardTypeColors[card.type]}
                    ${canPlay ? "cursor-grab hover:scale-110 hover:-translate-y-3 hover:z-50" : "opacity-50 cursor-not-allowed"}
                    ${isBeingDragged ? "scale-110 shadow-2xl rotate-3" : "transition-all duration-200"}
                  `}>
                  <div className="flex items-center gap-0.5 absolute top-1 right-1">
                    <Zap className="h-2.5 w-2.5 text-energy" />
                    <span className="text-[10px] font-bold text-energy">{card.cost}</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                    {card.effect === "chill" && <Snowflake className="h-3 w-3 text-chill" />}
                    {card.effect === "exhaust" && <Flame className="h-3 w-3 text-burn" />}
                    {card.effect === "shieldbash" && <Shield className="h-3 w-3 text-defense" />}
                    <span className="font-title text-[10px] md:text-xs text-center leading-tight">{card.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="flex flex-col items-center gap-0.5 min-w-[40px] md:min-w-[60px] cursor-pointer hover:scale-105 transition-transform ml-2"
            onClick={() => setShowDiscardPopup(true)}>
            <div className="w-10 h-14 md:w-14 md:h-20 rounded-lg bg-destructive/20 fantasy-border flex items-center justify-center">
              <Archive className="h-4 w-4 md:h-6 md:w-6 text-destructive/70" />
            </div>
            <span className="text-[10px] font-title text-muted-foreground">{discardPile.length}</span>
          </button>
        </div>
      </div>

      {/* Card Detail Modal */}
      <Dialog open={showCardDetail !== null} onOpenChange={() => setShowCardDetail(null)}>
        <DialogContent className="max-w-xs">
          {showCardDetail && (
            <div className="text-center">
              <div className={`mx-auto w-40 h-56 rounded-xl border-2 p-4 flex flex-col items-center justify-center ${cardTypeColors[showCardDetail.type]}`}>
                <div className="flex items-center gap-1 mb-2">
                  <Zap className="h-4 w-4 text-energy" />
                  <span className="text-sm font-bold text-energy">{showCardDetail.cost}</span>
                </div>
                {showCardDetail.effect === "chill" && <Snowflake className="h-6 w-6 text-chill mb-2" />}
                {showCardDetail.effect === "exhaust" && <Flame className="h-6 w-6 text-burn mb-2" />}
                {showCardDetail.effect === "shieldbash" && <Shield className="h-6 w-6 text-defense mb-2" />}
                {!showCardDetail.effect && showCardDetail.type === "attack" && <Swords className="h-6 w-6 text-attack mb-2" />}
                {!showCardDetail.effect && showCardDetail.type === "skill" && <Shield className="h-6 w-6 text-defense mb-2" />}
                <h3 className="font-title text-lg mb-2">{showCardDetail.name}</h3>
                <p className="font-body text-xs text-muted-foreground whitespace-pre-line">
                  {(cardDescriptions[showCardDetail.name] ?? (() => showCardDetail.description))(showCardDetail)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <Settings embedded onClose={() => setShowSettings(false)} />
        </DialogContent>
      </Dialog>

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
              Your run will end. You will receive <span className="text-gold font-bold">{Math.min(40, completedNodes.length * 4)}</span> credits based on progress.
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
