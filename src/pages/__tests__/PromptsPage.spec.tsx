import { MemoryRouter } from "react-router";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { PromptsPage } from "@/pages/PromptsPage";
import {
  createMockPrompt,
  createMockVersion,
  createMockVersionDetail,
} from "@/test/factories/prompt";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

const mockPrompts = [createMockPrompt({ name: "팩트체크 프롬프트", description: "사실 검증용" })];

const mockVersions = [createMockVersion()];

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

  it("프롬프트 선택 시 상세 정보가 표시되어야 한다", async () => {
    server.use(
      http.get(`${API}/prompts`, () => HttpResponse.json(mockPrompts)),
      http.get(`${API}/prompts/1/versions`, () => HttpResponse.json(mockVersions)),
      http.get(`${API}/prompts/1/versions/1`, () => HttpResponse.json(createMockVersionDetail())),
    );
    const user = userEvent.setup();

    renderPromptsPage();

    await user.click(await screen.findByText("팩트체크 프롬프트"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /새 버전/ })).toBeInTheDocument();
    });
  });

  it("프롬프트 미선택 시 안내 메시지가 표시되어야 한다", async () => {
    server.use(http.get(`${API}/prompts`, () => HttpResponse.json(mockPrompts)));

    renderPromptsPage();

    await waitFor(() => {
      expect(screen.getByText(/프롬프트를 선택하세요/)).toBeInTheDocument();
    });
  });
});
