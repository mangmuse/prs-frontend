import { MemoryRouter, Route, Routes } from "react-router";

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { RunDetailPage } from "@/pages/RunDetailPage/RunDetailPage";
import { RUN_DETAIL_PAGE_SIZE } from "@/queries/runQueries";
import { createMockRunDetail, createMockRunResultRow } from "@/test/factories/run";
import { renderWithClient } from "@/test/utils";
import type { StatusCounts } from "@/types/runDetail";

const API = "http://localhost:8000";
const PAGE_SIZE = RUN_DETAIL_PAGE_SIZE;

let intersectionCallback: IntersectionObserverCallback;

const generateResults = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockRunResultRow({
      id: i + 1,
      rowIndex: i + 1,
      datasetRowId: i + 1,
      inputSnapshot: { text: `입력 ${i + 1}` },
    }),
  );

const renderRunDetailPage = (runId = 1) =>
  renderWithClient(
    <MemoryRouter initialEntries={[`/runs/${runId}`]}>
      <Routes>
        <Route path="/runs/:id" element={<RunDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

const TOTAL_COUNT = PAGE_SIZE + 20;
const allResults = generateResults(TOTAL_COUNT);

type RunDetailHandlerOptions = {
  results?: ReturnType<typeof generateResults>;
  totalCount?: number;
  statusCounts?: StatusCounts;
  statusFilter?: boolean;
  onRequest?: () => void;
  delayMs?: number;
  delayAfter?: number;
};

const setupRunDetailHandler = (options: RunDetailHandlerOptions = {}) => {
  const {
    results: sourceResults = allResults,
    totalCount: total = TOTAL_COUNT,
    statusCounts = { pass: total, format: 0, semantic: 0, constraint: 0 },
    statusFilter = false,
    onRequest,
    delayMs,
    delayAfter = 0,
  } = options;

  let requestCount = 0;

  server.use(
    http.get(`${API}/runs/:id`, async ({ request, params }) => {
      if (String(params.id).includes("related")) return;

      requestCount++;
      onRequest?.();

      const url = new URL(request.url);
      const limit = Number(url.searchParams.get("limit") || 0);
      const cursor = Number(url.searchParams.get("cursor") || 0);

      let filtered = sourceResults;
      if (statusFilter) {
        const statusParam = url.searchParams.get("status");
        if (statusParam === "pass") {
          filtered = sourceResults.filter((r) => r.status === "pass");
        } else if (statusParam === "fail") {
          filtered = sourceResults.filter((r) => r.status !== "pass");
        }
      }

      if (limit) {
        const start = cursor ? filtered.findIndex((r) => r.id === cursor) + 1 : 0;
        const page = filtered.slice(start, start + limit);
        const hasNext = start + limit < filtered.length;

        if (delayMs && requestCount > delayAfter) {
          await delay(delayMs);
        }

        return HttpResponse.json({
          ...createMockRunDetail({ results: page }),
          nextCursor: hasNext ? page[page.length - 1].id : null,
          totalCount: total,
          statusCounts,
        });
      }

      return HttpResponse.json(createMockRunDetail({ results: filtered }));
    }),
  );

  return { getRequestCount: () => requestCount };
};

type ReevaluateHandlerOptions = {
  failingIds?: number[];
  onRequest?: (body: Record<string, unknown>) => void;
};

const setupReevaluateHandler = ({ failingIds = [], onRequest }: ReevaluateHandlerOptions = {}) => {
  const failingSet = new Set(failingIds);
  const failCount = failingIds.length;

  server.use(
    http.post(`${API}/runs/:id/re-evaluate`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      onRequest?.(body);

      const results = allResults.map((result) => ({
        id: result.id,
        status: failingSet.has(result.id) ? "semantic" : "pass",
        constraintResults: { passed: true, results: [], errorMessage: null },
      }));

      return HttpResponse.json({
        results,
        passRate: failCount > 0 ? (TOTAL_COUNT - failCount) / TOTAL_COUNT : 1,
        statusCounts: {
          pass: TOTAL_COUNT - failCount,
          format: 0,
          semantic: failCount,
          constraint: 0,
        },
      });
    }),
  );
};

beforeEach(() => {
  intersectionCallback = () => {};
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        intersectionCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  server.use(
    http.get(`${API}/runs/:id/related-versions`, () =>
      HttpResponse.json({ executedRuns: [], unexecutedVersions: [] }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RunDetailPage 무한스크롤", () => {
  it("첫 로드 시 첫 페이지 결과만 표시되어야 한다", async () => {
    setupRunDetailHandler();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(PAGE_SIZE + 1);
  });

  it("테이블 하단에 스크롤하면 다음 페이지가 로드되어야 한다", async () => {
    setupRunDetailHandler();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(TOTAL_COUNT + 1);
    });
  });

  it("마지막 페이지에 도달하면 추가 로딩이 발생하지 않아야 한다", async () => {
    const { getRequestCount } = setupRunDetailHandler();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(TOTAL_COUNT + 1);
    });

    const countAfterFullLoad = getRequestCount();

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await new Promise((r) => setTimeout(r, 100));

    expect(getRequestCount()).toBe(countAfterFullLoad);
  });

  it("다음 페이지 로딩 중 로딩 인디케이터가 표시되어야 한다", async () => {
    setupRunDetailHandler({ delayMs: 200, delayAfter: 1 });
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(screen.getByText("더 불러오는 중...")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(TOTAL_COUNT + 1);
    });
  });
});

