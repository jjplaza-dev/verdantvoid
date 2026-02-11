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
  connections: string[]; // IDs of nodes in the PREVIOUS row that lead to this node
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
  shieldTurnsLeft: number;
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
  offense: number;
  defense: number;
}

export interface SaveSlotData {
  id: number;
  dbId: string | null; // database row id
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

const buildStarterDeck = (offense: number, defense: number): Card[] => [
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `strike${i + 1}`, name: "Strike", type: "attack" as const, cost: 1, value: offense, description: "Strike",
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `defend${i + 1}`, name: "Defend", type: "skill" as const, cost: 1, value: defense, description: "Defend",
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `prep${i + 1}`, name: "Preparation", type: "power" as const, cost: 2, value: 50, description: "+50% attack for 2 turns",
  })),
];

const generateTree = (): TreeNode[] => {
  const nodes: TreeNode[] = [];
  const totalRows = 10;
  const totalCols = 7; // 4 main + 3 intersection

  // Row 0 (bottom) = 4 basic nodes at main columns (0, 2, 4, 6)
  const mainCols = [0, 2, 4, 6];
  for (const col of mainCols) {
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

  // Rows 1-8: generate nodes with connections
  for (let row = 1; row < totalRows - 1; row++) {
    // Decide which columns have nodes this row
    // Always use main columns, randomly add intersection columns
    const rowCols: number[] = [...mainCols];
    // Randomly add intersection columns (1, 3, 5) with 40% chance each
    for (const ic of [1, 3, 5]) {
      if (Math.random() < 0.4) rowCols.push(ic);
    }
    rowCols.sort((a, b) => a - b);

    const prevRowNodes = nodes.filter(n => n.row === row - 1);

    for (const col of rowCols) {
      const isElite = row >= 4 && Math.random() < 0.15;
      
      // Connect to previous row nodes that are nearby (within 1 col distance)
      const connections: string[] = [];
      for (const prev of prevRowNodes) {
        const dist = Math.abs(prev.col - col);
        if (dist <= 1) {
          connections.push(prev.id);
        } else if (dist === 2 && Math.random() < 0.3) {
          connections.push(prev.id);
        }
      }
      // Ensure at least one connection
      if (connections.length === 0 && prevRowNodes.length > 0) {
        const closest = prevRowNodes.reduce((a, b) => 
          Math.abs(a.col - col) < Math.abs(b.col - col) ? a : b
        );
        connections.push(closest.id);
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

  // Boss row (row 9) = 1 boss node at center
  const row8Nodes = nodes.filter(n => n.row === totalRows - 2);
  nodes.push({
    id: `node-${totalRows - 1}-3`,
    type: "boss",
    row: totalRows - 1,
    col: 3,
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
  // 70% attack, 30% shield
  const intent: "attack" | "shield" = Math.random() < 0.7 ? "attack" : "shield";
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
    shieldTurnsLeft: 0,
    baseDamageMin: Math.round(template.baseDamageMin * totalMod),
    baseDamageMax: Math.round(template.baseDamageMax * totalMod),
    intent,
    intentValue,
  };
};

const emptyUpgrades = (): StatUpgrades => ({
  health: 0, offense: 0, defense: 0,
});

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

  loadSaveSlotsFromDb: async (userId: string) => {
    const { data, error } = await supabase
      .from("summoner_saves")
      .select("*")
      .eq("user_id", userId);
    
    if (error) { console.error("Failed to load saves:", error); return; }
    
    const slots = [...initialSaveSlots];
    if (data) {
      for (const row of data) {
        const slotIdx = slots.findIndex(s => s.id === row.slot_number);
        if (slotIdx !== -1) {
          slots[slotIdx] = {
            id: row.slot_number,
            dbId: row.id,
            isEmpty: false,
            username: row.username,
            difficulty: row.difficulty as Difficulty,
            credits: row.credits,
            characterId: row.character_id,
            currentTreeIndex: row.current_tree_index,
            currentNodeId: row.current_node_id,
            currentHealth: row.current_health,
            maxHealth: row.max_health,
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
      user_id: user.id,
      slot_number: slot.id,
      username: slot.username!,
      difficulty: slot.difficulty!,
      credits: slot.credits,
      completed_trees: slot.completedTrees,
      current_tree_index: slot.currentTreeIndex,
      current_node_id: slot.currentNodeId,
      current_health: slot.currentHealth,
      max_health: slot.maxHealth,
      character_id: slot.characterId,
      completed_nodes: slot.completedNodes,
      in_tree_instance: slot.inTreeInstance,
      tree_nodes: slot.treeNodes as any,
      stat_upgrades: slot.statUpgrades as any,
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
    const updatedSlots = saveSlots.map(s =>
      s.id === activeSlot ? { ...s, difficulty } : s
    );
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
    // Store characterId on slot
    const updatedSlots = saveSlots.map(s => s.id === activeSlot ? { ...s, characterId } : s);
    set({ saveSlots: updatedSlots });
  },
  
  getEffectiveStats: (characterId) => {
    const { activeSlot, saveSlots } = get();
    const charDef = CHARACTERS.find(c => c.id === characterId);
    if (!charDef) return { health: 0, energy: 0, offense: 0, defense: 0, cardDraw: 0, deckSize: 0, gold: 0, luck: 0, armor: 0 };
    
    const slot = saveSlots.find(s => s.id === activeSlot);
    const upgrades = slot?.statUpgrades?.[characterId] ?? emptyUpgrades();
    
    // Health: +5% per upgrade (round up), Offense: +10% per upgrade (round up), Defense: +10% per upgrade (round up)
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
    return buildStarterDeck(stats.offense, stats.defense);
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
        ...s,
        credits: s.credits - cost,
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
    const fullDeck = buildStarterDeck(character.offense, character.defense);
    const deck = shuffleArray([...fullDeck]);
    const cardDraw = character.maxEnergy >= 4 ? 6 : 5;
    const hand = deck.splice(0, cardDraw);
    
    // Clear buffs at encounter start
    set({
      inEncounter: true,
      enemy,
      deck,
      hand,
      discardPile: [],
      currentEnergy: character.maxEnergy,
      character: { ...character, attackBuff: 0, attackBuffTurns: 0, shield: 0 },
    });
  },
  
  completeEncounter: (victory) => {
    const { currentNodeId, treeNodes, completedNodes, currentTreeIndex } = get();
    
    if (victory && currentNodeId) {
      const currentNode = treeNodes.find(n => n.id === currentNodeId);
      const currentRow = currentNode?.row ?? 0;
      const isBossDefeated = currentNode?.type === "boss";
      
      const updatedNodes = treeNodes.map(node => {
        if (node.id === currentNodeId) {
          return { ...node, completed: true, available: false };
        }
        if (node.row === currentRow && node.id !== currentNodeId) {
          return { ...node, available: false };
        }
        if (node.row === currentRow + 1 && node.connections.includes(currentNodeId)) {
          return { ...node, available: true };
        }
        return node;
      });
      
      const newCompletedNodes = [...completedNodes, currentNodeId];
      
      // Clear buffs after encounter
      const { character } = get();
      const cleanChar = character ? { ...character, attackBuff: 0, attackBuffTurns: 0, shield: 0 } : null;
      
      set({
        inEncounter: false,
        enemy: null,
        hand: [],
        deck: [],
        discardPile: [],
        treeNodes: updatedNodes,
        completedNodes: newCompletedNodes,
        currentNodeId: null,
        character: cleanChar,
      });
      
      if (isBossDefeated) {
        get().awardCredits(true, newCompletedNodes.length);
        // Save completed tree and reset tree state
        const { activeSlot, saveSlots } = get();
        const updatedSlots = saveSlots.map(s => s.id === activeSlot ? {
          ...s, inTreeInstance: false, treeNodes: null, characterId: null,
          currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null,
          completedNodes: [], completedTreeNodes: 0,
        } : s);
        set({
          treeNodes: [],
          completedNodes: [],
          character: null,
          currentTreeIndex: null,
          saveSlots: updatedSlots,
        });
        get().persistSlotToDb(activeSlot!);
      } else {
        get().saveProgress();
      }
    } else {
      const { completedNodes: cn } = get();
      get().awardCredits(false, cn.length);
      const { activeSlot, saveSlots } = get();
      const updatedSlots = saveSlots.map(s => s.id === activeSlot ? {
        ...s, inTreeInstance: false, treeNodes: null, characterId: null,
        currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null,
        completedNodes: [], completedTreeNodes: 0,
      } : s);
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
        saveSlots: updatedSlots,
      });
      get().persistSlotToDb(activeSlot!);
    }
  },

  emergeFromForest: () => {
    const { completedNodes, activeSlot, saveSlots } = get();
    get().awardCredits(false, completedNodes.length);
    const updatedSlots = get().saveSlots.map(s => s.id === activeSlot ? {
      ...s, inTreeInstance: false, treeNodes: null, characterId: null,
      currentTreeIndex: null, currentNodeId: null, currentHealth: null, maxHealth: null,
      completedNodes: [], completedTreeNodes: 0,
    } : s);
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
      saveSlots: updatedSlots,
    });
    get().persistSlotToDb(activeSlot!);
  },

  surrenderEncounter: () => {
    get().emergeFromForest();
  },
  
  takeDamage: (damage) => {
    const { character } = get();
    if (!character) return;
    
    let remainingDamage = damage;
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
    
    let newEnemy = { ...enemy };
    let newCharacter = { ...character };
    
    if (card.type === "attack" && targetEnemy) {
      let damage = card.value;
      if (character.attackBuffTurns > 0) {
        damage = Math.ceil(damage * (1 + character.attackBuff / 100));
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
      newCharacter.shield += card.value;
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
    
    // Enemy shield expires after 1 round
    if (newEnemy.shieldTurnsLeft > 0) {
      newEnemy.shieldTurnsLeft -= 1;
      if (newEnemy.shieldTurnsLeft === 0) {
        newEnemy.shield = 0;
      }
    }
    
    // Execute enemy action
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
      // Shield does not stack - replace
      newEnemy.shield = enemy.intentValue;
      newEnemy.shieldTurnsLeft = 1;
    }
    
    // New enemy intent: 70% attack, 30% shield
    const newIntent: "attack" | "shield" = Math.random() < 0.7 ? "attack" : "shield";
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
    
    // Reset player shield at start of turn
    newCharacter.shield = 0;
    
    // Discard remaining hand, then draw new cards
    let newDiscard = [...discardPile, ...hand];
    let newDeck = [...deck];
    
    const drawCount = newCharacter.maxEnergy >= 4 ? 6 : 5;
    
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
      activeSlot: slotId,
      difficulty: slot.difficulty,
      currentTreeIndex: slot.currentTreeIndex,
      completedNodes: slot.completedNodes,
      treeNodes: slot.treeNodes ?? [],
    });

    // Restore character if in tree
    if (slot.inTreeInstance && slot.characterId) {
      const charDef = CHARACTERS.find(c => c.id === slot.characterId);
      if (charDef) {
        const stats = get().getEffectiveStats(slot.characterId);
        set({
          character: {
            id: slot.characterId,
            name: charDef.name,
            maxHealth: slot.maxHealth ?? stats.health,
            currentHealth: slot.currentHealth ?? stats.health,
            energy: stats.energy,
            maxEnergy: stats.energy,
            shield: 0,
            offense: stats.offense,
            defense: stats.defense,
            attackBuff: 0,
            attackBuffTurns: 0,
          },
        });
      }
    }
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
