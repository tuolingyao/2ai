'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const themeOrder = ['system', 'light', 'dark'] as const

const themeLabels = {
  system: '系统',
  light: '白天',
  dark: '暗夜',
}

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const currentTheme = themeOrder.includes(theme as (typeof themeOrder)[number])
    ? (theme as (typeof themeOrder)[number])
    : 'system'
  const Icon = themeIcons[currentTheme]

  function toggleTheme() {
    const currentIndex = themeOrder.indexOf(currentTheme)
    setTheme(themeOrder[(currentIndex + 1) % themeOrder.length])
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card/80 px-3 text-sm text-muted-foreground shadow-sm backdrop-blur transition hover:border-primary hover:text-primary"
      aria-label="切换主题"
      suppressHydrationWarning
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{themeLabels[currentTheme]}</span>
    </button>
  )
}
