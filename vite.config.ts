import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정: React 플러그인을 사용하여 빠른 빌드와 HMR을 지원합니다.
export default defineConfig({
  plugins: [react()],
});

