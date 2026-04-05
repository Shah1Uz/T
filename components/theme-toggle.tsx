"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 xl:h-10 xl:w-10 rounded-lg text-muted-foreground bg-muted/30">
        <Sun className="h-[18px] w-[18px] opacity-50" />
      </Button>
    )
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 xl:h-10 xl:w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      title={currentTheme === "dark" ? "Kunduzgi rejim" : "Tungi rejim"}
    >
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
