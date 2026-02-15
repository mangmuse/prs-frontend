import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMockRunSummary } from "@/test/factories/run";

import { useRunStatusChange } from "../useRunStatusChange";

describe("useRunStatusChange", () => {
  it("running에서 completed로 전환 시 onCompleted가 호출되어야 한다", () => {
    const onCompleted = vi.fn();
    const onFailed = vi.fn();
    const options = { onCompleted, onFailed };

    const runningRun = createMockRunSummary({
      status: "running",
      passRate: null,
      avgSemantic: null,
      formatPassRate: null,
      semanticPassRate: null,
      constraintPassRate: null,
    });
    const { rerender } = renderHook(({ runs }) => useRunStatusChange(runs, options), {
      initialProps: { runs: [runningRun] },
    });

    const completedRun = createMockRunSummary({ status: "completed", passRate: 0.9 });
    rerender({ runs: [completedRun] });

    expect(onCompleted).toHaveBeenCalledWith(completedRun);
    expect(onFailed).not.toHaveBeenCalled();
  });
});
