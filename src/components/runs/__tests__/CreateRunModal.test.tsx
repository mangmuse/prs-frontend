import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { CreateRunModal } from "../CreateRunModal";

const API = "http://localhost:8000";

const renderModal = () => renderWithClient(<CreateRunModal open={true} onOpenChange={() => {}} />);

const mockPrompts = [
  {
    id: 1,
    name: "테스트 프롬프트",
    description: null,
    latestVersion: 1,
    versionCount: 1,
    createdAt: "2026-01-01",
  },
];
const mockVersions = [
  {
    id: 10,
    versionNumber: 1,
    model: "openai/gpt-4o",
    memo: null,
    userTemplate: "{{input}}",
    createdAt: "2026-01-01",
  },
];
const mockProfiles = [
  {
    id: 1,
    name: "기본 프로필",
    description: null,
    semanticThreshold: 0.85,
    constraintCount: 0,
    createdAt: "2026-01-01",
  },
];

const setupHandlers = (datasets: { id: number; name: string; rowCount: number }[]) => {
  server.use(
    http.get(`${API}/prompts`, () => HttpResponse.json(mockPrompts)),
    http.get(`${API}/prompts/:promptId/versions`, () => HttpResponse.json(mockVersions)),
    http.get(`${API}/datasets`, () =>
      HttpResponse.json(
        datasets.map((d) => ({ ...d, description: null, createdAt: "2026-01-01" })),
      ),
    ),
    http.get(`${API}/evaluator-profiles`, () => HttpResponse.json(mockProfiles)),
  );
};

describe("CreateRunModal", () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it("빈 데이터셋 선택 시 실행 버튼이 비활성화되고 안내 메시지를 표시해야 한다", async () => {
    setupHandlers([{ id: 1, name: "빈 데이터셋", rowCount: 0 }]);
    renderModal();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("새 실행")).toBeInTheDocument();
    });

    const triggers = screen.getAllByRole("combobox");
    const promptTrigger = triggers[0];
    const datasetTrigger = triggers[2];
    const profileTrigger = triggers[3];

    await user.click(promptTrigger);
    await user.click(await screen.findByRole("option", { name: "테스트 프롬프트" }));

    await user.click(datasetTrigger);
    await user.click(await screen.findByRole("option", { name: "빈 데이터셋" }));

    await user.click(profileTrigger);
    await user.click(await screen.findByRole("option", { name: "기본 프로필" }));

    expect(screen.getByText(/데이터셋이 비어 있습니다/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "실행" })).toBeDisabled();
  });

  it("API Key 미설정 시 안내 메시지를 표시해야 한다", async () => {
    setupHandlers([{ id: 1, name: "정상 데이터셋", rowCount: 5 }]);
    renderModal();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("새 실행")).toBeInTheDocument();
    });

    const triggers = screen.getAllByRole("combobox");

    await user.click(triggers[0]);
    await user.click(await screen.findByRole("option", { name: "테스트 프롬프트" }));

    expect(await screen.findByText(/API Key가 설정되지 않았습니다/)).toBeInTheDocument();
  });
});
