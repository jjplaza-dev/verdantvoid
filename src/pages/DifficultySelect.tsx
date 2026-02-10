import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Skull, Shield, Swords, Flame } from "lucide-react";
import { useGameStore, DIFFICULTIES, Difficulty } from "@/stores/gameStore";

const difficultyIcons = { beginner: Shield, easy: Swords, hard: Flame, nightmare: Skull };
const difficultyColors = { beginner: "text-green-400", easy: "text-primary", hard: "text-orange-400", nightmare: "text-red-500" };

const DifficultySelect = () => {
  const navigate = useNavigate();
  const { setDifficulty } = useGameStore();

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    setDifficulty(difficulty);
    navigate("/summoner-menu");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/save-slots")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Select Difficulty</h1>
          <p className="font-body text-muted-foreground">Choose your challenge level - affects all enemy stats</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => {
            const diff = DIFFICULTIES[key];
            const Icon = difficultyIcons[key];
            const colorClass = difficultyColors[key];

            return (
              <Card
                key={key}
                className="group cursor-pointer fantasy-border transition-all duration-300 hover:card-glow hover:scale-[1.02]"
                onClick={() => handleSelectDifficulty(key)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Icon className={`h-8 w-8 ${colorClass}`} />
                  </div>
                  <CardTitle className={`font-title text-xl ${colorClass}`}>{diff.label}</CardTitle>
                  <CardDescription className="font-body">{diff.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground font-body">
                    Enemy stats: <span className={`font-bold ${colorClass}`}>{diff.multiplier * 100}%</span>
                  </p>
                  <Button className="mt-4 w-full font-title" variant={key === "nightmare" ? "destructive" : "default"}>
                    Select
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DifficultySelect;
