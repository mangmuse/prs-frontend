import type { RunResultRow } from "@/types/runDetail";

import { getLayerStatus, isLogicPassed, isSemanticPassed } from "../evaluation";

const createMockResult = (overrides: Partial<RunResultRow>): RunResultRow => ({
  id: 1,
  rowIndex: 1,
  datasetRowId: 1,
  inputSnapshot: {},
  expectedSnapshot: "",
  rawOutput: "",
  parsedOutput: null,
  status: "pass",
  isFormatPassed: true,
  semanticScore: 0.9,
  logicResults: { passed: true, results: [], errorMessage: null },
  assembledPrompt: { systemInstruction: "", userMessage: "" },
  ...overrides,
});

describe("getLayerStatus", () => {
  it("format 실패 시 semantic/logic은 skipped", () => {
    const result = createMockResult({ isFormatPassed: false, status: "format" });
    expect(getLayerStatus(result, "semantic")).toBe("skipped");
    expect(getLayerStatus(result, "logic")).toBe("skipped");
  });

  it("format 통과 시 semantic 상태 반환", () => {
    const passed = createMockResult({ status: "pass" });
    const passedLogic = createMockResult({ status: "logic" });
    const failed = createMockResult({ status: "semantic" });

    expect(getLayerStatus(passed, "semantic")).toBe("pass");
    expect(getLayerStatus(passedLogic, "semantic")).toBe("pass");
    expect(getLayerStatus(failed, "semantic")).toBe("fail");
  });

  it("format 통과 시 logic 상태 반환", () => {
    const passed = createMockResult({ status: "pass" });
    const failed = createMockResult({ status: "logic" });

    expect(getLayerStatus(passed, "logic")).toBe("pass");
    expect(getLayerStatus(failed, "logic")).toBe("fail");
  });
});

describe("isSemanticPassed", () => {
  it("status가 pass 또는 logic이면 true", () => {
    expect(isSemanticPassed(createMockResult({ status: "pass" }))).toBe(true);
    expect(isSemanticPassed(createMockResult({ status: "logic" }))).toBe(true);
  });

  it("status가 format 또는 semantic이면 false", () => {
    expect(isSemanticPassed(createMockResult({ status: "format" }))).toBe(false);
    expect(isSemanticPassed(createMockResult({ status: "semantic" }))).toBe(false);
  });
});

describe("isLogicPassed", () => {
  it("status가 pass이면 true", () => {
    expect(isLogicPassed(createMockResult({ status: "pass" }))).toBe(true);
  });

  it("status가 pass가 아니면 false", () => {
    expect(isLogicPassed(createMockResult({ status: "logic" }))).toBe(false);
    expect(isLogicPassed(createMockResult({ status: "semantic" }))).toBe(false);
    expect(isLogicPassed(createMockResult({ status: "format" }))).toBe(false);
  });
});
