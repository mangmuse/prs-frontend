import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { RunSummary } from "@/types/run";

import { useRunStatusChange } from "../useRunStatusChange";

const makeRun = (overrides: Partial<RunSummary> = {}): RunSummary => ({
  id: 1,
  promptId: 1,
  promptVersionId: 1,
  promptName: "test",
  versionNumber: 1,
  datasetId: 1,
  datasetName: "test",
  profileId: 1,
  profileName: "test",
  status: "running",
  passRate: null,
  avgSemantic: null,
  formatPassRate: null,
  semanticPassRate: null,
  constraintPassRate: null,
  totalRows: 10,
  createdAt: "2026-01-01",
  ...overrides,
});

describe("useRunStatusChange", () => {
  it("running에서 completed로 전환 시 onCompleted가 호출되어야 한다", () => {
    const onCompleted = vi.fn();
    const onFailed = vi.fn();
    const options = { onCompleted, onFailed };

    const runningRun = makeRun({ status: "running" });
    const { rerender } = renderHook(({ runs }) => useRunStatusChange(runs, options), {
      initialProps: { runs: [runningRun] },
    });

    const completedRun = makeRun({ status: "completed", passRate: 0.9 });
    rerender({ runs: [completedRun] });

    expect(onCompleted).toHaveBeenCalledWith(completedRun);
    expect(onFailed).not.toHaveBeenCalled();
  });
});
