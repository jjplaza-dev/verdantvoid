import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

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

export const TREES = [
  { id: 0, name: "The Whispering Woods", description: "A dark forest filled with lesser creatures", modifier: "Base difficulty", strengthLabel: "Base", strengthColor: "text-muted-foreground" },
  { id: 1, name: "The Corrupted Grove", description: "Twisted trees and stronger beasts", modifier: "+10% enemy strength", strengthLabel: "+10% enemy strength", strengthColor: "text-yellow-400" },
  { id: 2, name: "The Shadow Thicket", description: "Where light fears to tread", modifier: "+20% enemy strength", strengthLabel: "+20% enemy strength", strengthColor: "text-orange-400" },
  { id: 3, name: "The Blighted Depths", description: "Ancient horrors lurk within", modifier: "+30% enemy strength", strengthLabel: "+30% enemy strength", strengthColor: "text-orange-500" },
  { id: 4, name: "The Nightmare Canopy", description: "Only the strongest survive", modifier: "+40% enemy strength", strengthLabel: "+40% enemy strength", strengthColor: "text-red-500" },
];

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
    description: "A battle-hardened fighter who excels in direct combat with powerful slashes.",
    baseStats: { health: 80, energy: 3, offense: 10, defense: 8, cardDraw: 5, deckSize: 10, gold: 100, luck: 5, armor: 5 },
  },
  {
    id: "guardian",
    name: "The Guardian",
    icon: "Shield",
    description: "A defensive specialist who outlasts opponents with shield bashes and heavy armor.",
    baseStats: { health: 90, energy: 3, offense: 6, defense: 12, cardDraw: 5, deckSize: 10, gold: 100, luck: 5, armor: 10 },
  },
  {
    id: "mystic",
    name: "The Mystic",
    icon: "Zap",
    description: "A wielder of frost and flame, chilling enemies while scorching them with cinders.",
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

export interface Debuff {
  id: string;
  name: string;
  description: string;
  effect: "chill" | "exhaust";
  turnsLeft: number;
  value: number; // percentage reduction
}

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  maxHealth: number;
  currentHealth: number;
  shield: number;
  shieldTurnsLeft: number;
  baseDamageMin: number;
  baseDamageMax: number;
  intent: "attack" | "shield";
  intentValue: number;
  debuffs: Debuff[];
}

export interface Card {
  id: string;
  name: string;
  type: "attack" | "skill" | "power";
  cost: number;
  value: number;
  description: string;
  effect?: "chill" | "exhaust" | "shieldbash";
  effectValue?: number;
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
  debuffs: Debuff[];
}

export interface StatUpgrades {
  health: number;
  offense: number;
  defense: number;
}

export interface SaveSlotData {
  id: number;
  dbId: string | null;
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
  treeNodes: TreeNode[] | null;
  statUpgrades: Record<string, StatUpgrades>;
  completedTreeNodes: number;
  completedTrees: number[];
}

export interface GameState {
  activeSlot: number | null;
  difficulty: Difficulty | null;
  currentTreeIndex: number | null;
  character: Character | null;
  treeNodes: TreeNode[];
  currentNodeId: string | null;
  completedNodes: string[];
  inEncounter: boolean;
  
  enemy: Enemy | null;
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  currentEnergy: number;
  
  saveSlots: SaveSlotData[];
  saveSlotsLoaded: boolean;
  
  // Encounter result state for popups
  encounterResult: { type: "victory" | "defeat" | "tree_complete"; credits: number; treeName: string; encountersCleared: number } | null;
  
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
  loadSaveSlotsFromDb: (userId: string) => Promise<void>;
  persistSlotToDb: (slotId: number) => Promise<void>;
  deleteSlotFromDb: (slotId: number) => Promise<void>;
  emergeFromForest: () => void;
  surrenderEncounter: () => void;
  clearEncounterResult: () => void;
}

