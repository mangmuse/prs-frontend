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

  it("running에서 failed로 전환 시 onFailed가 호출되어야 한다", () => {
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

    const failedRun = createMockRunSummary({ status: "failed", passRate: null });
    rerender({ runs: [failedRun] });

    expect(onFailed).toHaveBeenCalledWith(failedRun);
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("running이 아닌 상태에서 전환 시 콜백이 호출되지 않아야 한다", () => {
    const onCompleted = vi.fn();
    const onFailed = vi.fn();
    const options = { onCompleted, onFailed };

    const completedRun = createMockRunSummary({ status: "completed" });
    const { rerender } = renderHook(({ runs }) => useRunStatusChange(runs, options), {
      initialProps: { runs: [completedRun] },
    });

    const failedRun = createMockRunSummary({ status: "failed", passRate: null });
    rerender({ runs: [failedRun] });

    expect(onCompleted).not.toHaveBeenCalled();
    expect(onFailed).not.toHaveBeenCalled();
  });
});
