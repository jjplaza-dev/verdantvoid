import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

const MainMenu = () => {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Check auth state
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, [setUser]);

  useEffect(() => {
    // GSAP entrance animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: -50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2 }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      )
      .fromTo(
        buttonsRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
        "-=0.3"
      );

    return () => {
      tl.kill();
    };
  }, []);

  const handleNewGame = () => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/character-select");
    }
  };

  const handleLoadGame = () => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/save-slots");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Game Icon */}
        <div className="mb-6">
          <Swords className="h-16 w-16 text-primary" />
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="mb-2 text-center text-5xl font-bold tracking-wider text-foreground opacity-0 md:text-7xl font-title glow-gold"
        >
          CARD BATTLER
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mb-12 text-center text-lg text-muted-foreground opacity-0 md:text-xl font-body"
        >
          A roguelike deck-building adventure
        </p>

        {/* Menu Buttons */}
        <div
          ref={buttonsRef}
          className="flex w-full max-w-xs flex-col gap-4"
        >
          <Button
            onClick={handleNewGame}
            size="lg"
            className="h-14 text-lg font-title tracking-wide fantasy-border hover:card-glow transition-shadow duration-300"
          >
            New Game
          </Button>

          <Button
            onClick={handleLoadGame}
            variant="secondary"
            size="lg"
            className="h-14 text-lg font-title tracking-wide fantasy-border hover:card-glow transition-shadow duration-300"
          >
            Load Game
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-14 text-lg font-title tracking-wide fantasy-border hover:card-glow transition-shadow duration-300"
            onClick={() => navigate("/settings")}
          >
            Settings
          </Button>

          {user && (
            <Button
              variant="ghost"
              size="lg"
              className="h-14 text-lg font-title tracking-wide text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          )}
        </div>

        {/* Auth status */}
        {user && (
          <p className="mt-8 text-sm text-muted-foreground font-body">
            Signed in as {user.email}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-sm text-muted-foreground font-body">
        <p>MVP Version 0.1</p>
      </div>
    </div>
  );
};

export default MainMenu;
