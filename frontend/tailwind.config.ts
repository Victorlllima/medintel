import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F0FF',
          100: '#CCE1FF',
          500: '#0066CC',
          600: '#0052A3',
          700: '#004080'
        },
        success: {
          50: '#ECFDF5',
          500: '#16A34A',
          600: '#15803D'
        },
        danger: {
          50: '#FEF2F2',
          500: '#DC2626',
          600: '#B91C1C'
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706'
        },
        neutral: {
          50: '#F5F7FA',
          100: '#E6E9EE',
          200: '#D1D5DB',
          500: '#6B7280',
          900: '#1F2937'
        }
      },
    },
  },
  plugins: [],
}
export default config
