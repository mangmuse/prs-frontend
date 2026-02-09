import { describe, expect, it } from "vitest";

import { extractProvider } from "../provider";

describe("extractProvider", () => {
  it("openai/gpt-4o에서 openai를 추출해야 한다", () => {
    expect(extractProvider("openai/gpt-4o")).toBe("openai");
  });

  it("anthropic/claude-3-sonnet에서 anthropic을 추출해야 한다", () => {
    expect(extractProvider("anthropic/claude-3-sonnet")).toBe("anthropic");
  });

  it("gemini/gemini-2.5-flash에서 gemini를 추출해야 한다", () => {
    expect(extractProvider("gemini/gemini-2.5-flash")).toBe("gemini");
  });

  it("알 수 없는 provider는 null을 반환해야 한다", () => {
    expect(extractProvider("unknown/model")).toBeNull();
  });

  it("슬래시가 없는 모델명은 null을 반환해야 한다", () => {
    expect(extractProvider("gpt-4o")).toBeNull();
  });
});
