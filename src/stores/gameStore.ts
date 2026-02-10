import { create } from "zustand";

export type Difficulty = "beginner" | "easy" | "hard" | "nightmare";
export type NodeType = "basic" | "elite" | "boss";
export type EnemyType = "basic" | "elite" | "boss";

export interface DifficultyModifier {
  name: string;
  label: string;
  multiplier: number;
  description: string;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyModifier> = {
  beginner: { name: "beginner", label: "Beginner", multiplier: 0.75, description: "75% enemy stats" },
  easy: { name: "easy", label: "Easy", multiplier: 1.0, description: "100% enemy stats" },
  hard: { name: "hard", label: "Hard", multiplier: 1.5, description: "150% enemy stats" },
  nightmare: { name: "nightmare", label: "Nightmare", multiplier: 2.0, description: "200% enemy stats" },
};

export interface CharacterDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseStats: {
    health: number;
    energy: number;
    offense: number;
    defense: number;
    cardDraw: number;
    deckSize: number;
    gold: number;
    luck: number;
    armor: number;
  };
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: "warrior",
    name: "The Warrior",
    icon: "Sword",
    description: "A battle-hardened fighter who excels in direct combat.",
    baseStats: { health: 80, energy: 3, offense: 10, defense: 8, cardDraw: 5, deckSize: 10, gold: 100, luck: 5, armor: 5 },
  },
  {
    id: "guardian",
    name: "The Guardian",
    icon: "Shield",
    description: "A defensive specialist who outlasts opponents.",
    baseStats: { health: 90, energy: 3, offense: 6, defense: 12, cardDraw: 5, deckSize: 10, gold: 100, luck: 5, armor: 10 },
  },
  {
    id: "mystic",
    name: "The Mystic",
    icon: "Zap",
    description: "A wielder of arcane powers with versatile abilities.",
    baseStats: { health: 65, energy: 4, offense: 8, defense: 5, cardDraw: 6, deckSize: 12, gold: 100, luck: 10, armor: 0 },
  },
];

export interface TreeNode {
  id: string;
  type: NodeType;
  row: number;
  col: number;
  connections: string[];
  completed: boolean;
  available: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  maxHealth: number;
  currentHealth: number;
  shield: number;
  baseDamageMin: number;
  baseDamageMax: number;
  intent: "attack" | "shield";
  intentValue: number;
}

export interface Card {
  id: string;
  name: string;
  type: "attack" | "skill" | "power";
  cost: number;
  value: number;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  energy: number;
  maxEnergy: number;
  shield: number;
  offense: number;
  defense: number;
  attackBuff: number;
  attackBuffTurns: number;
}

export interface StatUpgrades {
  health: number;
  energy: number;
  offense: number;
  defense: number;
  cardDraw: number;
  armor: number;
}

export interface SaveSlotData {
  id: number;
  isEmpty: boolean;
  username: string | null;
  difficulty: Difficulty | null;
  credits: number;
  characterId: string | null;
  currentTreeIndex: number | null;
  currentNodeId: string | null;
  currentHealth: number | null;
  maxHealth: number | null;
  completedNodes: string[];
  inTreeInstance: boolean;
  statUpgrades: Record<string, StatUpgrades>;
  completedTreeNodes: number; // tracks how many nodes completed for credit calc
}

export interface GameState {
  // Current session
  activeSlot: number | null;
  difficulty: Difficulty | null;
  currentTreeIndex: number | null;
  character: Character | null;
  treeNodes: TreeNode[];
  currentNodeId: string | null;
  completedNodes: string[];
  inEncounter: boolean;
  
  // Combat state
  enemy: Enemy | null;
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  currentEnergy: number;
  
  // Save slots
  saveSlots: SaveSlotData[];
  
