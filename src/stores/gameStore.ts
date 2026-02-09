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

export interface SaveSlotData {
  id: number;
  isEmpty: boolean;
  characterId: string | null;
  difficulty: Difficulty | null;
  currentTreeIndex: number | null;
  currentNodeId: string | null;
  currentHealth: number | null;
  maxHealth: number | null;
  completedNodes: string[];
  inTreeInstance: boolean;
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
  initializeCharacter: (characterId: string, baseStats: any) => void;
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

const STARTER_DECK: Card[] = [
  { id: "strike1", name: "Strike", type: "attack", cost: 1, value: 6, description: "Deal 6 damage" },
  { id: "strike2", name: "Strike", type: "attack", cost: 1, value: 6, description: "Deal 6 damage" },
  { id: "strike3", name: "Strike", type: "attack", cost: 1, value: 6, description: "Deal 6 damage" },
  { id: "strike4", name: "Strike", type: "attack", cost: 1, value: 6, description: "Deal 6 damage" },
  { id: "defend1", name: "Defend", type: "skill", cost: 1, value: 5, description: "Gain 5 shield" },
  { id: "defend2", name: "Defend", type: "skill", cost: 1, value: 5, description: "Gain 5 shield" },
  { id: "defend3", name: "Defend", type: "skill", cost: 1, value: 5, description: "Gain 5 shield" },
  { id: "defend4", name: "Defend", type: "skill", cost: 1, value: 5, description: "Gain 5 shield" },
  { id: "prep1", name: "Preparation", type: "power", cost: 1, value: 50, description: "+50% attack for 2 turns" },
  { id: "prep2", name: "Preparation", type: "power", cost: 1, value: 50, description: "+50% attack for 2 turns" },
];

const generateTree = (): TreeNode[] => {
  const nodes: TreeNode[] = [];
  const rows = 7; // 1 boss, 2 elite, 4 basic rows
  
  // Boss node at top
  nodes.push({
    id: "boss-0",
    type: "boss",
    row: 0,
    col: 1,
    connections: [],
    completed: false,
    available: false,
  });
  
  // Elite row 1
  nodes.push({
    id: "elite-1-0",
    type: "elite",
    row: 1,
    col: 0,
    connections: ["boss-0"],
    completed: false,
    available: false,
  });
  nodes.push({
    id: "elite-1-1",
    type: "elite",
    row: 1,
    col: 2,
    connections: ["boss-0"],
    completed: false,
    available: false,
  });
  
  // Basic rows
  for (let row = 2; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      const connections: string[] = [];
      if (row === 2) {
        // Connect to elites
        if (col <= 1) connections.push("elite-1-0");
        if (col >= 1) connections.push("elite-1-1");
      } else {
        // Connect to previous row
        if (col > 0) connections.push(`basic-${row - 1}-${col - 1}`);
        connections.push(`basic-${row - 1}-${col}`);
        if (col < 2) connections.push(`basic-${row - 1}-${col + 1}`);
      }
      
      nodes.push({
        id: `basic-${row}-${col}`,
        type: "basic",
        row,
        col,
        connections: connections.filter((c, i, arr) => arr.indexOf(c) === i),
        completed: false,
        available: row === 5, // Bottom row starts available
      });
    }
  }
  
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
  const treeMod = 1 + (treeIndex * 0.1); // 10% increase per tree
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

const initialSaveSlots: SaveSlotData[] = [
  { id: 1, isEmpty: true, characterId: null, difficulty: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false },
  { id: 2, isEmpty: true, characterId: null, difficulty: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false },
  { id: 3, isEmpty: true, characterId: null, difficulty: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false },
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
  
  setDifficulty: (difficulty) => set({ difficulty }),
  
  setCurrentTree: (treeIndex) => set({ currentTreeIndex: treeIndex }),
  
  initializeCharacter: (characterId, baseStats) => {
    set({
      character: {
        id: characterId,
        name: characterId,
        maxHealth: baseStats.health,
        currentHealth: baseStats.health,
        energy: baseStats.energy,
        maxEnergy: baseStats.energy,
        shield: 0,
        offense: baseStats.offense,
        defense: baseStats.defense,
        attackBuff: 0,
        attackBuffTurns: 0,
      },
    });
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
    const deck = shuffleArray([...STARTER_DECK]);
    const hand = deck.splice(0, 5);
    
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
      const updatedNodes = treeNodes.map(node => {
        if (node.id === currentNodeId) {
          return { ...node, completed: true, available: false };
        }
        // Make connected nodes available if they connect to this node
        if (node.connections.includes(currentNodeId)) {
          return { ...node, available: true };
        }
        return node;
      });
      
      const currentNode = treeNodes.find(n => n.id === currentNodeId);
      const isBossDefeated = currentNode?.type === "boss";
      
      set({
        inEncounter: false,
        enemy: null,
        hand: [],
        deck: [],
        discardPile: [],
        treeNodes: updatedNodes,
        completedNodes: [...completedNodes, currentNodeId],
        currentNodeId: null,
        // Reset tree if boss defeated
        ...(isBossDefeated && currentTreeIndex !== null ? {
          currentTreeIndex: currentTreeIndex + 1 > 4 ? null : currentTreeIndex,
        } : {}),
      });
      
      get().saveProgress();
    } else {
      // Defeat - reset run
      set({
        inEncounter: false,
        enemy: null,
        hand: [],
        deck: [],
        discardPile: [],
        currentNodeId: null,
      });
    }
  },
  
  takeDamage: (damage) => {
    const { character } = get();
    if (!character) return;
    
    // Apply defense reduction
    const reducedDamage = Math.max(0, damage - Math.floor(damage * (character.defense / 100)));
    
    // Shield absorbs damage first
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
    
    set({
      character: {
        ...character,
        currentHealth: newHealth,
        shield: newShield,
      },
    });
  },
  
  addShield: (amount) => {
    const { character } = get();
    if (!character) return;
    
    // Apply defense bonus to shield
    const bonusShield = Math.floor(amount * (1 + character.defense / 100));
    
    set({
      character: {
        ...character,
        shield: character.shield + bonusShield,
      },
    });
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
      // Calculate damage with offense and attack buff
      let damage = card.value + character.offense;
      if (character.attackBuffTurns > 0) {
        damage = Math.floor(damage * (1 + character.attackBuff / 100));
      }
      
      // Apply to enemy shield first
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
      // Add shield
      const shieldAmount = card.value + Math.floor(card.value * (character.defense / 100));
      newCharacter.shield += shieldAmount;
    } else if (card.type === "power") {
      // Preparation - attack buff
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
    
    // Enemy action
    let newCharacter = { ...character };
    let newEnemy = { ...enemy };
    
    if (enemy.intent === "attack") {
      // Apply damage to player
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
      // Enemy gains shield
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
    
    // Discard hand and draw new cards
    let newDeck = [...deck];
    let newDiscard = [...discardPile, ...hand];
    
    if (newDeck.length < 5) {
      newDeck = shuffleArray([...newDeck, ...newDiscard]);
      newDiscard = [];
    }
    
    const newHand = newDeck.splice(0, 5);
    
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
    if (activeSlot === null || !character) return;
    
    const updatedSlots = saveSlots.map(slot => {
      if (slot.id === activeSlot) {
        return {
          ...slot,
          isEmpty: false,
          characterId: character.id,
          difficulty,
          currentTreeIndex,
          currentNodeId,
          currentHealth: character.currentHealth,
          maxHealth: character.maxHealth,
          completedNodes,
          inTreeInstance: treeNodes.length > 0,
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
