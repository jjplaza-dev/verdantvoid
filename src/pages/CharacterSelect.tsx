import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Sword, Zap } from "lucide-react";

const characters = [
  {
    id: "warrior",
    name: "The Warrior",
    icon: Sword,
    description: "A battle-hardened fighter who excels in direct combat.",
    baseStats: {
      health: 80,
      energy: 3,
      offense: 10,
      defense: 8,
      cardDraw: 5,
      deckSize: 10,
      gold: 100,
      luck: 5,
      armor: 5,
    },
  },
  {
    id: "guardian",
    name: "The Guardian",
    icon: Shield,
    description: "A defensive specialist who outlasts opponents.",
    baseStats: {
      health: 90,
      energy: 3,
      offense: 6,
      defense: 12,
      cardDraw: 5,
      deckSize: 10,
      gold: 100,
      luck: 5,
      armor: 10,
    },
  },
  {
    id: "mystic",
    name: "The Mystic",
    icon: Zap,
    description: "A wielder of arcane powers with versatile abilities.",
    baseStats: {
      health: 65,
      energy: 4,
      offense: 8,
      defense: 5,
      cardDraw: 6,
      deckSize: 12,
      gold: 100,
      luck: 10,
      armor: 0,
    },
  },
];

const CharacterSelect = () => {
  const navigate = useNavigate();

  const handleSelectCharacter = (characterId: string) => {
    // TODO: Store selected character and start new game
    console.log("Selected character:", characterId);
    // navigate("/map");
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

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Choose Your Champion</h1>
          <p className="font-body text-muted-foreground">
            Each champion has unique strengths and starting abilities
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {characters.map((char) => (
            <Card
              key={char.id}
              className="group cursor-pointer fantasy-border transition-all duration-300 hover:card-glow hover:scale-[1.02]"
              onClick={() => handleSelectCharacter(char.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <char.icon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-title text-xl">{char.name}</CardTitle>
                <CardDescription className="font-body">{char.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health</span>
                    <span className="text-health font-semibold">{char.baseStats.health}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy</span>
                    <span className="text-energy font-semibold">{char.baseStats.energy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offense</span>
                    <span className="text-gold font-semibold">{char.baseStats.offense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Defense</span>
                    <span className="font-semibold">{char.baseStats.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card Draw</span>
                    <span className="font-semibold">{char.baseStats.cardDraw}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Armor</span>
                    <span className="font-semibold">{char.baseStats.armor}%</span>
                  </div>
                </div>
                <Button className="mt-6 w-full font-title">Select</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelect;
