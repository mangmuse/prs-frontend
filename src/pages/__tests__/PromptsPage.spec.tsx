import { MemoryRouter } from "react-router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { PromptsPage } from "@/pages/PromptsPage";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

const renderPromptsPage = () =>
  renderWithClient(
    <MemoryRouter>
      <PromptsPage />
    </MemoryRouter>,
  );

describe("PromptsPage", () => {
  it("Prompts 빈 상태에서 '프롬프트 만들기' 버튼이 동작해야 한다", async () => {
    server.use(http.get(`${API}/prompts`, () => HttpResponse.json([])));
    const user = userEvent.setup();

    renderPromptsPage();

    const ctaButton = await screen.findByRole("button", { name: "프롬프트 만들기" });
    await user.click(ctaButton);

    expect(await screen.findByText("새 프롬프트 생성")).toBeInTheDocument();
  });
});