  // Actions
  setActiveSlot: (slot: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setCurrentTree: (treeIndex: number) => void;
  createSaveSlot: (slotId: number, username: string) => void;
  deleteSaveSlot: (slotId: number) => void;
  initializeCharacter: (characterId: string) => void;
  initializeTree: () => void;
  selectNode: (nodeId: string) => void;
  startEncounter: (nodeType: NodeType) => void;
  completeEncounter: (victory: boolean) => void;
  takeDamage: (damage: number) => void;
  addShield: (amount: number) => void;
  playCard: (cardId: string, targetEnemy: boolean) => void;
  endTurn: () => void;
  drawCards: (count: number) => void;
  saveProgress: () => void;
  loadSlot: (slotId: number) => void;
  resetRun: () => void;
  upgradeStat: (characterId: string, stat: keyof StatUpgrades) => boolean;
  getUpgradeCost: (characterId: string, stat: keyof StatUpgrades) => number;
  getCharacterDeck: (characterId: string) => Card[];
  getEffectiveStats: (characterId: string) => CharacterDefinition['baseStats'];
  awardCredits: (bossDefeated: boolean, nodesCompleted: number) => void;
}

const ENEMY_TEMPLATES = {
  basic: [
    { name: "Goblin", baseHealth: 30, baseDamageMin: 5, baseDamageMax: 10 },
    { name: "Skeleton", baseHealth: 25, baseDamageMin: 6, baseDamageMax: 12 },
    { name: "Slime", baseHealth: 40, baseDamageMin: 4, baseDamageMax: 8 },
  ],
  elite: [
    { name: "Orc Warrior", baseHealth: 60, baseDamageMin: 10, baseDamageMax: 18 },
    { name: "Dark Knight", baseHealth: 70, baseDamageMin: 12, baseDamageMax: 20 },
    { name: "Corrupted Mage", baseHealth: 50, baseDamageMin: 15, baseDamageMax: 25 },
  ],
  boss: [
    { name: "The Overlord", baseHealth: 120, baseDamageMin: 15, baseDamageMax: 30 },
    { name: "Ancient Dragon", baseHealth: 150, baseDamageMin: 20, baseDamageMax: 35 },
    { name: "Lich King", baseHealth: 100, baseDamageMin: 25, baseDamageMax: 40 },
  ],
};

const buildStarterDeck = (): Card[] => [
  // 6 strikes
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `strike${i + 1}`, name: "Strike", type: "attack" as const, cost: 1, value: 6, description: "Deal 6 damage",
  })),
  // 6 defends
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `defend${i + 1}`, name: "Defend", type: "skill" as const, cost: 1, value: 5, description: "Gain 5 shield",
  })),
  // 3 preparations (2 energy cost)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `prep${i + 1}`, name: "Preparation", type: "power" as const, cost: 2, value: 50, description: "+50% attack for 2 turns",
  })),
];

