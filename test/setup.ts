import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees and reset jsdom between tests to prevent cross-test leakage.
afterEach(() => {
  cleanup();
});
