import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Unmounts React trees after each test block to prevent memory leaks or overlapping state
afterEach(() => {
  cleanup();
});