describe("RunDetailPage 탭 카운트", () => {
  it("50건만 로드된 상태에서도 전체 기준 카운트가 탭에 표시되어야 한다", async () => {
    const PASS_COUNT = 45;
    const FAIL_COUNT = TOTAL_COUNT - PASS_COUNT;

    setupRunDetailHandler({
      statusCounts: { pass: PASS_COUNT, format: 10, semantic: 10, constraint: 5 },
    });
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: `전체 (${TOTAL_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `통과 (${PASS_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `실패 (${FAIL_COUNT})` })).toBeInTheDocument();
  });

  it("결과가 0건이면 모든 탭 카운트가 0으로 표시되어야 한다", async () => {
    setupRunDetailHandler({
      results: [],
      totalCount: 0,
      statusCounts: { pass: 0, format: 0, semantic: 0, constraint: 0 },
    });

    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "전체 (0)" })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "통과 (0)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "실패 (0)" })).toBeInTheDocument();
  });
});

describe("RunDetailPage 서버 사이드 필터링", () => {
  const PASS_COUNT = 45;
  const FAIL_COUNT = TOTAL_COUNT - PASS_COUNT;

  const mixedResults = [
    ...Array.from({ length: PASS_COUNT }, (_, i) =>
      createMockRunResultRow({
        id: i + 1,
        rowIndex: i + 1,
        datasetRowId: i + 1,
        status: "pass",
        inputSnapshot: { text: `입력 ${i + 1}` },
      }),
    ),
    ...Array.from({ length: FAIL_COUNT }, (_, i) =>
      createMockRunResultRow({
        id: PASS_COUNT + i + 1,
        rowIndex: PASS_COUNT + i + 1,
        datasetRowId: PASS_COUNT + i + 1,
        status: "format",
        inputSnapshot: { text: `입력 ${PASS_COUNT + i + 1}` },
      }),
    ),
  ];

  const setupFilterableHandler = () => {
    setupRunDetailHandler({
      results: mixedResults,
      statusFilter: true,
      statusCounts: { pass: PASS_COUNT, format: FAIL_COUNT, semantic: 0, constraint: 0 },
    });
  };

  it("필터 변경 시 해당 status의 결과만 표시되어야 한다", async () => {
    const user = userEvent.setup();
    setupFilterableHandler();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    await user.click(screen.getByRole("button", { name: /실패/ }));

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(FAIL_COUNT + 1);
    });
  });

  it("필터와 무관하게 탭 카운트는 전체 기준으로 표시되어야 한다", async () => {
    const user = userEvent.setup();
    setupFilterableHandler();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: `전체 (${TOTAL_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `통과 (${PASS_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `실패 (${FAIL_COUNT})` })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /실패/ }));

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(FAIL_COUNT + 1);
    });

    expect(screen.getByRole("button", { name: `전체 (${TOTAL_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `통과 (${PASS_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `실패 (${FAIL_COUNT})` })).toBeInTheDocument();
  });

  it("필터 변경 시 첫 페이지부터 다시 로드되어야 한다", async () => {
    const user = userEvent.setup();
    setupFilterableHandler();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(TOTAL_COUNT + 1);
    });

    await user.click(screen.getByRole("button", { name: /실패/ }));

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(FAIL_COUNT + 1);
    });
  });
});

