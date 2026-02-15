import { MemoryRouter } from "react-router";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { RunsPage } from "@/pages/RunsPage";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

const mockRuns = [
  {
    id: 1,
    promptId: 1,
    promptVersionId: 1,
    promptName: "팩트체크",
    versionNumber: 1,
    datasetId: 1,
    datasetName: "테스트셋",
    profileId: 1,
    profileName: "기본 프로필",
    status: "completed",
    passRate: 0.85,
    avgSemantic: 0.9,
    formatPassRate: 1.0,
    semanticPassRate: 0.9,
    constraintPassRate: 0.85,
    totalRows: 10,
    createdAt: "2026-01-01",
  },
];

const renderRunsPage = () =>
  renderWithClient(
    <MemoryRouter>
      <RunsPage />
    </MemoryRouter>,
  );

describe("RunsPage", () => {
  it("Run이 없을 때 빈 상태 안내와 CTA 버튼을 표시해야 한다", async () => {
    server.use(http.get(`${API}/runs`, () => HttpResponse.json([])));

    renderRunsPage();

    expect(await screen.findByText("실행 기록이 없습니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "첫 실행 시작하기" })).toBeInTheDocument();
  });

  it("CTA 버튼 클릭 시 실행 생성 모달이 열려야 한다", async () => {
    server.use(http.get(`${API}/runs`, () => HttpResponse.json([])));
    const user = userEvent.setup();

    renderRunsPage();

    const ctaButton = await screen.findByRole("button", { name: "첫 실행 시작하기" });
    await user.click(ctaButton);

    expect(await screen.findByRole("heading", { name: "새 실행" })).toBeInTheDocument();
  });

  it("실행 기록이 있으면 테이블이 표시되어야 한다", async () => {
    server.use(http.get(`${API}/runs`, () => HttpResponse.json(mockRuns)));

    renderRunsPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
    expect(screen.getByText(/팩트체크/)).toBeInTheDocument();
  });
});
