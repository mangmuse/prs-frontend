import { MemoryRouter } from "react-router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { RunsPage } from "@/pages/RunsPage";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

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
});