describe("RunDetailPage 비교 모드 무한스크롤", () => {
  const COMPARE_TARGET_ID = 2;
  const COMPARE_TARGET_VERSION = 2;

  const setupCompareModeHandlers = ({ regressedRowIds = [] as number[] } = {}) => {
    const regressedSet = new Set(regressedRowIds);

    server.use(
      http.get(`${API}/runs/:id/related-versions`, () =>
        HttpResponse.json({
          executedRuns: [
            {
              id: 1,
              versionNumber: 1,
              status: "completed",
              passRate: 0.85,
              createdAt: "2026-01-01T00:00:00Z",
            },
            {
              id: COMPARE_TARGET_ID,
              versionNumber: COMPARE_TARGET_VERSION,
              status: "completed",
              passRate: 0.8,
              createdAt: "2026-01-02T00:00:00Z",
            },
          ],
          unexecutedVersions: [],
        }),
      ),
      http.get(`${API}/runs/:targetId/compare/:baseId`, () =>
        HttpResponse.json({
          pValue: 0.03,
          rowComparisons: allResults.map((r) => ({
            rowIndex: r.rowIndex,
            datasetRowId: r.datasetRowId,
            baseStatus: "pass",
            targetStatus: regressedSet.has(r.rowIndex) ? "semantic" : r.status,
            baseSemanticScore: 0.9,
            targetSemanticScore: regressedSet.has(r.rowIndex) ? 0.5 : 0.95,
          })),
        }),
      ),
    );
  };

  it("비교 모드 '전체' 탭에서 무한스크롤이 동작해야 한다", async () => {
    const user = userEvent.setup();
    setupRunDetailHandler();
    setupCompareModeHandlers();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText(`v${COMPARE_TARGET_VERSION}와 비교`));

    await waitFor(() => {
      expect(screen.getByText(/v1 vs v2/)).toBeInTheDocument();
    });

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(TOTAL_COUNT + 1);
    });
  });

  it("비교 전용 필터 선택 시 전체 데이터가 로드되어야 한다", async () => {
    const user = userEvent.setup();
    const regressedRowIds = [1, 2, 3, PAGE_SIZE + 1, PAGE_SIZE + 2, PAGE_SIZE + 3];
    const TOTAL_REGRESSED = regressedRowIds.length;

    setupRunDetailHandler();
    setupCompareModeHandlers({ regressedRowIds });
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText(`v${COMPARE_TARGET_VERSION}와 비교`));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: `회귀 (${TOTAL_REGRESSED})` })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: `회귀 (${TOTAL_REGRESSED})` }));

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(TOTAL_REGRESSED + 1);
    });
  });

  it("첫 페이지만 로드된 상태에서 비교 모드 진입 시 회귀/개선 카운트가 전체 기준으로 표시되어야 한다", async () => {
    const user = userEvent.setup();
    const regressedRowIds = [1, PAGE_SIZE + 1, PAGE_SIZE + 2, PAGE_SIZE + 3, PAGE_SIZE + 4];
    const TOTAL_REGRESSED = regressedRowIds.length;

    setupRunDetailHandler();
    setupCompareModeHandlers({ regressedRowIds });
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText(`v${COMPARE_TARGET_VERSION}와 비교`));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: `회귀 (${TOTAL_REGRESSED})` })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "개선 (0)" })).toBeInTheDocument();
  });
});

