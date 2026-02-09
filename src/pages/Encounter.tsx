import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGameStore, Card as CardType } from "@/stores/gameStore";
import { Heart, Shield, Zap, Swords, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  useEffect(() => {
    if (!inEncounter || !enemy) {
      navigate("/tree-instance");
    }
  }, [inEncounter, enemy, navigate]);

  useEffect(() => {
    // Check for victory/defeat
    if (enemy && enemy.currentHealth <= 0) {
      setBattleLog(prev => [...prev, `${enemy.name} defeated!`]);
      setTimeout(() => {
        completeEncounter(true);
        navigate("/tree-instance");
      }, 1500);
    }
    
    if (character && character.currentHealth <= 0) {
      setBattleLog(prev => [...prev, "You have been defeated!"]);
      setTimeout(() => {
        completeEncounter(false);
        navigate("/");
      }, 1500);
    }
  }, [enemy?.currentHealth, character?.currentHealth, completeEncounter, navigate, enemy, character]);

  const handleCardClick = (card: CardType) => {
    if (card.cost > currentEnergy) return;
    
    if (card.type === "attack") {
      setSelectedCard(card.id);
    } else {
      // Skills and powers target self
      playCard(card.id, false);
      setBattleLog(prev => [...prev, `Played ${card.name}`]);
      setSelectedCard(null);
    }
  };

  const handleEnemyClick = () => {
    if (selectedCard) {
      const card = hand.find(c => c.id === selectedCard);
      if (card) {
        playCard(selectedCard, true);
        setBattleLog(prev => [...prev, `${card.name} dealt damage!`]);
      }
      setSelectedCard(null);
    }
  };

  const handleEndTurn = () => {
    setBattleLog(prev => [...prev, "Turn ended"]);
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar - Enemy area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className={`relative cursor-pointer transition-all ${selectedCard ? "ring-4 ring-red-500 ring-offset-4 ring-offset-background" : ""}`}
          onClick={handleEnemyClick}
        >
          {/* Enemy placeholder - colored box */}
          <div className={`
            w-32 h-40 rounded-lg flex flex-col items-center justify-center
            ${enemy.type === "basic" ? "bg-blue-600" : enemy.type === "elite" ? "bg-orange-600" : "bg-red-700"}
            fantasy-border
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

        {/* Energy and deck info */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg fantasy-border">
            <Zap className="h-6 w-6 text-energy" />
            <span className="font-title text-2xl text-energy">{currentEnergy}/{character.maxEnergy}</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Deck: {deck.length}</span>
            <span>Discard: {discardPile.length}</span>
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

      {/* Bottom - Hand */}
      <div className="p-4 bg-card/30">
        <div className="flex justify-center gap-2 flex-wrap">
          {hand.map((card) => {
            const canPlay = card.cost <= currentEnergy;
            const isSelected = selectedCard === card.id;
            
            return (
              <div
                key={card.id}
                onClick={() => canPlay && handleCardClick(card)}
                className={`
                  w-28 h-40 rounded-lg border-2 p-2 flex flex-col cursor-pointer
                  transition-all duration-200
                  ${cardTypeColors[card.type]}
                  ${canPlay ? "hover:scale-105 hover:-translate-y-2" : "opacity-50 cursor-not-allowed"}
                  ${isSelected ? "ring-2 ring-primary scale-105 -translate-y-2" : ""}
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
        
        {selectedCard && (
          <p className="text-center mt-2 text-sm text-muted-foreground animate-pulse">
            Click on the enemy to attack
          </p>
        )}
      </div>
    </div>
  );
};

export default Encounter;
