import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // טעינת משתני סביבה (כמו ה-API Key שלך)
    const env = loadEnv(mode, '.', '');

    return {
      // הגדרת בסיס עבור GitHub Pages
      base: '/moshe1ch-kidi/', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // הזרקת המפתחות לקוד כך שיהיו נגישים דרך process.env
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // קיצור דרך לשימוש ב-@ במקום נתיבים ארוכים
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
