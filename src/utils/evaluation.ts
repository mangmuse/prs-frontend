import type { RunResultRow } from "@/types/runDetail";

export type LayerStatus = "pass" | "fail" | "skipped";

/**
 * status 필드에서 각 레이어 통과 여부를 계산합니다.
 * - pass: 모든 레이어 통과
 * - logic: format, semantic 통과, logic 실패
 * - semantic: format 통과, semantic 실패
 * - format: format 실패
 */
export const getLayerStatus = (result: RunResultRow, layer: "semantic" | "logic"): LayerStatus => {
  if (!result.isFormatPassed) return "skipped";

  if (layer === "semantic") {
    // semantic 통과: status가 pass 또는 logic (semantic까지는 통과)
    return result.status === "pass" || result.status === "logic" ? "pass" : "fail";
  }

  // logic 통과: status가 pass
  return result.status === "pass" ? "pass" : "fail";
};

/**
 * status에서 semanticPassed 파생
 */
export const isSemanticPassed = (result: RunResultRow): boolean => {
  return result.status === "pass" || result.status === "logic";
};

/**
 * status에서 logicPassed 파생
 */
export const isLogicPassed = (result: RunResultRow): boolean => {
  return result.status === "pass";
};
