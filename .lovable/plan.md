

## 🎮 STS-Like Card Battler - MVP Plan

### Overview
A roguelike deck-building card game inspired by Slay the Spire, featuring a tree-based map progression, drag-and-drop card combat, and persistent account progression with multiple save slots.

---

### 🔐 Phase 1: Foundation & Authentication

**Main Menu**
- Title screen with fantasy-styled typography
- New Game, Load Game, and Settings buttons
- Account login/signup flow (email-based)

**Account System (Supabase)**
- User authentication with email/password
- Profile storage for account-level data
- 3 save slots per account with save/load functionality

---

### 👤 Phase 2: Character & Stats System

**Character Selection**
- 2-3 distinct character classes to choose from
- Each class has unique starting deck and base stat variations
- Visual preview and class description

**Base Stats (Account Level)**
- Health & Energy pools
- Offense (damage modifier) & Defense (block modifier)
- Card Draw per turn & Starting Deck Size
- Gold & Luck modifiers
- Armor (% damage reduction)

**Game Stats (Per Run)**
- Derived from Base Stats + run modifiers
- Tracks current HP, gold, deck composition
- Resets on new run, persists during run

---

### 🗺️ Phase 3: Map & Progression

**Tree Map Structure**
- Vertical tree visualization (roots at bottom → boss at top)
- Multiple branching paths between nodes
- Node types: Combat, Elite, Rest, Event, Shop, Boss

**Node Interactions**
- Click to select next destination
- Only connected forward paths available
- Visual indicators for completed vs available nodes

**Save System**
- Auto-save after completing each node
- Save stores: current position, deck, stats, gold, relics
- Cannot save mid-combat

---

### ⚔️ Phase 4: Combat System

**Turn-Based Combat**
- Energy system (spend to play cards)
- Enemy intent display (shows next action)
- Health bars for player and enemies

**Card Mechanics**
- Drag-and-drop cards to targets
- Card types: Attack (target enemy), Skill (target self/all), Power (persistent effects)
- Discard pile and draw pile management
- Hand limit and card draw per turn

**Battle Flow**
1. Draw starting hand
2. Player turn: play cards using energy
3. End turn: enemy actions execute
4. Repeat until victory or defeat

---

### 🎁 Phase 5: Rewards & Progression

**Post-Battle Rewards**
- Choose 1 of 3 card rewards to add to deck
- Gold rewards based on enemy type
- Potential relic drops from elites

**Run Progression**
- Difficulty scaling through the tree
- Boss encounter at tree top
- Run end: victory or death

---

### 🎨 Phase 6: UI & Polish

**Visual Style**
- Clean, minimal interface
- Fantasy-themed custom fonts
- Subtle card hover/tilt effects (CSS-based, no ThreeJS needed for MVP)
- GSAP transitions for smooth card animations

**Key Screens**
- Main Menu
- Character Select
- Save Slot Management
- Map View
- Combat Arena
- Reward Selection
- Game Over / Victory

---

### 📊 Database Structure (Supabase)

**Tables Overview**
- `profiles` - User account data & base stats
- `characters` - Playable character class definitions
- `cards` - Card definitions (name, type, cost, effects)
- `save_slots` - Run save data (3 per user)
- `runs` - Active run state (current node, deck, HP, gold)

---

### 🚀 MVP Deliverables

1. ✅ Working authentication & account system
2. ✅ Character selection with 2-3 classes
3. ✅ Functional tree map with branching paths
4. ✅ Complete drag-and-drop card combat
5. ✅ Save/Load system with 3 slots
6. ✅ Card reward selection after battles
7. ✅ Full run loop (start → battles → boss → end)

### 🔮 Post-MVP (Future)
- Sound effects & music
- Card animations & visual effects
- Additional character classes
- Meta-progression (unlockables)
- Leaderboards

