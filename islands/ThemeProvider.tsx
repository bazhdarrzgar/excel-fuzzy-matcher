import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

// Global theme state
export const isDarkMode = signal<boolean>(false);

export default function ThemeProvider({ children }: { children: any }) {
  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      isDarkMode.value = true;
      document.documentElement.classList.add('dark');
    } else {
      isDarkMode.value = false;
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Update DOM and localStorage when theme changes
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode.value]);

  return <>{children}</>;
}

export function ThemeToggle() {
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-3 rounded-xl glass-liquid hover:scale-110 transition-all duration-300 shadow-lg dark:shadow-2xl hover:shadow-xl dark:hover:shadow-2xl border border-gray-300/50 dark:border-purple-500/50 ring-2 ring-transparent dark:ring-cyan-500/30"
      title={isDarkMode.value ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative z-10">
        {isDarkMode.value ? (
          <svg className="w-5 h-5 text-yellow-500 dark:text-cyan-400 group-hover:text-yellow-400 dark:group-hover:text-cyan-300 transition-all duration-300 group-hover:rotate-180 drop-shadow-lg dark:drop-shadow-[0_0_10px_rgba(16,217,196,0.5)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.708.707a1 1 0 001.414-1.414l-.707-.708a1 1 0 00-1.414 1.415zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-all duration-300 group-hover:rotate-12 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </div>
      
      {/* CYBERPUNK Enhanced glow effects */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-purple-500/30 dark:to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm animate-pulse"></div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/10 to-orange-400/10 dark:from-purple-500/20 dark:to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      
      {/* CYBERPUNK Additional neon glow ring */}
      <div className="absolute inset-0 rounded-xl dark:ring-2 dark:ring-cyan-400/0 dark:group-hover:ring-cyan-400/50 transition-all duration-300"></div>
    </button>
  );
}