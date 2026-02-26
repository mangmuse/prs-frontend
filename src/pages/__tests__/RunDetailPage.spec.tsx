import { MemoryRouter, Route, Routes } from "react-router";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { RunDetailPage } from "@/pages/RunDetailPage/RunDetailPage";
import { RUN_DETAIL_PAGE_SIZE } from "@/queries/runQueries";
import { createMockRunDetail, createMockRunResultRow } from "@/test/factories/run";
import { renderWithClient } from "@/test/utils";

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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const setupPaginatedHandler = () => {
  server.use(
    http.get(`${API}/runs/:id`, ({ request, params }) => {
      if (String(params.id).includes("related")) return;

      const url = new URL(request.url);
      const limit = Number(url.searchParams.get("limit") || 0);
      const cursor = Number(url.searchParams.get("cursor") || 0);

      if (limit) {
        const start = cursor ? allResults.findIndex((r) => r.id === cursor) + 1 : 0;
        const page = allResults.slice(start, start + limit);
        const hasNext = start + limit < allResults.length;

        return HttpResponse.json({
          ...createMockRunDetail({ results: page }),
          nextCursor: hasNext ? page[page.length - 1].id : null,
          totalCount: TOTAL_COUNT,
          statusCounts: { pass: TOTAL_COUNT, format: 0, semantic: 0, constraint: 0 },
        });
      }

      return HttpResponse.json(createMockRunDetail({ results: allResults }));
    }),
    http.get(`${API}/runs/:id/related-versions`, () =>
      HttpResponse.json({ executedRuns: [], unexecutedVersions: [] }),
    ),
  );
};

describe("RunDetailPage 무한스크롤", () => {
  it("첫 로드 시 첫 페이지 결과만 표시되어야 한다", async () => {
    setupPaginatedHandler();
    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(PAGE_SIZE + 1);
  });

  it("테이블 하단에 스크롤하면 다음 페이지가 로드되어야 한다", async () => {
    setupPaginatedHandler();
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
    let fetchCount = 0;
    server.use(
      http.get(`${API}/runs/:id`, ({ request, params }) => {
        if (String(params.id).includes("related")) return;

        fetchCount++;
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") || 0);
        const cursor = Number(url.searchParams.get("cursor") || 0);

        const start = cursor ? allResults.findIndex((r) => r.id === cursor) + 1 : 0;
        const page = allResults.slice(start, start + limit);
        const hasNext = start + limit < allResults.length;

        return HttpResponse.json({
          ...createMockRunDetail({ results: page }),
          nextCursor: hasNext ? page[page.length - 1].id : null,
          totalCount: TOTAL_COUNT,
          statusCounts: { pass: TOTAL_COUNT, format: 0, semantic: 0, constraint: 0 },
        });
      }),
      http.get(`${API}/runs/:id/related-versions`, () =>
        HttpResponse.json({ executedRuns: [], unexecutedVersions: [] }),
      ),
    );

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

    const fetchCountAfterFullLoad = fetchCount;

    intersectionCallback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await new Promise((r) => setTimeout(r, 100));

    expect(fetchCount).toBe(fetchCountAfterFullLoad);
  });

  it("다음 페이지 로딩 중 로딩 인디케이터가 표시되어야 한다", async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API}/runs/:id`, async ({ request, params }) => {
        if (String(params.id).includes("related")) return;

        requestCount++;
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") || 0);
        const cursor = Number(url.searchParams.get("cursor") || 0);

        const start = cursor ? allResults.findIndex((r) => r.id === cursor) + 1 : 0;
        const page = allResults.slice(start, start + limit);
        const hasNext = start + limit < allResults.length;

        if (requestCount > 1) {
          await delay(200);
        }

        return HttpResponse.json({
          ...createMockRunDetail({ results: page }),
          nextCursor: hasNext ? page[page.length - 1].id : null,
          totalCount: TOTAL_COUNT,
          statusCounts: { pass: TOTAL_COUNT, format: 0, semantic: 0, constraint: 0 },
        });
      }),
      http.get(`${API}/runs/:id/related-versions`, () =>
        HttpResponse.json({ executedRuns: [], unexecutedVersions: [] }),
      ),
    );

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

    server.use(
      http.get(`${API}/runs/:id`, ({ request, params }) => {
        if (String(params.id).includes("related")) return;

        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") || 0);
        const cursor = Number(url.searchParams.get("cursor") || 0);

        if (limit) {
          const start = cursor ? allResults.findIndex((r) => r.id === cursor) + 1 : 0;
          const page = allResults.slice(start, start + limit);
          const hasNext = start + limit < allResults.length;

          return HttpResponse.json({
            ...createMockRunDetail({ results: page }),
            nextCursor: hasNext ? page[page.length - 1].id : null,
            totalCount: TOTAL_COUNT,
            statusCounts: {
              pass: PASS_COUNT,
              format: 10,
              semantic: 10,
              constraint: 5,
            },
          });
        }

        return HttpResponse.json(createMockRunDetail({ results: allResults }));
      }),
      http.get(`${API}/runs/:id/related-versions`, () =>
        HttpResponse.json({ executedRuns: [], unexecutedVersions: [] }),
      ),
    );

    renderRunDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: `전체 (${TOTAL_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `통과 (${PASS_COUNT})` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `실패 (${FAIL_COUNT})` })).toBeInTheDocument();
  });

  it("결과가 0건이면 모든 탭 카운트가 0으로 표시되어야 한다", async () => {
    server.use(
      http.get(`${API}/runs/:id`, ({ params }) => {
        if (String(params.id).includes("related")) return;

        return HttpResponse.json({
          ...createMockRunDetail({ results: [] }),
          nextCursor: null,
          totalCount: 0,
          statusCounts: { pass: 0, format: 0, semantic: 0, constraint: 0 },
        });
      }),
      http.get(`${API}/runs/:id/related-versions`, () =>
        HttpResponse.json({ executedRuns: [], unexecutedVersions: [] }),
      ),
    );

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
    server.use(
      http.get(`${API}/runs/:id`, ({ request, params }) => {
        if (String(params.id).includes("related")) return;

        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") || 0);
        const cursor = Number(url.searchParams.get("cursor") || 0);
        const statusParam = url.searchParams.get("status");

        let filtered = mixedResults;
        if (statusParam === "pass") {
          filtered = mixedResults.filter((r) => r.status === "pass");
        } else if (statusParam === "fail") {
          filtered = mixedResults.filter((r) => r.status !== "pass");
        }

        if (limit) {
          const start = cursor ? filtered.findIndex((r) => r.id === cursor) + 1 : 0;
          const page = filtered.slice(start, start + limit);
          const hasNext = start + limit < filtered.length;

          return HttpResponse.json({
            ...createMockRunDetail({ results: page }),
            nextCursor: hasNext ? page[page.length - 1].id : null,
            totalCount: TOTAL_COUNT,
            statusCounts: {
              pass: PASS_COUNT,
              format: FAIL_COUNT,
              semantic: 0,
              constraint: 0,
            },
          });
        }

        return HttpResponse.json(createMockRunDetail({ results: filtered }));
      }),
      http.get(`${API}/runs/:id/related-versions`, () =>
        HttpResponse.json({ executedRuns: [], unexecutedVersions: [] }),
      ),
    );
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
