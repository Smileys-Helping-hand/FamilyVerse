// FamilyVerse Theme Configuration
// Beautiful color palettes and design tokens for parental controls

export const parentalControlsTheme = {
  // Color Gradients
  gradients: {
    primary: "from-sky-500 to-purple-600",
    primaryHover: "from-sky-600 to-purple-700",
    success: "from-green-500 to-emerald-600",
    warning: "from-yellow-400 to-orange-500",
    danger: "from-red-500 to-red-600",
    info: "from-blue-500 to-cyan-600",
    educational: "from-green-100 to-emerald-100",
    creative: "from-purple-100 to-pink-100",
    entertainment: "from-blue-100 to-sky-100",
    header: "from-white via-sky-50/30 to-purple-50/30",
  },

  // Card Backgrounds
  cardBackgrounds: {
    sky: "from-white to-sky-50/20",
    purple: "from-white to-purple-50/20",
    green: "from-white to-green-50/20",
    red: "from-white to-red-50/20",
    blue: "from-white to-blue-50/20",
    yellow: "from-white to-yellow-50/20",
    indigo: "from-white to-indigo-50/20",
    emerald: "from-white to-emerald-50/20",
  },

  // Border Colors (for hover states)
  borderColors: {
    sky: "hover:border-sky-200",
    purple: "hover:border-purple-200",
    green: "hover:border-green-200",
    red: "hover:border-red-200",
    blue: "hover:border-blue-200",
    yellow: "hover:border-yellow-200",
    indigo: "hover:border-indigo-200",
    emerald: "hover:border-emerald-200",
  },

  // Icon Colors
  iconColors: {
    screenTime: "text-sky-600",
    educational: "text-green-600",
    achievements: "text-yellow-600",
    alerts: "text-red-600",
    bedtime: "text-indigo-600",
    breaks: "text-yellow-600",
    zones: "text-emerald-600",
    content: "text-purple-600",
  },

  // Status Colors
  statusColors: {
    safe: {
      bg: "bg-gradient-to-r from-green-100 to-emerald-100",
      text: "text-green-700",
      border: "border-green-200",
    },
    warning: {
      bg: "bg-gradient-to-r from-yellow-100 to-orange-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    danger: {
      bg: "bg-gradient-to-r from-red-100 to-red-200",
      text: "text-red-700",
      border: "border-red-200",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-100 to-sky-100",
      text: "text-blue-700",
      border: "border-blue-200",
    },
  },

  // Progress Bar Styles
  progressBars: {
    normal: {
      gradient: "bg-gradient-to-r from-sky-400 to-sky-600",
      shadow: "shadow-sky-500/50",
    },
    warning: {
      gradient: "bg-gradient-to-r from-yellow-400 to-orange-500",
      shadow: "shadow-yellow-500/50",
    },
    danger: {
      gradient: "bg-gradient-to-r from-red-500 to-red-600",
      shadow: "shadow-red-500/50",
    },
  },

  // Animation Classes
  animations: {
    fadeIn: "animate-in fade-in duration-500",
    fadeInSlow: "animate-in fade-in duration-700",
    slideInBottom: "animate-in fade-in slide-in-from-bottom-4 duration-700",
    slideInTop: "animate-in fade-in slide-in-from-top-4 duration-500",
    slideInLeft: "animate-in fade-in slide-in-from-left-4 duration-500",
    slideInRight: "animate-in fade-in slide-in-from-right-4",
    zoomIn: "animate-in fade-in zoom-in-50 duration-300",
    bounce: "animate-bounce",
    pulse: "animate-pulse",
  },

  // Hover Effects
  hoverEffects: {
    lift: "hover:-translate-y-1",
    scale: "hover:scale-105",
    shadow: "hover:shadow-xl",
    shadowLg: "hover:shadow-lg",
    rotate: "hover:rotate-90",
  },

  // Transition Classes
  transitions: {
    all: "transition-all duration-300",
    fast: "transition-all duration-200",
    colors: "transition-colors duration-200",
    transform: "transition-transform duration-200",
  },

  // Badge Styles
  badges: {
    educational: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200",
    creative: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200",
    entertainment: "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border-blue-200",
    protected: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200",
    zones: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200",
  },

  // Alert Styles (by severity)
  alerts: {
    high: {
      border: "border-red-300",
      bg: "bg-gradient-to-r from-red-50 to-red-100/50",
      hoverBorder: "hover:border-red-400",
    },
    medium: {
      border: "border-yellow-300",
      bg: "bg-gradient-to-r from-yellow-50 to-yellow-100/50",
      hoverBorder: "hover:border-yellow-400",
    },
    low: {
      border: "border-blue-300",
      bg: "bg-gradient-to-r from-blue-50 to-blue-100/50",
      hoverBorder: "hover:border-blue-400",
    },
  },

  // Button Styles
  buttons: {
    primary: "bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
    secondary: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
    success: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
    outline: "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200",
  },

  // Input Styles
  inputs: {
    focus: "border-2 focus:border-sky-400 transition-colors",
    readonly: "border-2 bg-gray-50",
  },

  // Card Hover Styles
  cardHover: {
    standard: "hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2",
    subtle: "hover:shadow-md transition-all duration-200 border-2",
  },

  // Shadow Styles
  shadows: {
    soft: "shadow-lg",
    glow: "shadow-xl",
    colored: {
      sky: "shadow-lg shadow-sky-500/50",
      purple: "shadow-lg shadow-purple-500/50",
      green: "shadow-lg shadow-green-500/50",
      red: "shadow-lg shadow-red-500/50",
      yellow: "shadow-lg shadow-yellow-500/50",
    },
  },

  // Typography
  typography: {
    gradientText: {
      primary: "bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent",
      success: "bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent",
      warning: "bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent",
      info: "bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent",
    },
  },

  // Shimmer Effect
  shimmer: "after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/30 after:via-transparent after:to-transparent after:animate-pulse",
};

