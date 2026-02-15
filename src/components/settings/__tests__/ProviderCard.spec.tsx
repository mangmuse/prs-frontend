import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { useApiKeyStore } from "@/stores/apiKeyStore";
import { renderWithClient } from "@/test/utils";

import { ProviderCard } from "../ProviderCard";

const API = "http://localhost:8000";

const openaiProvider = {
  id: "openai" as const,
  name: "OpenAI",
  placeholder: "sk-...",
};

describe("ProviderCard - 초기 상태", () => {
  beforeEach(() => {
    useApiKeyStore.setState({ keys: {} });
  });

  it("키가 없으면 입력 필드와 검증 버튼이 표시되어야 한다", () => {
    renderWithClient(<ProviderCard provider={openaiProvider} />);

    expect(screen.getByPlaceholderText("sk-...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "검증" })).toBeInTheDocument();
    expect(screen.getByText("미설정")).toBeInTheDocument();
  });

  it("입력값이 없으면 검증 버튼이 비활성화되어야 한다", () => {
    renderWithClient(<ProviderCard provider={openaiProvider} />);

    expect(screen.getByRole("button", { name: "검증" })).toBeDisabled();
  });
});

describe("ProviderCard - API 키 검증", () => {
  beforeEach(() => {
    useApiKeyStore.setState({ keys: {} });
  });

  it("검증 성공 시 마스킹된 키와 삭제 버튼이 표시되어야 한다", async () => {
    server.use(http.post(`${API}/llm/verify-key`, () => HttpResponse.json({ valid: true })));
    const user = userEvent.setup();
    renderWithClient(<ProviderCard provider={openaiProvider} />);

    await user.type(screen.getByPlaceholderText("sk-..."), "sk-valid-key");
    await user.click(screen.getByRole("button", { name: "검증" }));

    await waitFor(() => {
      expect(screen.getByText("연결됨")).toBeInTheDocument();
    });
    expect(screen.getByText("••••••••••••••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OpenAI 키 삭제" })).toBeInTheDocument();
  });

  it("검증 실패 시 에러 메시지가 표시되어야 한다", async () => {
    server.use(
      http.post(`${API}/llm/verify-key`, () =>
        HttpResponse.json({ valid: false, error: "Invalid API key" }),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<ProviderCard provider={openaiProvider} />);

    await user.type(screen.getByPlaceholderText("sk-..."), "sk-invalid");
    await user.click(screen.getByRole("button", { name: "검증" }));

    await waitFor(() => {
      expect(screen.getByText("오류")).toBeInTheDocument();
    });
    expect(screen.getByText("Invalid API key")).toBeInTheDocument();
  });

  it("네트워크 에러 시 안내 메시지가 표시되어야 한다", async () => {
    server.use(http.post(`${API}/llm/verify-key`, () => HttpResponse.error()));
    const user = userEvent.setup();
    renderWithClient(<ProviderCard provider={openaiProvider} />);

    await user.type(screen.getByPlaceholderText("sk-..."), "sk-test");
    await user.click(screen.getByRole("button", { name: "검증" }));

    await waitFor(() => {
      expect(screen.getByText("검증 요청에 실패했습니다. 다시 시도해주세요.")).toBeInTheDocument();
    });
  });
});

describe("ProviderCard - 키 삭제", () => {
  beforeEach(() => {
    useApiKeyStore.setState({ keys: { openai: "sk-saved-key" } });
  });

  it("삭제 버튼 클릭 시 입력 필드로 돌아가야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<ProviderCard provider={openaiProvider} />);

    expect(screen.getByText("연결됨")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "OpenAI 키 삭제" }));

    expect(screen.getByText("미설정")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("sk-...")).toBeInTheDocument();
  });
});
