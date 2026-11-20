import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Tests live in /test (outside src) so the production `tsc -b && vite build`
// never compiles them. jsdom gives us localStorage + document for store/hook tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/setup.ts']
  }
});
