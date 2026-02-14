import { MemoryRouter } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

import { RunsTable } from "../RunsTable";

const API = "http://localhost:8000";

const mockRuns = [
  {
    id: 1,
    promptId: 1,
    promptVersionId: 1,
    promptName: "팩트체크",
    versionNumber: 1,
    datasetId: 1,
    datasetName: "상식 데이터",
    profileId: 1,
    profileName: "기본 프로필",
    status: "completed",
    passRate: 0.8,
    avgSemantic: 0.85,
    formatPassRate: 1.0,
    semanticPassRate: 0.85,
    constraintPassRate: 0.9,
    totalRows: 10,
    createdAt: new Date().toISOString(),
  },
];

describe("RunsTable - Run 삭제", () => {
  it("Run 삭제 버튼 클릭 시 확인 모달이 표시되고 확인하면 삭제되어야 한다", async () => {
    let deleteCalled = false;
    server.use(
      http.delete(`${API}/runs/1`, () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RunsTable runs={mockRuns} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(screen.getByText("실행 기록을 삭제하시겠습니까?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
    });

    await waitFor(() => {
      expect(screen.queryByText("실행 기록을 삭제하시겠습니까?")).not.toBeInTheDocument();
    });
  });
});
