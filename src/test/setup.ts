import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock import.meta.env
vi.mock('import.meta.env', {
  default: {
    VITE_OJS_BASE_URL: 'http://localhost:8080',
    VITE_MATOMO_BASE_URL: 'http://localhost:8888',
    VITE_MATOMO_SITE_ID: '1',
    VITE_MATOMO_API_TOKEN: 'test-token',
    VITE_WS_URL: 'ws://localhost:3001',
  },
})
