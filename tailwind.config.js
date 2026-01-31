<<<<<<< HEAD
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [daisyui],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#3b82f6",
                    "secondary": "#64748b",
                    "accent": "#10b981",
                    "neutral": "#1f2937",
                    "base-100": "#ffffff",
                    "info": "#0ea5e9",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                },
            },
            {
                dark: {
                    "primary": "#3b82f6",
                    "secondary": "#94a3b8",
                    "accent": "#10b981",
                    "neutral": "#1f2937",
                    "base-100": "#0f172a", // Slate-900
                    "base-200": "#1e293b", // Slate-800
                    "base-300": "#334155", // Slate-700
                    "info": "#0ea5e9",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                },
            },
        ],
        darkTheme: "dark",
    },
=======
/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: ['class', "class"],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				codmate: '14px',
			},
			fontFamily: {
				sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
			},
			boxShadow: {
				'premium-soft': '0 8px 30px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.08)',
				'premium-card': '0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)',
				'premium-float': '0 20px 50px -12px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.12)',
				codmate: '0 1px 2px rgba(0, 0, 0, 0.05)',
			},
			borderWidth: {
				'0.5': '0.5px',
			},
			colors: {
				'codmate-border': 'rgba(0, 0, 0, 0.07)',
				'codmate-border-dark': 'rgba(255, 255, 255, 0.1)',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				branding: {
					anthropic: '#FB7185', // Rose
					google: '#6366F1',    // Indigo
					openrouter: '#1C2024' // Dark Text
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
	plugins: [require("daisyui"), require("tailwindcss-animate")],
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#3b82f6",
					"secondary": "#64748b",
					"accent": "#10b981",
					"neutral": "#1f2937",
					"base-100": "#ffffff",
					"info": "#0ea5e9",
					"success": "#10b981",
					"warning": "#f59e0b",
					"error": "#ef4444",
				},
			},
			{
				dark: {
					"primary": "#3b82f6",
					"secondary": "#94a3b8",
					"accent": "#10b981",
					"neutral": "#1f2937",
					"base-100": "#0f172a", // Slate-900
					"base-200": "#1e293b", // Slate-800
					"base-300": "#334155", // Slate-700
					"info": "#0ea5e9",
					"success": "#10b981",
					"warning": "#f59e0b",
					"error": "#ef4444",
				},
			},
		],
		darkTheme: "dark",
	},
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
}
