import { describe, expect, it } from "vitest";

import { formatPercent } from "../format";

describe("formatPercent", () => {
  it("null이면 '-'을 반환해야 한다", () => {
    expect(formatPercent(null)).toBe("-");
  });

  it("소수를 퍼센트로 변환해야 한다", () => {
    expect(formatPercent(0.75)).toBe("75.0");
  });

  it("decimals 파라미터로 소수점 자릿수를 지정할 수 있어야 한다", () => {
    expect(formatPercent(0.123, 2)).toBe("12.30");
  });
});
