import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import Auth from "./pages/Auth";
import CharacterSelect from "./pages/CharacterSelect";
import SaveSlots from "./pages/SaveSlots";
import SummonerMenu from "./pages/SummonerMenu";
import Settings from "./pages/Settings";
import DifficultySelect from "./pages/DifficultySelect";
import TreeSelect from "./pages/TreeSelect";
import TreeInstance from "./pages/TreeInstance";
import Encounter from "./pages/Encounter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/save-slots" element={<SaveSlots />} />
          <Route path="/difficulty-select" element={<DifficultySelect />} />
          <Route path="/summoner-menu" element={<SummonerMenu />} />
          <Route path="/character-select" element={<CharacterSelect />} />
          <Route path="/tree-select" element={<TreeSelect />} />
          <Route path="/tree-instance" element={<TreeInstance />} />
          <Route path="/encounter" element={<Encounter />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