const ENEMY_TEMPLATES = {
  basic: [
    { name: "Corrupted Sapling", baseHealth: 30, baseDamageMin: 5, baseDamageMax: 10 },
    { name: "Void Vine", baseHealth: 25, baseDamageMin: 6, baseDamageMax: 12 },
    { name: "Blighted Mushroom", baseHealth: 40, baseDamageMin: 4, baseDamageMax: 8 },
    { name: "Hollow Stump", baseHealth: 35, baseDamageMin: 5, baseDamageMax: 9 },
  ],
  elite: [
    { name: "Corrupted Treant", baseHealth: 60, baseDamageMin: 10, baseDamageMax: 18 },
    { name: "Void Blossom", baseHealth: 50, baseDamageMin: 15, baseDamageMax: 25 },
    { name: "Withered Ancient", baseHealth: 70, baseDamageMin: 12, baseDamageMax: 20 },
  ],
  boss: [
    { name: "The Hollow King", baseHealth: 120, baseDamageMin: 15, baseDamageMax: 30 },
    { name: "Abyssal Root Mother", baseHealth: 150, baseDamageMin: 20, baseDamageMax: 35 },
    { name: "Void Bloom Sovereign", baseHealth: 100, baseDamageMin: 25, baseDamageMax: 40 },
  ],
};

const buildCharacterDeck = (characterId: string, offense: number, defense: number): Card[] => {
  if (characterId === "mystic") {
    return [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `icicle${i + 1}`, name: "Icicle", type: "attack" as const, cost: 1,
        value: Math.ceil(offense * 0.8), description: "Icicle",
        effect: "chill" as const, effectValue: 20,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `cinder${i + 1}`, name: "Cinder", type: "attack" as const, cost: 1,
        value: Math.ceil(offense * 1.2), description: "Cinder",
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `defend${i + 1}`, name: "Defend", type: "skill" as const, cost: 1,
        value: defense, description: "Defend",
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `prep${i + 1}`, name: "Preparation", type: "power" as const, cost: 2,
        value: 50, description: "+50% attack for 2 turns",
      })),
    ];
  }
  if (characterId === "guardian") {
    return [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `shieldbash${i + 1}`, name: "Shield Bash", type: "attack" as const, cost: 1,
        value: offense, description: "Shield Bash",
        effect: "shieldbash" as const, effectValue: Math.ceil(defense * 0.5),
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `strike${i + 1}`, name: "Strike", type: "attack" as const, cost: 1,
        value: offense, description: "Strike",
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `defend${i + 1}`, name: "Defend", type: "skill" as const, cost: 1,
        value: defense, description: "Defend",
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `prep${i + 1}`, name: "Preparation", type: "power" as const, cost: 2,
        value: 50, description: "+50% attack for 2 turns",
      })),
    ];
  }
  // Warrior
  return [
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `slash${i + 1}`, name: "Slash", type: "attack" as const, cost: 1,
      value: Math.ceil(offense * 1.2), description: "Slash",
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `exhaust${i + 1}`, name: "Exhaust", type: "attack" as const, cost: 1,
      value: Math.ceil(offense * 0.5), description: "Exhaust",
      effect: "exhaust" as const, effectValue: 25,
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `strike${i + 1}`, name: "Strike", type: "attack" as const, cost: 1,
      value: offense, description: "Strike",
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `defend${i + 1}`, name: "Defend", type: "skill" as const, cost: 1,
      value: defense, description: "Defend",
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `prep${i + 1}`, name: "Preparation", type: "power" as const, cost: 2,
      value: 50, description: "+50% attack for 2 turns",
    })),
  ];
};

