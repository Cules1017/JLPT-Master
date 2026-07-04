"use client";

import * as React from "react";
import { Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md border border-border/50"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
      
      <button 
        onClick={() => setIsVisible(false)}
        className="w-6 h-6 flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors"
        aria-label="Hide theme toggle"
        title="Ẩn nút chuyển màu"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
