import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Runs a cleanup after each test case (e.g., unmounts React trees that were mounted with render).
 */
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
