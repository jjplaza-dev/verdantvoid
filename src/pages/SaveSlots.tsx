import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2, Play } from "lucide-react";
import { useGameStore, DIFFICULTIES } from "@/stores/gameStore";

const SaveSlots = () => {
  const navigate = useNavigate();
  const { saveSlots, setActiveSlot, loadSlot } = useGameStore();

  const handleSlotClick = (slotId: number) => {
    const slot = saveSlots.find(s => s.id === slotId);
    if (!slot) return;

    setActiveSlot(slotId);

    if (slot.isEmpty) {
      // Empty slot - go to difficulty select to start new game
      navigate("/difficulty-select");
    } else if (slot.inTreeInstance) {
      // Has ongoing tree progress - go directly to tree instance
      loadSlot(slotId);
      navigate("/tree-instance");
    } else {
      // Has save but not in tree - go to tree select
      loadSlot(slotId);
      navigate("/tree-select");
    }
  };

  const handleDeleteSlot = (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement delete with confirmation
    console.log("Delete slot:", slotId);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 font-title"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Save Slots</h1>
          <p className="font-body text-muted-foreground">
            Choose a slot to continue or start a new adventure
          </p>
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
                    <CardTitle className="font-title">Slot {slot.id}</CardTitle>
                    <CardDescription className="font-body">
                      {slot.isEmpty 
                        ? "Empty - Start New Game" 
                        : `${slot.characterId} - ${slot.difficulty ? DIFFICULTIES[slot.difficulty]?.label : "Unknown"}`
                      }
                    </CardDescription>
                  </div>
                </div>
                {!slot.isEmpty && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteSlot(slot.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardHeader>
              {!slot.isEmpty && (
                <CardContent>
                  <div className="flex gap-4 text-sm font-body text-muted-foreground">
                    <span>Tree: {(slot.currentTreeIndex ?? 0) + 1}</span>
                    <span>HP: {slot.currentHealth}/{slot.maxHealth}</span>
                    <span>Nodes: {slot.completedNodes.length}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SaveSlots;