// Helper function to combine theme classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Utility to get delay style for staggered animations
export function getAnimationDelay(index: number, delay: number = 100): { animationDelay: string } {
  return { animationDelay: `${index * delay}ms` };
}

// Color palette for educational content categories
export const categoryColors = {
  educational: {
    light: "from-green-100 to-emerald-100",
    dark: "from-green-600 to-emerald-700",
    border: "border-green-200",
    icon: "text-green-600",
  },
  creative: {
    light: "from-purple-100 to-pink-100",
    dark: "from-purple-600 to-pink-700",
    border: "border-purple-200",
    icon: "text-purple-600",
  },
  entertainment: {
    light: "from-blue-100 to-sky-100",
    dark: "from-blue-600 to-sky-700",
    border: "border-blue-200",
    icon: "text-blue-600",
  },
  social: {
    light: "from-pink-100 to-rose-100",
    dark: "from-pink-600 to-rose-700",
    border: "border-pink-200",
    icon: "text-pink-600",
  },
  news: {
    light: "from-orange-100 to-amber-100",
    dark: "from-orange-600 to-amber-700",
    border: "border-orange-200",
    icon: "text-orange-600",
  },
  sports: {
    light: "from-red-100 to-orange-100",
    dark: "from-red-600 to-orange-700",
    border: "border-red-200",
    icon: "text-red-600",
  },
};

// Screen time status helpers
export function getScreenTimeStatus(percentage: number) {
  if (percentage >= 100) {
    return {
      variant: "danger" as const,
      color: "text-red-600",
      ...parentalControlsTheme.progressBars.danger,
    };
  } else if (percentage > 80) {
    return {
      variant: "warning" as const,
      color: "text-yellow-600",
      ...parentalControlsTheme.progressBars.warning,
    };
  } else {
    return {
      variant: "normal" as const,
      color: "text-sky-600",
      ...parentalControlsTheme.progressBars.normal,
    };
  }
}

export default parentalControlsTheme;
