import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState([75]);

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

      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Settings</h1>
          <p className="font-body text-muted-foreground">
            Customize your experience
          </p>
        </div>

        <Card className="fantasy-border">
          <CardHeader>
            <CardTitle className="font-title text-xl">Audio</CardTitle>
            <CardDescription className="font-body">
              Adjust sound and music settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <Label htmlFor="sound" className="font-body">Sound Effects</Label>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {musicEnabled ? (
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <Label htmlFor="music" className="font-body">Music</Label>
              </div>
              <Switch
                id="music"
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
              />
            </div>

            <div className="space-y-3">
              <Label className="font-body">Master Volume: {masterVolume[0]}%</Label>
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 fantasy-border">
          <CardHeader>
            <CardTitle className="font-title text-xl">Game</CardTitle>
            <CardDescription className="font-body">
              Game preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground font-body">
              More settings coming in future updates...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