const generateTree = (): TreeNode[] => {
  const nodes: TreeNode[] = [];
  const totalRows = 10; // 10 rows including boss

  // Row 0 (bottom) = 4 basic nodes, always available
  for (let col = 0; col < 4; col++) {
    nodes.push({
      id: `node-0-${col}`,
      type: "basic",
      row: 0,
      col,
      connections: [],
      completed: false,
      available: true,
    });
  }

  // Rows 1-8: random basic/elite nodes, 3-4 cols per row, with crisscross connections
  for (let row = 1; row < totalRows - 1; row++) {
    const colCount = Math.random() < 0.5 ? 3 : 4;
    
    for (let col = 0; col < colCount; col++) {
      // 15% chance elite (rows 4+), rest basic
      const isElite = row >= 4 && Math.random() < 0.15;
      
      // Build connections to previous row nodes
      const prevRowNodes = nodes.filter(n => n.row === row - 1);
      const connections: string[] = [];
      
      // Each node connects to 1-2 nodes in the row above it
      // Map col proportionally to previous row
      const prevColCount = prevRowNodes.length;
      const mappedCol = (col / (colCount - 1 || 1)) * (prevColCount - 1);
      const primaryIdx = Math.round(mappedCol);
      
      if (prevRowNodes[primaryIdx]) {
        connections.push(prevRowNodes[primaryIdx].id);
      }
      // Add adjacent connections for crisscross
      if (primaryIdx > 0 && Math.random() < 0.4) {
        connections.push(prevRowNodes[primaryIdx - 1].id);
      }
      if (primaryIdx < prevColCount - 1 && Math.random() < 0.4) {
        connections.push(prevRowNodes[primaryIdx + 1].id);
      }

      nodes.push({
        id: `node-${row}-${col}`,
        type: isElite ? "elite" : "basic",
        row,
        col,
        connections: [...new Set(connections)],
        completed: false,
        available: false,
      });
    }
  }

  // Boss row (row 9) = 1 boss node connecting to all row 8 nodes
  const row8Nodes = nodes.filter(n => n.row === totalRows - 2);
  nodes.push({
    id: `node-${totalRows - 1}-0`,
    type: "boss",
    row: totalRows - 1,
    col: 0,
    connections: row8Nodes.map(n => n.id),
    completed: false,
    available: false,
  });

  return nodes;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const spawnEnemy = (type: EnemyType, difficulty: Difficulty, treeIndex: number): Enemy => {
  const templates = ENEMY_TEMPLATES[type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const diffMod = DIFFICULTIES[difficulty].multiplier;
  const treeMod = 1 + (treeIndex * 0.1);
  const totalMod = diffMod * treeMod;
  
  const maxHealth = Math.round(template.baseHealth * totalMod);
  const intent = Math.random() > 0.5 ? "attack" : "shield";
  const intentValue = intent === "attack" 
    ? Math.round((template.baseDamageMin + Math.random() * (template.baseDamageMax - template.baseDamageMin)) * totalMod)
    : Math.round(10 * totalMod);
  
  return {
    id: `enemy-${Date.now()}`,
    name: template.name,
    type,
    maxHealth,
    currentHealth: maxHealth,
    shield: 0,
    baseDamageMin: Math.round(template.baseDamageMin * totalMod),
    baseDamageMax: Math.round(template.baseDamageMax * totalMod),
    intent,
    intentValue,
  };
};

const emptyUpgrades = (): StatUpgrades => ({
  health: 0, energy: 0, offense: 0, defense: 0, cardDraw: 0, armor: 0,
});

const initialSaveSlots: SaveSlotData[] = [
  { id: 1, isEmpty: true, username: null, difficulty: null, credits: 0, characterId: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false, statUpgrades: {}, completedTreeNodes: 0 },
  { id: 2, isEmpty: true, username: null, difficulty: null, credits: 0, characterId: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false, statUpgrades: {}, completedTreeNodes: 0 },
  { id: 3, isEmpty: true, username: null, difficulty: null, credits: 0, characterId: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false, statUpgrades: {}, completedTreeNodes: 0 },
];

export const useGameStore = create<GameState>((set, get) => ({
  activeSlot: null,
  difficulty: null,
  currentTreeIndex: null,
  character: null,
  treeNodes: [],
  currentNodeId: null,
  completedNodes: [],
  inEncounter: false,
  enemy: null,
  hand: [],
  deck: [],
  discardPile: [],
  currentEnergy: 0,
  saveSlots: initialSaveSlots,
  
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  
  setDifficulty: (difficulty) => {
    const { activeSlot, saveSlots } = get();
    const updatedSlots = saveSlots.map(s =>
      s.id === activeSlot ? { ...s, difficulty } : s
    );
    set({ difficulty, saveSlots: updatedSlots });
  },
  
  setCurrentTree: (treeIndex) => set({ currentTreeIndex: treeIndex }),
  
  createSaveSlot: (slotId, username) => {
    const { saveSlots } = get();
    const updatedSlots = saveSlots.map(s =>
      s.id === slotId ? { ...s, isEmpty: false, username, credits: 0, statUpgrades: {} } : s
    );
    set({ saveSlots: updatedSlots, activeSlot: slotId });
  },
  
  deleteSaveSlot: (slotId) => {
    const { saveSlots } = get();
    const updatedSlots = saveSlots.map(s =>
      s.id === slotId ? { ...initialSaveSlots.find(is => is.id === slotId)! } : s
    );
    set({ saveSlots: updatedSlots });
  },
  
  initializeCharacter: (characterId) => {
    const charDef = CHARACTERS.find(c => c.id === characterId);
    if (!charDef) return;
    
    const stats = get().getEffectiveStats(characterId);
    
    set({
      character: {
        id: characterId,
        name: charDef.name,
        maxHealth: stats.health,
        currentHealth: stats.health,
        energy: stats.energy,
        maxEnergy: stats.energy,
        shield: 0,
        offense: stats.offense,
        defense: stats.defense,
        attackBuff: 0,
        attackBuffTurns: 0,
      },
    });
  },
  
  getEffectiveStats: (characterId) => {
    const { activeSlot, saveSlots } = get();
    const charDef = CHARACTERS.find(c => c.id === characterId);
    if (!charDef) return { health: 0, energy: 0, offense: 0, defense: 0, cardDraw: 0, deckSize: 0, gold: 0, luck: 0, armor: 0 };
    
    const slot = saveSlots.find(s => s.id === activeSlot);
    const upgrades = slot?.statUpgrades?.[characterId] ?? emptyUpgrades();
    
    return {
      health: charDef.baseStats.health + upgrades.health * 5,
      energy: charDef.baseStats.energy + upgrades.energy,
      offense: charDef.baseStats.offense + upgrades.offense * 2,
      defense: charDef.baseStats.defense + upgrades.defense * 2,
      cardDraw: charDef.baseStats.cardDraw + upgrades.cardDraw,
      deckSize: charDef.baseStats.deckSize,
      gold: charDef.baseStats.gold,
      luck: charDef.baseStats.luck,
      armor: charDef.baseStats.armor + upgrades.armor * 2,
    };
  },
  
  getCharacterDeck: (_characterId) => {
    return buildStarterDeck();
  },
  
  getUpgradeCost: (characterId, stat) => {
    const { activeSlot, saveSlots } = get();
    const slot = saveSlots.find(s => s.id === activeSlot);
    const upgrades = slot?.statUpgrades?.[characterId] ?? emptyUpgrades();
    const level = upgrades[stat];
    // First 5 upgrades cost 50, then +10 per subsequent
    if (level < 5) return 50;
    return 50 + (level - 4) * 10;
  },
  
  upgradeStat: (characterId, stat) => {
    const { activeSlot, saveSlots } = get();
    const slot = saveSlots.find(s => s.id === activeSlot);
    if (!slot) return false;
    
    const upgrades = slot.statUpgrades?.[characterId] ?? emptyUpgrades();
    const cost = get().getUpgradeCost(characterId, stat);
    
    if (slot.credits < cost) return false;
    
    const newUpgrades = { ...upgrades, [stat]: upgrades[stat] + 1 };
    const updatedSlots = saveSlots.map(s =>
      s.id === activeSlot ? {
        ...s,
        credits: s.credits - cost,
        statUpgrades: { ...s.statUpgrades, [characterId]: newUpgrades },
      } : s
    );
    set({ saveSlots: updatedSlots });
    return true;
  },
  
  awardCredits: (bossDefeated, nodesCompleted) => {
    const { activeSlot, saveSlots } = get();
    const credits = bossDefeated ? 100 : Math.min(40, nodesCompleted * 4);
    const updatedSlots = saveSlots.map(s =>
      s.id === activeSlot ? { ...s, credits: s.credits + credits } : s
    );
    set({ saveSlots: updatedSlots });
  },
  
  initializeTree: () => {
    const nodes = generateTree();
    set({ 
      treeNodes: nodes, 
      completedNodes: [],
      currentNodeId: null,
    });
  },
  
  selectNode: (nodeId) => {
    const { treeNodes } = get();
    const node = treeNodes.find(n => n.id === nodeId);
    if (node && node.available) {
      set({ currentNodeId: nodeId });
    }
  },
  
  startEncounter: (nodeType) => {
    const { difficulty, currentTreeIndex, character } = get();
    if (!difficulty || currentTreeIndex === null || !character) return;
    
    const enemy = spawnEnemy(nodeType, difficulty, currentTreeIndex);
    const fullDeck = buildStarterDeck();
    const deck = shuffleArray([...fullDeck]);
    const cardDraw = character.energy >= 4 ? 6 : 5; // Mystic draws more
    const hand = deck.splice(0, cardDraw);
    
    set({
      inEncounter: true,
      enemy,
      deck,
      hand,
      discardPile: [],
      currentEnergy: character.maxEnergy,
    });
  },
  
  completeEncounter: (victory) => {
    const { currentNodeId, treeNodes, completedNodes, currentTreeIndex } = get();
    
    if (victory && currentNodeId) {
      const currentNode = treeNodes.find(n => n.id === currentNodeId);
      const currentRow = currentNode?.row ?? 0;
      const isBossDefeated = currentNode?.type === "boss";
      
      // Mark current node completed and disable all nodes on the same row
      // Make nodes on the NEXT row available (only nodes that connect to completed nodes)
      const updatedNodes = treeNodes.map(node => {
        if (node.id === currentNodeId) {
          return { ...node, completed: true, available: false };
        }
        // Disable all other nodes on the same row
        if (node.row === currentRow && node.id !== currentNodeId) {
          return { ...node, available: false };
        }
        // Make next row nodes available if they connect to the completed node
        if (node.row === currentRow + 1 && node.connections.includes(currentNodeId)) {
          return { ...node, available: true };
        }
        return node;
      });
      
      const newCompletedNodes = [...completedNodes, currentNodeId];
      
      set({
        inEncounter: false,
        enemy: null,
        hand: [],
        deck: [],
        discardPile: [],
        treeNodes: updatedNodes,
        completedNodes: newCompletedNodes,
        currentNodeId: null,
      });
      
      if (isBossDefeated) {
        get().awardCredits(true, newCompletedNodes.length);
        // Reset tree state but keep on summoner menu
        set({
          treeNodes: [],
          completedNodes: [],
          character: null,
          currentTreeIndex: null,
        });
      } else {
        get().saveProgress();
      }
    } else {
      // Defeat - award partial credits
      const { completedNodes: cn } = get();
      get().awardCredits(false, cn.length);
      set({
        inEncounter: false,
        enemy: null,
        hand: [],
        deck: [],
        discardPile: [],
        currentNodeId: null,
        treeNodes: [],
        completedNodes: [],
        character: null,
        currentTreeIndex: null,
      });
    }
  },
  
  takeDamage: (damage) => {
    const { character } = get();
    if (!character) return;
    
    const reducedDamage = Math.max(0, damage - Math.floor(damage * (character.defense / 100)));
    let remainingDamage = reducedDamage;
    let newShield = character.shield;
    
    if (newShield > 0) {
      if (newShield >= remainingDamage) {
        newShield -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newShield;
        newShield = 0;
      }
    }
    
    const newHealth = Math.max(0, character.currentHealth - remainingDamage);
    set({ character: { ...character, currentHealth: newHealth, shield: newShield } });
  },
  
  addShield: (amount) => {
    const { character } = get();
    if (!character) return;
    const bonusShield = Math.floor(amount * (1 + character.defense / 100));
    set({ character: { ...character, shield: character.shield + bonusShield } });
  },
  
  playCard: (cardId, targetEnemy) => {
    const { hand, discardPile, currentEnergy, character, enemy } = get();
    if (!character || !enemy) return;
    
    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;
    
    const card = hand[cardIndex];
    if (card.cost > currentEnergy) return;
    
    const newHand = [...hand];
    newHand.splice(cardIndex, 1);
    
    let newEnemy = { ...enemy };
    let newCharacter = { ...character };
    
    if (card.type === "attack" && targetEnemy) {
      let damage = card.value + character.offense;
      if (character.attackBuffTurns > 0) {
        damage = Math.floor(damage * (1 + character.attackBuff / 100));
      }
      if (newEnemy.shield > 0) {
        if (newEnemy.shield >= damage) {
          newEnemy.shield -= damage;
          damage = 0;
        } else {
          damage -= newEnemy.shield;
          newEnemy.shield = 0;
        }
      }
      newEnemy.currentHealth = Math.max(0, newEnemy.currentHealth - damage);
    } else if (card.type === "skill") {
      const shieldAmount = card.value + Math.floor(card.value * (character.defense / 100));
      newCharacter.shield += shieldAmount;
    } else if (card.type === "power") {
      newCharacter.attackBuff = card.value;
      newCharacter.attackBuffTurns = 2;
    }
    
    set({
      hand: newHand,
      discardPile: [...discardPile, card],
      currentEnergy: currentEnergy - card.cost,
      enemy: newEnemy,
      character: newCharacter,
    });
  },
  
  endTurn: () => {
    const { enemy, character, hand, discardPile, deck } = get();
    if (!enemy || !character) return;
    
    let newCharacter = { ...character };
    let newEnemy = { ...enemy };
    
    if (enemy.intent === "attack") {
      let damage = enemy.intentValue;
      if (newCharacter.shield > 0) {
        if (newCharacter.shield >= damage) {
          newCharacter.shield -= damage;
          damage = 0;
        } else {
          damage -= newCharacter.shield;
          newCharacter.shield = 0;
        }
      }
      newCharacter.currentHealth = Math.max(0, newCharacter.currentHealth - damage);
    } else {
      newEnemy.shield += enemy.intentValue;
    }
    
    // New enemy intent
    const newIntent = Math.random() > 0.5 ? "attack" : "shield";
    const newIntentValue = newIntent === "attack"
      ? Math.round(enemy.baseDamageMin + Math.random() * (enemy.baseDamageMax - enemy.baseDamageMin))
      : Math.round(10 + Math.random() * 10);
    
    newEnemy.intent = newIntent;
    newEnemy.intentValue = newIntentValue;
    
    // Decrease attack buff turns
    if (newCharacter.attackBuffTurns > 0) {
      newCharacter.attackBuffTurns -= 1;
      if (newCharacter.attackBuffTurns === 0) {
        newCharacter.attackBuff = 0;
      }
    }
    
    // Reset shield at start of turn (like STS)
    newCharacter.shield = 0;
    
    // Discard remaining hand, then draw new cards
    let newDiscard = [...discardPile, ...hand];
    let newDeck = [...deck];
    
    const drawCount = newCharacter.maxEnergy >= 4 ? 6 : 5;
    
    // If deck doesn't have enough, shuffle discard into deck
    if (newDeck.length < drawCount) {
      newDeck = shuffleArray([...newDeck, ...newDiscard]);
      newDiscard = [];
    }
    
    const newHand = newDeck.splice(0, drawCount);
    
    set({
      enemy: newEnemy,
      character: newCharacter,
      currentEnergy: newCharacter.maxEnergy,
      hand: newHand,
      deck: newDeck,
      discardPile: newDiscard,
    });
  },
  
  drawCards: (count) => {
    const { deck, hand, discardPile } = get();
    let newDeck = [...deck];
    let newHand = [...hand];
    let newDiscard = [...discardPile];
    
    for (let i = 0; i < count; i++) {
      if (newDeck.length === 0) {
        newDeck = shuffleArray([...newDiscard]);
        newDiscard = [];
      }
      if (newDeck.length > 0) {
        newHand.push(newDeck.shift()!);
      }
    }
    
    set({ deck: newDeck, hand: newHand, discardPile: newDiscard });
  },
  
  saveProgress: () => {
    const { activeSlot, character, difficulty, currentTreeIndex, currentNodeId, completedNodes, saveSlots, treeNodes } = get();
    if (activeSlot === null) return;
    
    const updatedSlots = saveSlots.map(slot => {
      if (slot.id === activeSlot) {
        return {
          ...slot,
          isEmpty: false,
          characterId: character?.id ?? slot.characterId,
          difficulty,
          currentTreeIndex,
          currentNodeId,
          currentHealth: character?.currentHealth ?? slot.currentHealth,
          maxHealth: character?.maxHealth ?? slot.maxHealth,
          completedNodes,
          inTreeInstance: treeNodes.length > 0,
          completedTreeNodes: completedNodes.length,
        };
      }
      return slot;
    });
    
    set({ saveSlots: updatedSlots });
  },
  
  loadSlot: (slotId) => {
    const { saveSlots } = get();
    const slot = saveSlots.find(s => s.id === slotId);
    if (!slot || slot.isEmpty) return;
    
    set({
      activeSlot: slotId,
      difficulty: slot.difficulty,
      currentTreeIndex: slot.currentTreeIndex,
      completedNodes: slot.completedNodes,
    });
  },
  
  resetRun: () => {
    set({
      character: null,
      treeNodes: [],
      currentNodeId: null,
      completedNodes: [],
      inEncounter: false,
      enemy: null,
      hand: [],
      deck: [],
      discardPile: [],
      currentEnergy: 0,
    });
  },
}));
