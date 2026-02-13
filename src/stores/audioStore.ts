import { create } from "zustand";

interface AudioState {
  musicVolume: number;
  sfxVolume: number;
  menuMusic: HTMLAudioElement | null;
  battleMusic: HTMLAudioElement | null;
  currentTrack: "menu" | "battle" | null;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  playMenuMusic: () => void;
  playBattleMusic: () => void;
  stopAll: () => void;
  playSfx: (type: "card_click" | "card_drag" | "enemy_hit" | "player_hit") => void;
}

// Generate simple audio tones as sound effects
const createToneBuffer = (freq: number, duration: number, type: OscillatorType = "sine"): (() => void) => {
  return () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = useAudioStore.getState().sfxVolume / 100 * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };
};

const sfxMap: Record<string, () => void> = {
  card_click: createToneBuffer(800, 0.08, "square"),
  card_drag: createToneBuffer(600, 0.06, "square"),
  enemy_hit: createToneBuffer(200, 0.15, "sawtooth"),
  player_hit: createToneBuffer(150, 0.2, "sawtooth"),
};

// Simple procedural music using Web Audio API
const createMusicLoop = (type: "menu" | "battle"): HTMLAudioElement => {
  // We'll use a silent audio element as a placeholder and drive audio via Web Audio
  const audio = new Audio();
  // Use data URI for a tiny silent mp3 to enable looping
  audio.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  audio.loop = true;
  return audio;
};

let menuAudioCtx: AudioContext | null = null;
let battleAudioCtx: AudioContext | null = null;
let menuInterval: number | null = null;
let battleInterval: number | null = null;

const playProceduralMusic = (type: "menu" | "battle", volume: number) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  if (type === "menu") {
    if (menuAudioCtx) menuAudioCtx.close();
    menuAudioCtx = ctx;
    if (menuInterval) clearInterval(menuInterval);
    
    // Calming tavern-style ambient loop
    const notes = [261.6, 329.6, 392, 349.2, 293.7, 261.6, 329.6, 392]; // C4 E4 G4 F4 D4 C4 E4 G4
    let noteIdx = 0;
    
    const playNote = () => {
      if (ctx.state === "closed") return;
      const vol = useAudioStore.getState().musicVolume / 100 * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[noteIdx % notes.length];
      gain.gain.value = vol;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2);
      
      // Add a soft pad
      const pad = ctx.createOscillator();
      const padGain = ctx.createGain();
      pad.type = "triangle";
      pad.frequency.value = notes[noteIdx % notes.length] / 2;
      padGain.gain.value = vol * 0.5;
      padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      pad.connect(padGain);
      padGain.connect(ctx.destination);
      pad.start();
      pad.stop(ctx.currentTime + 2.8);
      
      noteIdx++;
    };
    
    playNote();
    menuInterval = window.setInterval(playNote, 2000);
  } else {
    if (battleAudioCtx) battleAudioCtx.close();
    battleAudioCtx = ctx;
    if (battleInterval) clearInterval(battleInterval);
    
    // Tense battle music
    const notes = [146.8, 174.6, 196, 220, 196, 174.6, 146.8, 130.8]; // D3 F3 G3 A3...
    let noteIdx = 0;
    
    const playNote = () => {
      if (ctx.state === "closed") return;
      const vol = useAudioStore.getState().musicVolume / 100 * 0.1;
      
      // Bass drone
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = "sawtooth";
      bass.frequency.value = notes[noteIdx % notes.length];
      bassGain.gain.value = vol;
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      bass.start();
      bass.stop(ctx.currentTime + 0.9);
      
      // Percussion-like hit
      const perc = ctx.createOscillator();
      const percGain = ctx.createGain();
      perc.type = "square";
      perc.frequency.value = 80;
      percGain.gain.value = vol * 0.6;
      percGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      perc.connect(percGain);
      percGain.connect(ctx.destination);
      perc.start();
      perc.stop(ctx.currentTime + 0.15);
      
      noteIdx++;
    };
    
    playNote();
    battleInterval = window.setInterval(playNote, 800);
  }
};

const stopProceduralMusic = (type: "menu" | "battle") => {
  if (type === "menu") {
    if (menuInterval) { clearInterval(menuInterval); menuInterval = null; }
    if (menuAudioCtx) { menuAudioCtx.close().catch(() => {}); menuAudioCtx = null; }
  } else {
    if (battleInterval) { clearInterval(battleInterval); battleInterval = null; }
    if (battleAudioCtx) { battleAudioCtx.close().catch(() => {}); battleAudioCtx = null; }
  }
};

export const useAudioStore = create<AudioState>((set, get) => ({
  musicVolume: 75,
  sfxVolume: 75,
  menuMusic: null,
  battleMusic: null,
  currentTrack: null,

  setMusicVolume: (v) => set({ musicVolume: v }),
  setSfxVolume: (v) => set({ sfxVolume: v }),

  playMenuMusic: () => {
    const { currentTrack } = get();
    if (currentTrack === "menu") return;
    stopProceduralMusic("battle");
    playProceduralMusic("menu", get().musicVolume);
    set({ currentTrack: "menu" });
  },

  playBattleMusic: () => {
    const { currentTrack } = get();
    if (currentTrack === "battle") return;
    stopProceduralMusic("menu");
    playProceduralMusic("battle", get().musicVolume);
    set({ currentTrack: "battle" });
  },

  stopAll: () => {
    stopProceduralMusic("menu");
    stopProceduralMusic("battle");
    set({ currentTrack: null });
  },

  playSfx: (type) => {
    const { sfxVolume } = get();
    if (sfxVolume === 0) return;
    const fn = sfxMap[type];
    if (fn) fn();
  },
}));