describe("RunDetailPage Live Simulation", () => {
  it("패널을 열기만 하면 re-evaluate를 호출하지 않아야 한다", async () => {
    const user = userEvent.setup();
    let reevaluateCount = 0;

    setupRunDetailHandler();
    setupReevaluateHandler({
      onRequest: () => {
        reevaluateCount++;
      },
    });

    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    await user.click(screen.getByRole("button", { name: "평가 기준 튜닝" }));
    await screen.findByRole("slider");

    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(reevaluateCount).toBe(0);
  });

  it("임계값 변경 시 로드된 row의 status가 갱신되어야 한다", async () => {
    const user = userEvent.setup();
    const reevaluateThresholds: number[] = [];

    setupRunDetailHandler();
    setupReevaluateHandler({
      failingIds: [1],
      onRequest: (body) => {
        reevaluateThresholds.push(body.semanticThreshold as number);
      },
    });

    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    const beforeRow = screen.getByText("입력 1").closest("tr");
    expect(beforeRow).not.toBeNull();
    expect(within(beforeRow as HTMLTableRowElement).getByText("통과")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "평가 기준 튜닝" }));
    const slider = await screen.findByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      const updatedRow = screen.getByText("입력 1").closest("tr");
      expect(updatedRow).not.toBeNull();
      expect(within(updatedRow as HTMLTableRowElement).getByText("유사도")).toBeInTheDocument();
    });

    expect(reevaluateThresholds.some((threshold) => threshold > 0.8)).toBe(true);
  });

  it("임계값 변경 시 탭 카운트가 서버 statusCounts로 갱신되어야 한다", async () => {
    const user = userEvent.setup();

    setupRunDetailHandler();
    setupReevaluateHandler({ failingIds: [1] });

    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: `통과 (${TOTAL_COUNT})` })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "실패 (0)" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "평가 기준 튜닝" }));
    const slider = await screen.findByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: `통과 (${TOTAL_COUNT - 1})` })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "실패 (1)" })).toBeInTheDocument();
    });
  });

  it("임계값 변경 후 스크롤 위치가 유지되어야 한다", async () => {
    const user = userEvent.setup();

    setupRunDetailHandler();
    setupReevaluateHandler({ failingIds: [1] });

    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    const scrollContainer = screen.getByRole("region", { name: /결과 영역/i });

    scrollContainer.scrollTop = 320;
    fireEvent.scroll(scrollContainer);
    const initialScrollTop = scrollContainer.scrollTop;

    await user.click(screen.getByRole("button", { name: "평가 기준 튜닝" }));
    const slider = await screen.findByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      const updatedRow = screen.getByText("입력 1").closest("tr");
      expect(updatedRow).not.toBeNull();
      expect(within(updatedRow as HTMLTableRowElement).getByText("유사도")).toBeInTheDocument();
    });

    const updatedScrollContainer = screen.getByRole("region", { name: /결과 영역/i });
    expect(updatedScrollContainer).toBe(scrollContainer);
    expect(updatedScrollContainer.scrollTop).toBe(initialScrollTop);
  });

  it("임계값 변경 후 스크롤하면 새 기준이 적용된 페이지가 로드되어야 한다", async () => {
    const user = userEvent.setup();

    setupRunDetailHandler();
    setupReevaluateHandler({ failingIds: [1, PAGE_SIZE + 1] });

    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(PAGE_SIZE + 1);
    });

    await user.click(screen.getByRole("button", { name: "평가 기준 튜닝" }));
    const slider = await screen.findByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      const firstRow = screen.getByText("입력 1").closest("tr");
      expect(firstRow).not.toBeNull();
      expect(within(firstRow as HTMLTableRowElement).getByText("유사도")).toBeInTheDocument();
    });

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(TOTAL_COUNT + 1);
    });

    const nextPageFirstRow = screen.getByText(`입력 ${PAGE_SIZE + 1}`).closest("tr");
    expect(nextPageFirstRow).not.toBeNull();
    expect(within(nextPageFirstRow as HTMLTableRowElement).getByText("유사도")).toBeInTheDocument();
  });
});
