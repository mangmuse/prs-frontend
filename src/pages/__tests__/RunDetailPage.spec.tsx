import { MemoryRouter, Route, Routes } from "react-router";

import { screen, waitFor } from "@testing-library/react";
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
