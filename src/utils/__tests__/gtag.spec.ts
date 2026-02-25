import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadGtag = async (measurementId?: string) => {
  vi.stubEnv("VITE_GA_MEASUREMENT_ID", measurementId ?? "");
  return import("../gtag");
};

describe("gtag", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.querySelectorAll("script[src*='gtag']").forEach((el) => el.remove());
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("initializeGA", () => {
    it("VITE_GA_MEASUREMENT_ID가 없으면 스크립트를 삽입하지 않아야 한다", async () => {
      const { initializeGA } = await loadGtag();

      initializeGA();

      const scripts = document.head.querySelectorAll("script[src*='gtag']");
      expect(scripts).toHaveLength(0);
    });

    it("VITE_GA_MEASUREMENT_ID가 있으면 gtag 스크립트를 삽입해야 한다", async () => {
      const { initializeGA } = await loadGtag("G-TEST123");

      initializeGA();

      const scripts = document.head.querySelectorAll("script[src*='gtag']");
      expect(scripts).toHaveLength(1);
      expect(scripts[0].getAttribute("src")).toContain("G-TEST123");
    });

    it("여러 번 호출해도 스크립트는 1번만 삽입되어야 한다", async () => {
      const { initializeGA } = await loadGtag("G-TEST123");

      initializeGA();
      initializeGA();
      initializeGA();

      const scripts = document.head.querySelectorAll("script[src*='gtag']");
      expect(scripts).toHaveLength(1);
    });
  });

  describe("sendPageView", () => {
    it("VITE_GA_MEASUREMENT_ID가 없으면 에러 없이 무시해야 한다", async () => {
      const { initializeGA, sendPageView } = await loadGtag();
      initializeGA();

      expect(() => sendPageView("/test")).not.toThrow();
    });
  });
});
