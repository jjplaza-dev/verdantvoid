import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

// Placeholder save slots - will be fetched from database
const mockSaveSlots = [
  {
    id: 1,
    isEmpty: false,
    characterName: "The Warrior",
    currentNode: "Floor 3 - Elite",
    health: 45,
    maxHealth: 80,
    gold: 234,
    lastPlayed: "2 hours ago",
  },
  {
    id: 2,
    isEmpty: true,
    characterName: null,
    currentNode: null,
    health: null,
    maxHealth: null,
    gold: null,
    lastPlayed: null,
  },
  {
    id: 3,
    isEmpty: true,
    characterName: null,
    currentNode: null,
    health: null,
    maxHealth: null,
    gold: null,
    lastPlayed: null,
  },
];

const SaveSlots = () => {
  const navigate = useNavigate();

  const handleLoadSlot = (slotId: number) => {
    console.log("Loading slot:", slotId);
    // TODO: Load game from slot and navigate to map
  };

  const handleDeleteSlot = (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deleting slot:", slotId);
    // TODO: Delete save slot
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      {/* Back button */}
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
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Load Game</h1>
          <p className="font-body text-muted-foreground">
            Select a save slot to continue your adventure
          </p>
        </div>

        <div className="space-y-4">
          {mockSaveSlots.map((slot) => (
            <Card
              key={slot.id}
              className={`fantasy-border transition-all duration-300 ${
                slot.isEmpty
                  ? "opacity-60"
                  : "cursor-pointer hover:card-glow hover:scale-[1.01]"
              }`}
              onClick={() => !slot.isEmpty && handleLoadSlot(slot.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Save className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-title text-lg">
                      Slot {slot.id}
                    </CardTitle>
                    {slot.isEmpty ? (
                      <CardDescription className="font-body">Empty</CardDescription>
                    ) : (
                      <CardDescription className="font-body">
                        {slot.characterName}
                      </CardDescription>
                    )}
                  </div>
                </div>
                {!slot.isEmpty && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDeleteSlot(slot.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              {!slot.isEmpty && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 text-sm font-body">
                    <div>
                      <span className="text-muted-foreground">Progress</span>
                      <p className="font-semibold">{slot.currentNode}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Health</span>
                      <p className="font-semibold text-health">
                        {slot.health}/{slot.maxHealth}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gold</span>
                      <p className="font-semibold text-gold">{slot.gold}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last played: {slot.lastPlayed}
                  </p>
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
