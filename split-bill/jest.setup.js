import '@testing-library/jest-dom';

// Polyfill Web APIs for jsdom environment
// (needed by undici/jsdom chain used by isomorphic-dompurify)
const { TextDecoder, TextEncoder } = require('util');
const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
const { MessagePort, MessageChannel } = require('worker_threads');
Object.assign(global, {
  TextDecoder, TextEncoder,
  ReadableStream, WritableStream, TransformStream,
  MessagePort, MessageChannel,
});

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Global test utilities
global.fetch = jest.fn();

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
