import type { RowComparisonData } from "@/types/regression";

import { calculateSummary, classifyCategory } from "../regression";

describe("classifyCategory", () => {
  it("동일한 상태면 unchanged여야 한다", () => {
    expect(classifyCategory("pass", "pass")).toBe("unchanged");
    expect(classifyCategory("format", "format")).toBe("unchanged");
    expect(classifyCategory("semantic", "semantic")).toBe("unchanged");
    expect(classifyCategory("logic", "logic")).toBe("unchanged");
  });

  it("pass → fail이면 regressed여야 한다", () => {
    expect(classifyCategory("pass", "format")).toBe("regressed");
    expect(classifyCategory("pass", "semantic")).toBe("regressed");
    expect(classifyCategory("pass", "logic")).toBe("regressed");
  });

  it("fail → pass면 improved여야 한다", () => {
    expect(classifyCategory("format", "pass")).toBe("improved");
    expect(classifyCategory("semantic", "pass")).toBe("improved");
    expect(classifyCategory("logic", "pass")).toBe("improved");
  });

  it("다른 fail 상태끼리면 changed여야 한다", () => {
    expect(classifyCategory("format", "semantic")).toBe("changed");
    expect(classifyCategory("semantic", "logic")).toBe("changed");
    expect(classifyCategory("logic", "format")).toBe("changed");
  });
});

describe("calculateSummary", () => {
  it("빈 배열이면 모두 0이어야 한다", () => {
    const result = calculateSummary([]);
    expect(result).toEqual({
      regressed: 0,
      improved: 0,
      changed: 0,
      unchanged: 0,
    });
  });

  it("카테고리별로 카운트해야 한다", () => {
    const rows: RowComparisonData[] = [
      {
        rowIndex: 1,
        datasetRowId: 1,
        baseStatus: "pass",
        targetStatus: "format",
        baseSemanticScore: 0.9,
        targetSemanticScore: 0.3,
      },
      {
        rowIndex: 2,
        datasetRowId: 2,
        baseStatus: "format",
        targetStatus: "pass",
        baseSemanticScore: 0.3,
        targetSemanticScore: 0.9,
      },
      {
        rowIndex: 3,
        datasetRowId: 3,
        baseStatus: "format",
        targetStatus: "semantic",
        baseSemanticScore: 0.3,
        targetSemanticScore: 0.5,
      },
      {
        rowIndex: 4,
        datasetRowId: 4,
        baseStatus: "pass",
        targetStatus: "pass",
        baseSemanticScore: 0.9,
        targetSemanticScore: 0.9,
      },
      {
        rowIndex: 5,
        datasetRowId: 5,
        baseStatus: "logic",
        targetStatus: "logic",
        baseSemanticScore: 0.8,
        targetSemanticScore: 0.8,
      },
    ];

    const result = calculateSummary(rows);
    expect(result).toEqual({
      regressed: 1,
      improved: 1,
      changed: 1,
      unchanged: 2,
    });
  });
});
