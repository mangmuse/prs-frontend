import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "../mocks/server";

/**
 * Node.js 25+ Web Storage API 충돌 해결
 * Node.js 25에서 globalThis.localStorage가 기본 활성화되지만
 * --localstorage-file 없이는 메서드(clear, getItem 등)가 undefined.
 * jsdom이 이를 감지하고 덮어쓰기를 건너뛰므로 명시적으로 mock 제공.
 * 참고: https://github.com/vitest-dev/vitest/issues/8757
 */
const createStorageMock = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: createStorageMock(),
  configurable: true,
  writable: true,
});

window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.PointerEvent = MouseEvent as typeof PointerEvent;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
