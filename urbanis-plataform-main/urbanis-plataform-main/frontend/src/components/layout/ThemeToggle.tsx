import { Moon, Sun } from "lucide-react";
import { useUrbanStore } from "@/store/useUrbanStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useUrbanStore();

  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-fast border border-transparent hover:border-border rounded-md"
      title={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