const generateTree = (): TreeNode[] => {
  const nodes: TreeNode[] = [];
  const totalRows = 10;
  const mainCols = [0, 2, 4, 6];

  // Row 0: 4 basic nodes at main columns
  for (const col of mainCols) {
    nodes.push({
      id: `node-0-${col}`, type: "basic", row: 0, col,
      connections: [], completed: false, available: true,
    });
  }

  // Rows 1-8
  for (let row = 1; row < totalRows - 1; row++) {
    const rowCols: number[] = [...mainCols];
    
    // For intersection columns (1,3,5): max 2 total, placed asymmetrically
    const intersectionCols = [1, 3, 5];
    const shuffled = intersectionCols.sort(() => Math.random() - 0.5);
    const numIntersection = Math.random() < 0.4 ? 2 : Math.random() < 0.6 ? 1 : 0;
    for (let i = 0; i < numIntersection; i++) {
      rowCols.push(shuffled[i]);
    }
    rowCols.sort((a, b) => a - b);

    // Randomly remove 1-2 main columns sometimes for asymmetry (except first 2 rows)
    if (row >= 2) {
      const removeCount = Math.random() < 0.2 ? 1 : 0;
      for (let r = 0; r < removeCount; r++) {
        const removable = rowCols.filter(c => mainCols.includes(c));
        if (removable.length > 2) {
          const toRemove = removable[Math.floor(Math.random() * removable.length)];
          const idx = rowCols.indexOf(toRemove);
          if (idx !== -1) rowCols.splice(idx, 1);
        }
      }
    }

    const prevRowNodes = nodes.filter(n => n.row === row - 1);

    for (const col of rowCols) {
      const isElite = row >= 4 && Math.random() < 0.15;
      
      const connections: string[] = [];
      for (const prev of prevRowNodes) {
        const dist = Math.abs(prev.col - col);
        if (dist <= 1) connections.push(prev.id);
        else if (dist === 2 && Math.random() < 0.3) connections.push(prev.id);
      }
      if (connections.length === 0 && prevRowNodes.length > 0) {
        const closest = prevRowNodes.reduce((a, b) =>
          Math.abs(a.col - col) < Math.abs(b.col - col) ? a : b
        );
        connections.push(closest.id);
      }

      nodes.push({
        id: `node-${row}-${col}`, type: isElite ? "elite" : "basic",
        row, col, connections: [...new Set(connections)],
        completed: false, available: false,
      });
    }
  }

  // Boss row
  const row8Nodes = nodes.filter(n => n.row === totalRows - 2);
  nodes.push({
    id: `node-${totalRows - 1}-3`, type: "boss",
    row: totalRows - 1, col: 3,
    connections: row8Nodes.map(n => n.id),
    completed: false, available: false,
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
  const intent: "attack" | "shield" = Math.random() < 0.7 ? "attack" : "shield";
  const intentValue = intent === "attack"
    ? Math.round((template.baseDamageMin + Math.random() * (template.baseDamageMax - template.baseDamageMin)) * totalMod)
    : Math.round(10 * totalMod);

  return {
    id: `enemy-${Date.now()}`, name: template.name, type, maxHealth, currentHealth: maxHealth,
    shield: 0, shieldTurnsLeft: 0,
    baseDamageMin: Math.round(template.baseDamageMin * totalMod),
    baseDamageMax: Math.round(template.baseDamageMax * totalMod),
    intent, intentValue, debuffs: [],
  };
};

const emptyUpgrades = (): StatUpgrades => ({ health: 0, offense: 0, defense: 0 });

const initialSaveSlots: SaveSlotData[] = [
  { id: 1, dbId: null, isEmpty: true, username: null, difficulty: null, credits: 0, characterId: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false, treeNodes: null, statUpgrades: {}, completedTreeNodes: 0, completedTrees: [] },
  { id: 2, dbId: null, isEmpty: true, username: null, difficulty: null, credits: 0, characterId: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false, treeNodes: null, statUpgrades: {}, completedTreeNodes: 0, completedTrees: [] },
  { id: 3, dbId: null, isEmpty: true, username: null, difficulty: null, credits: 0, characterId: null, currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null, completedNodes: [], inTreeInstance: false, treeNodes: null, statUpgrades: {}, completedTreeNodes: 0, completedTrees: [] },
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
  saveSlotsLoaded: false,
  encounterResult: null,

  clearEncounterResult: () => set({ encounterResult: null }),

  loadSaveSlotsFromDb: async (userId: string) => {
    const { data, error } = await supabase
      .from("summoner_saves").select("*").eq("user_id", userId);
    if (error) { console.error("Failed to load saves:", error); set({ saveSlotsLoaded: true }); return; }
    const slots = [...initialSaveSlots];
    if (data) {
      for (const row of data) {
        const slotIdx = slots.findIndex(s => s.id === row.slot_number);
        if (slotIdx !== -1) {
          slots[slotIdx] = {
            id: row.slot_number, dbId: row.id, isEmpty: false,
            username: row.username, difficulty: row.difficulty as Difficulty,
            credits: row.credits, characterId: row.character_id,
            currentTreeIndex: row.current_tree_index, currentNodeId: row.current_node_id,
            currentHealth: row.current_health, maxHealth: row.max_health,
            completedNodes: (row.completed_nodes as string[]) ?? [],
            inTreeInstance: row.in_tree_instance,
            treeNodes: row.tree_nodes as unknown as TreeNode[] | null,
            statUpgrades: (row.stat_upgrades as unknown as Record<string, StatUpgrades>) ?? {},
            completedTreeNodes: row.completed_tree_nodes,
            completedTrees: (row.completed_trees as number[]) ?? [],
          };
        }
      }
    }
    set({ saveSlots: slots, saveSlotsLoaded: true });
  },

  persistSlotToDb: async (slotId: number) => {
    const { saveSlots } = get();
    const slot = saveSlots.find(s => s.id === slotId);
    if (!slot || slot.isEmpty) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      user_id: user.id, slot_number: slot.id, username: slot.username!,
      difficulty: slot.difficulty!, credits: slot.credits,
      completed_trees: slot.completedTrees, current_tree_index: slot.currentTreeIndex,
      current_node_id: slot.currentNodeId, current_health: slot.currentHealth,
      max_health: slot.maxHealth, character_id: slot.characterId,
      completed_nodes: slot.completedNodes, in_tree_instance: slot.inTreeInstance,
      tree_nodes: slot.treeNodes as any, stat_upgrades: slot.statUpgrades as any,
      completed_tree_nodes: slot.completedTreeNodes,
    };
    if (slot.dbId) {
      await supabase.from("summoner_saves").update(payload).eq("id", slot.dbId);
    } else {
      const { data } = await supabase.from("summoner_saves").insert(payload).select("id").maybeSingle();
      if (data) {
        const updatedSlots = saveSlots.map(s => s.id === slotId ? { ...s, dbId: data.id } : s);
        set({ saveSlots: updatedSlots });
      }
    }
  },

  deleteSlotFromDb: async (slotId: number) => {
    const { saveSlots } = get();
    const slot = saveSlots.find(s => s.id === slotId);
    if (!slot || !slot.dbId) return;
    await supabase.from("summoner_saves").delete().eq("id", slot.dbId);
  },

  setActiveSlot: (slot) => set({ activeSlot: slot }),

  setDifficulty: (difficulty) => {
    const { activeSlot, saveSlots } = get();
    const updatedSlots = saveSlots.map(s => s.id === activeSlot ? { ...s, difficulty } : s);
    set({ difficulty, saveSlots: updatedSlots });
    get().persistSlotToDb(activeSlot!);
  },

  setCurrentTree: (treeIndex) => set({ currentTreeIndex: treeIndex }),

  createSaveSlot: (slotId, username) => {
    const { saveSlots } = get();
    const updatedSlots = saveSlots.map(s =>
      s.id === slotId ? { ...s, isEmpty: false, username, credits: 0, statUpgrades: {}, completedTrees: [] } : s
    );
    set({ saveSlots: updatedSlots, activeSlot: slotId });
  },

  deleteSaveSlot: (slotId) => {
    get().deleteSlotFromDb(slotId);
    const updatedSlots = get().saveSlots.map(s =>
      s.id === slotId ? { ...initialSaveSlots.find(is => is.id === slotId)! } : s
    );
    set({ saveSlots: updatedSlots });
  },

  initializeCharacter: (characterId) => {
    const charDef = CHARACTERS.find(c => c.id === characterId);
    if (!charDef) return;
    const stats = get().getEffectiveStats(characterId);
    const { activeSlot, saveSlots } = get();
    set({
      character: {
        id: characterId, name: charDef.name,
        maxHealth: stats.health, currentHealth: stats.health,
        energy: stats.energy, maxEnergy: stats.energy,
        shield: 0, offense: stats.offense, defense: stats.defense,
        attackBuff: 0, attackBuffTurns: 0, debuffs: [],
      },
    });
    const updatedSlots = saveSlots.map(s => s.id === activeSlot ? { ...s, characterId } : s);
    set({ saveSlots: updatedSlots });
  },

  getEffectiveStats: (characterId) => {
    const { activeSlot, saveSlots } = get();
    const charDef = CHARACTERS.find(c => c.id === characterId);
    if (!charDef) return { health: 0, energy: 0, offense: 0, defense: 0, cardDraw: 0, deckSize: 0, gold: 0, luck: 0, armor: 0 };
    const slot = saveSlots.find(s => s.id === activeSlot);
    const upgrades = slot?.statUpgrades?.[characterId] ?? emptyUpgrades();
    const healthBonus = upgrades.health > 0 ? Math.ceil(charDef.baseStats.health * 0.05 * upgrades.health) : 0;
    const offenseBonus = upgrades.offense > 0 ? Math.ceil(charDef.baseStats.offense * 0.10 * upgrades.offense) : 0;
    const defenseBonus = upgrades.defense > 0 ? Math.ceil(charDef.baseStats.defense * 0.10 * upgrades.defense) : 0;
    return {
      health: charDef.baseStats.health + healthBonus,
      energy: charDef.baseStats.energy,
      offense: charDef.baseStats.offense + offenseBonus,
      defense: charDef.baseStats.defense + defenseBonus,
      cardDraw: charDef.baseStats.cardDraw,
      deckSize: charDef.baseStats.deckSize,
      gold: charDef.baseStats.gold,
      luck: charDef.baseStats.luck,
      armor: charDef.baseStats.armor,
    };
  },

  getCharacterDeck: (characterId) => {
    const stats = get().getEffectiveStats(characterId);
    return buildCharacterDeck(characterId, stats.offense, stats.defense);
  },

  getUpgradeCost: (characterId, stat) => {
    const { activeSlot, saveSlots } = get();
    const slot = saveSlots.find(s => s.id === activeSlot);
    const upgrades = slot?.statUpgrades?.[characterId] ?? emptyUpgrades();
    const level = upgrades[stat];
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
        ...s, credits: s.credits - cost,
        statUpgrades: { ...s.statUpgrades, [characterId]: newUpgrades },
      } : s
    );
    set({ saveSlots: updatedSlots });
    get().persistSlotToDb(activeSlot!);
    return true;
  },

  awardCredits: (bossDefeated, nodesCompleted) => {
    const { activeSlot, saveSlots, currentTreeIndex } = get();
    const credits = bossDefeated ? 100 : Math.min(40, nodesCompleted * 4);
    const updatedSlots = saveSlots.map(s => {
      if (s.id !== activeSlot) return s;
      const newSlot = { ...s, credits: s.credits + credits };
      if (bossDefeated && currentTreeIndex !== null) {
        const newCompleted = s.completedTrees.includes(currentTreeIndex) ? s.completedTrees : [...s.completedTrees, currentTreeIndex];
        newSlot.completedTrees = newCompleted;
      }
      return newSlot;
    });
    set({ saveSlots: updatedSlots });
    get().persistSlotToDb(activeSlot!);
    return credits;
  },

  initializeTree: () => {
    const nodes = generateTree();
    set({ treeNodes: nodes, completedNodes: [], currentNodeId: null });
  },

  selectNode: (nodeId) => {
    const { treeNodes } = get();
    const node = treeNodes.find(n => n.id === nodeId);
    if (node && node.available) set({ currentNodeId: nodeId });
  },

  startEncounter: (nodeType) => {
    const { difficulty, currentTreeIndex, character } = get();
    if (!difficulty || currentTreeIndex === null || !character) return;
    const enemy = spawnEnemy(nodeType, difficulty, currentTreeIndex);
    const fullDeck = buildCharacterDeck(character.id, character.offense, character.defense);
    const deck = shuffleArray([...fullDeck]);
    const cardDraw = character.maxEnergy >= 4 ? 6 : 5;
    const hand = deck.splice(0, cardDraw);
    set({
      inEncounter: true, enemy, deck, hand, discardPile: [],
      currentEnergy: character.maxEnergy,
      character: { ...character, attackBuff: 0, attackBuffTurns: 0, shield: 0, debuffs: [] },
      encounterResult: null,
    });
  },

  completeEncounter: (victory) => {
    const { currentNodeId, treeNodes, completedNodes, currentTreeIndex } = get();
    const treeName = TREES[currentTreeIndex ?? 0]?.name ?? "Unknown";

    if (victory && currentNodeId) {
      const currentNode = treeNodes.find(n => n.id === currentNodeId);
      const currentRow = currentNode?.row ?? 0;
      const isBossDefeated = currentNode?.type === "boss";

      const updatedNodes = treeNodes.map(node => {
        if (node.id === currentNodeId) return { ...node, completed: true, available: false };
        if (node.row === currentRow && node.id !== currentNodeId) return { ...node, available: false };
        if (node.row === currentRow + 1 && node.connections.includes(currentNodeId)) return { ...node, available: true };
        return node;
      });
      const newCompletedNodes = [...completedNodes, currentNodeId];
      const { character } = get();
      const cleanChar = character ? { ...character, attackBuff: 0, attackBuffTurns: 0, shield: 0, debuffs: [] } : null;

      if (isBossDefeated) {
        const credits = 100;
        get().awardCredits(true, newCompletedNodes.length);
        const { activeSlot, saveSlots } = get();
        const updatedSlots = saveSlots.map(s => s.id === activeSlot ? {
          ...s, inTreeInstance: false, treeNodes: null, characterId: null,
          currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null,
          completedNodes: [], completedTreeNodes: 0,
        } : s);
        set({
          inEncounter: false, enemy: null, hand: [], deck: [], discardPile: [],
          treeNodes: [], completedNodes: [], character: null, currentTreeIndex: null,
          currentNodeId: null, saveSlots: updatedSlots,
          encounterResult: { type: "tree_complete", credits, treeName, encountersCleared: newCompletedNodes.length },
        });
        get().persistSlotToDb(activeSlot!);
      } else {
        set({
          inEncounter: false, enemy: null, hand: [], deck: [], discardPile: [],
          treeNodes: updatedNodes, completedNodes: newCompletedNodes,
          currentNodeId: null, character: cleanChar,
        });
        get().saveProgress();
      }
    } else {
      // Defeat
      const { completedNodes: cn } = get();
      const credits = Math.min(40, cn.length * 4);
      get().awardCredits(false, cn.length);
      const { activeSlot, saveSlots } = get();
      const updatedSlots = saveSlots.map(s => s.id === activeSlot ? {
        ...s, inTreeInstance: false, treeNodes: null, characterId: null,
        currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null,
        completedNodes: [], completedTreeNodes: 0,
      } : s);
      set({
        inEncounter: false, enemy: null, hand: [], deck: [], discardPile: [],
        currentNodeId: null, treeNodes: [], completedNodes: [], character: null,
        currentTreeIndex: null, saveSlots: updatedSlots,
        encounterResult: { type: "defeat", credits, treeName, encountersCleared: cn.length },
      });
      get().persistSlotToDb(activeSlot!);
    }
  },

  emergeFromForest: () => {
    const { completedNodes, activeSlot, currentTreeIndex } = get();
    const credits = Math.min(40, completedNodes.length * 4);
    get().awardCredits(false, completedNodes.length);
    const treeName = TREES[currentTreeIndex ?? 0]?.name ?? "Unknown";
    const updatedSlots = get().saveSlots.map(s => s.id === activeSlot ? {
      ...s, inTreeInstance: false, treeNodes: null, characterId: null,
      currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null,
      completedNodes: [], completedTreeNodes: 0,
    } : s);
    set({
      inEncounter: false, enemy: null, hand: [], deck: [], discardPile: [],
      currentNodeId: null, treeNodes: [], completedNodes: [], character: null,
      currentTreeIndex: null, saveSlots: updatedSlots,
    });
    get().persistSlotToDb(activeSlot!);
  },

  surrenderEncounter: () => {
    const { completedNodes, currentTreeIndex } = get();
    const credits = Math.min(40, completedNodes.length * 4);
    const treeName = TREES[currentTreeIndex ?? 0]?.name ?? "Unknown";
    get().emergeFromForest();
    set({
      encounterResult: { type: "defeat", credits, treeName, encountersCleared: completedNodes.length },
    });
  },

  takeDamage: (damage) => {
    const { character } = get();
    if (!character) return;
    let remainingDamage = damage;
    let newShield = character.shield;
    if (newShield > 0) {
      if (newShield >= remainingDamage) { newShield -= remainingDamage; remainingDamage = 0; }
      else { remainingDamage -= newShield; newShield = 0; }
    }
    const newHealth = Math.max(0, character.currentHealth - remainingDamage);
    set({ character: { ...character, currentHealth: newHealth, shield: newShield } });
  },

  addShield: (amount) => {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, shield: character.shield + amount } });
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
    let newEnemy = { ...enemy, debuffs: [...enemy.debuffs] };
    let newCharacter = { ...character, debuffs: [...character.debuffs] };

    if (card.type === "attack" && targetEnemy) {
      let damage = card.value;
      if (character.attackBuffTurns > 0) {
        damage = Math.ceil(damage * (1 + character.attackBuff / 100));
      }
      // Apply chill debuff on enemy (reduces their damage)
      if (card.effect === "chill") {
        const existing = newEnemy.debuffs.find(d => d.effect === "chill");
        if (existing) {
          existing.turnsLeft = 2;
        } else {
          newEnemy.debuffs.push({
            id: `chill-${Date.now()}`, name: "Chill", description: "Damage dealt reduced by 20%",
            effect: "chill", turnsLeft: 2, value: card.effectValue ?? 20,
          });
        }
      }
      if (card.effect === "exhaust") {
        const existing = newEnemy.debuffs.find(d => d.effect === "exhaust");
        if (existing) {
          existing.turnsLeft = 2;
        } else {
          newEnemy.debuffs.push({
            id: `exhaust-${Date.now()}`, name: "Exhaust", description: "Damage dealt reduced by 25%",
            effect: "exhaust", turnsLeft: 2, value: card.effectValue ?? 25,
          });
        }
      }
      if (card.effect === "shieldbash") {
        newCharacter.shield += (card.effectValue ?? 0);
      }
      // Apply damage
      if (newEnemy.shield > 0) {
        if (newEnemy.shield >= damage) { newEnemy.shield -= damage; damage = 0; }
        else { damage -= newEnemy.shield; newEnemy.shield = 0; }
      }
      newEnemy.currentHealth = Math.max(0, newEnemy.currentHealth - damage);
    } else if (card.type === "skill") {
      newCharacter.shield += card.value;
    } else if (card.type === "power") {
      newCharacter.attackBuff = card.value;
      newCharacter.attackBuffTurns = 2;
    }

    set({
      hand: newHand, discardPile: [...discardPile, card],
      currentEnergy: currentEnergy - card.cost,
      enemy: newEnemy, character: newCharacter,
    });
  },

  endTurn: () => {
    const { enemy, character, hand, discardPile, deck } = get();
    if (!enemy || !character) return;
    let newCharacter = { ...character, debuffs: [...character.debuffs] };
    let newEnemy = { ...enemy, debuffs: [...enemy.debuffs] };

    // Enemy shield expires after 1 round
    if (newEnemy.shieldTurnsLeft > 0) {
      newEnemy.shieldTurnsLeft -= 1;
      if (newEnemy.shieldTurnsLeft === 0) newEnemy.shield = 0;
    }

    // Calculate enemy damage reduction from debuffs
    let enemyDamageReduction = 0;
    for (const d of newEnemy.debuffs) {
      if (d.effect === "chill" || d.effect === "exhaust") {
        enemyDamageReduction += d.value;
      }
    }
    enemyDamageReduction = Math.min(enemyDamageReduction, 80); // cap

    // Execute enemy action
    if (enemy.intent === "attack") {
      let damage = enemy.intentValue;
      // Apply debuff reduction
      if (enemyDamageReduction > 0) {
        damage = Math.ceil(damage * (1 - enemyDamageReduction / 100));
      }
      if (newCharacter.shield > 0) {
        if (newCharacter.shield >= damage) { newCharacter.shield -= damage; damage = 0; }
        else { damage -= newCharacter.shield; newCharacter.shield = 0; }
      }
      newCharacter.currentHealth = Math.max(0, newCharacter.currentHealth - damage);
    } else {
      newEnemy.shield = enemy.intentValue;
      newEnemy.shieldTurnsLeft = 1;
    }

    // New enemy intent
    const newIntent: "attack" | "shield" = Math.random() < 0.7 ? "attack" : "shield";
    const newIntentValue = newIntent === "attack"
      ? Math.round(enemy.baseDamageMin + Math.random() * (enemy.baseDamageMax - enemy.baseDamageMin))
      : Math.round(10 + Math.random() * 10);
    newEnemy.intent = newIntent;
    newEnemy.intentValue = newIntentValue;

    // Tick debuffs
    newEnemy.debuffs = newEnemy.debuffs
      .map(d => ({ ...d, turnsLeft: d.turnsLeft - 1 }))
      .filter(d => d.turnsLeft > 0);
    newCharacter.debuffs = newCharacter.debuffs
      .map(d => ({ ...d, turnsLeft: d.turnsLeft - 1 }))
      .filter(d => d.turnsLeft > 0);

    // Decrease attack buff turns
    if (newCharacter.attackBuffTurns > 0) {
      newCharacter.attackBuffTurns -= 1;
      if (newCharacter.attackBuffTurns === 0) newCharacter.attackBuff = 0;
    }

    // Reset player shield
    newCharacter.shield = 0;

    // Discard hand and draw
    let newDiscard = [...discardPile, ...hand];
    let newDeck = [...deck];
    const drawCount = newCharacter.maxEnergy >= 4 ? 6 : 5;
    if (newDeck.length < drawCount) {
      newDeck = shuffleArray([...newDeck, ...newDiscard]);
      newDiscard = [];
    }
    const newHand = newDeck.splice(0, drawCount);

    set({
      enemy: newEnemy, character: newCharacter,
      currentEnergy: newCharacter.maxEnergy,
      hand: newHand, deck: newDeck, discardPile: newDiscard,
    });
  },

  drawCards: (count) => {
    const { deck, hand, discardPile } = get();
    let newDeck = [...deck];
    let newHand = [...hand];
    let newDiscard = [...discardPile];
    for (let i = 0; i < count; i++) {
      if (newDeck.length === 0) { newDeck = shuffleArray([...newDiscard]); newDiscard = []; }
      if (newDeck.length > 0) newHand.push(newDeck.shift()!);
    }
    set({ deck: newDeck, hand: newHand, discardPile: newDiscard });
  },

  saveProgress: () => {
    const { activeSlot, character, difficulty, currentTreeIndex, currentNodeId, completedNodes, saveSlots, treeNodes } = get();
    if (activeSlot === null) return;
    const updatedSlots = saveSlots.map(slot => {
      if (slot.id === activeSlot) {
        return {
          ...slot, isEmpty: false,
          characterId: character?.id ?? slot.characterId, difficulty,
          currentTreeIndex, currentNodeId,
          currentHealth: character?.currentHealth ?? slot.currentHealth,
          maxHealth: character?.maxHealth ?? slot.maxHealth,
          completedNodes, inTreeInstance: treeNodes.length > 0,
          treeNodes: treeNodes.length > 0 ? treeNodes : null,
          completedTreeNodes: completedNodes.length,
        };
      }
      return slot;
    });
    set({ saveSlots: updatedSlots });
    get().persistSlotToDb(activeSlot);
  },

  loadSlot: (slotId) => {
    const { saveSlots } = get();
    const slot = saveSlots.find(s => s.id === slotId);
    if (!slot || slot.isEmpty) return;
    set({
      activeSlot: slotId, difficulty: slot.difficulty,
      currentTreeIndex: slot.currentTreeIndex,
      completedNodes: slot.completedNodes,
      treeNodes: slot.treeNodes ?? [],
    });
    if (slot.inTreeInstance && slot.characterId) {
      const charDef = CHARACTERS.find(c => c.id === slot.characterId);
      if (charDef) {
        const stats = get().getEffectiveStats(slot.characterId);
        set({
          character: {
            id: slot.characterId, name: charDef.name,
            maxHealth: slot.maxHealth ?? stats.health,
            currentHealth: slot.currentHealth ?? stats.health,
            energy: stats.energy, maxEnergy: stats.energy,
            shield: 0, offense: stats.offense, defense: stats.defense,
            attackBuff: 0, attackBuffTurns: 0, debuffs: [],
          },
        });
      }
    }
  },

  resetRun: () => {
    set({
      character: null, treeNodes: [], currentNodeId: null,
      completedNodes: [], inEncounter: false, enemy: null,
      hand: [], deck: [], discardPile: [], currentEnergy: 0,
    });
  },
}));
