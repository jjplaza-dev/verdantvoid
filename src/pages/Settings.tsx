import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Volume2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/stores/audioStore";

interface SettingsProps {
  embedded?: boolean;
  onClose?: () => void;
}

const Settings = ({ embedded, onClose }: SettingsProps) => {
  const navigate = useNavigate();
  const { musicVolume, sfxVolume, setMusicVolume, setSfxVolume } = useAudioStore();

  return (
    <div className={embedded ? "" : "min-h-screen bg-background px-4 py-8"}>
      {!embedded && (
        <Button variant="ghost" className="absolute left-4 top-4 font-title" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      )}
      {embedded && onClose && (
        <Button variant="ghost" className="absolute right-4 top-4 font-title text-sm" onClick={onClose}>
          ✕
        </Button>
      )}

      <div className={embedded ? "" : "mx-auto max-w-lg"}>
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-title text-4xl font-bold glow-gold">Settings</h1>
          <p className="font-body text-muted-foreground">Customize your experience</p>
        </div>

        <Card className="fantasy-border">
          <CardHeader>
            <CardTitle className="font-title text-xl">Audio</CardTitle>
            <CardDescription className="font-body">Adjust sound and music settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <Label className="font-body">Sound Effects: {sfxVolume}%</Label>
              </div>
              <Slider value={[sfxVolume]} onValueChange={([v]) => setSfxVolume(v)} max={100} step={1} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <Label className="font-body">Music: {musicVolume}%</Label>
              </div>
              <Slider value={[musicVolume]} onValueChange={([v]) => setMusicVolume(v)} max={100} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 fantasy-border">
          <CardHeader>
            <CardTitle className="font-title text-xl">Game</CardTitle>
            <CardDescription className="font-body">Game preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground font-body">More settings coming in future updates...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
