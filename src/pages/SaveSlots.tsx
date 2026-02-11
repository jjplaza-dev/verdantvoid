import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2, Play, Coins } from "lucide-react";
import { useGameStore, DIFFICULTIES } from "@/stores/gameStore";
import { useAuthStore } from "@/stores/authStore";

const SaveSlots = () => {
  const navigate = useNavigate();
  const { saveSlots, setActiveSlot, loadSlot, createSaveSlot, deleteSaveSlot, loadSaveSlotsFromDb, saveSlotsLoaded } = useGameStore();
  const { user } = useAuthStore();
  
  const [createModal, setCreateModal] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    if (user && !saveSlotsLoaded) {
      loadSaveSlotsFromDb(user.id);
    }
  }, [user, saveSlotsLoaded, loadSaveSlotsFromDb]);

  const handleSlotClick = (slotId: number) => {
    const slot = saveSlots.find(s => s.id === slotId);
    if (!slot) return;

    if (slot.isEmpty) {
      setCreateModal(slotId);
      setUsernameInput("");
    } else {
      setActiveSlot(slotId);
      loadSlot(slotId);
      if (slot.inTreeInstance) {
        navigate("/tree-instance");
      } else {
        navigate("/summoner-menu");
      }
    }
  };

  const handleCreateSubmit = () => {
    if (!usernameInput.trim() || createModal === null) return;
    createSaveSlot(createModal, usernameInput.trim());
    setCreateModal(null);
    navigate("/difficulty-select");
  };

  const handleDeleteSubmit = () => {
    if (deleteModal === null) return;
    const slot = saveSlots.find(s => s.id === deleteModal);
    if (!slot || deleteInput !== slot.username) return;
    deleteSaveSlot(deleteModal);
    setDeleteModal(null);
    setDeleteInput("");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Summoner Saves</h1>
          <p className="font-body text-muted-foreground">Choose a slot to continue or start a new adventure</p>
        </div>

        <div className="flex flex-col gap-4">
          {saveSlots.map((slot) => (
            <Card
              key={slot.id}
              className="group cursor-pointer fantasy-border transition-all duration-300 hover:card-glow hover:scale-[1.01]"
              onClick={() => handleSlotClick(slot.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    {slot.isEmpty ? (
                      <Save className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Play className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="font-title">
                      {slot.isEmpty ? `Slot ${slot.id}` : slot.username}
                    </CardTitle>
                    <CardDescription className="font-body">
                      {slot.isEmpty 
                        ? "Empty - Start New Game" 
                        : (
                          <span className="flex items-center gap-3">
                            <span>{slot.difficulty ? DIFFICULTIES[slot.difficulty]?.label : "Unknown"}</span>
                            <span className="flex items-center gap-1">
                              <Coins className="h-3 w-3 text-gold" />
                              <span className="text-gold">{slot.credits}</span>
                            </span>
                          </span>
                        )
                      }
                    </CardDescription>
                  </div>
                </div>
                {!slot.isEmpty && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal(slot.id);
                      setDeleteInput("");
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardHeader>
              {!slot.isEmpty && (
                <CardContent>
                  <div className="flex gap-4 text-sm font-body text-muted-foreground">
                    {slot.inTreeInstance && <span>Delving - Tree {(slot.currentTreeIndex ?? 0) + 1}</span>}
                    {slot.completedTrees.length > 0 && <span>Trees cleared: {slot.completedTrees.length}</span>}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Create Username Modal */}
      <Dialog open={createModal !== null} onOpenChange={() => setCreateModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-title">Create Summoner</DialogTitle>
            <DialogDescription className="font-body">Enter a username for this save slot</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Summoner name..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
            className="font-body"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModal(null)}>Cancel</Button>
            <Button onClick={handleCreateSubmit} disabled={!usernameInput.trim()}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal !== null} onOpenChange={() => setDeleteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-title text-destructive">Delete Save</DialogTitle>
            <DialogDescription className="font-body">
              Type your username <span className="font-bold text-foreground">"{saveSlots.find(s => s.id === deleteModal)?.username}"</span> to confirm deletion.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Type username to confirm..."
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            className="font-body"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={deleteInput !== saveSlots.find(s => s.id === deleteModal)?.username}
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaveSlots;
