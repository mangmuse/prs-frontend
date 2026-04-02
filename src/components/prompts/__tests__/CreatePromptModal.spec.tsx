import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { CreatePromptModal } from "../CreatePromptModal";

const API = "http://localhost:8000";

const mockModels = {
  models: [
    { id: "gpt-4o", displayName: "GPT-4o", provider: "openai" },
    { id: "claude-3-5-sonnet", displayName: "Claude 3.5 Sonnet", provider: "anthropic" },
  ],
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onCreated: vi.fn(),
};

describe("CreatePromptModal", () => {
  beforeEach(() => {
    defaultProps.onClose = vi.fn();
    defaultProps.onCreated = vi.fn();
    server.use(http.get(`${API}/llm/models`, () => HttpResponse.json(mockModels)));
  });

  it("프롬프트 이름과 버전 설정 필드가 모두 표시되어야 한다", () => {
    renderWithClient(<CreatePromptModal {...defaultProps} />);

    expect(screen.getByLabelText("프롬프트 이름")).toBeInTheDocument();
    expect(screen.getByText("모델")).toBeInTheDocument();
    expect(screen.getByText(/Temperature/)).toBeInTheDocument();
    expect(screen.getByText(/출력 형식/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("시스템 지시사항을 입력하세요...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/사용자 템플릿을 입력하세요/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("이 버전의 변경사항")).toBeInTheDocument();
  });

  it("프롬프트와 첫 번째 버전이 함께 생성되어야 한다", async () => {
    server.use(
      http.post(`${API}/prompts`, () =>
        HttpResponse.json({ id: 42, name: "감정 분석", createdAt: "2026-01-01T00:00:00Z" }),
      ),
      http.post(`${API}/prompts/42/versions`, () => HttpResponse.json({ id: 1, model: "gpt-4o" })),
    );

    const user = userEvent.setup();
    renderWithClient(<CreatePromptModal {...defaultProps} />);

    await user.type(screen.getByLabelText("프롬프트 이름"), "감정 분석");

    await waitFor(() => {
      expect(screen.getByText(/모델을 선택하세요/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: "모델" }));
    await user.click(screen.getByRole("option", { name: "GPT-4o" }));
    await user.type(screen.getByPlaceholderText(/사용자 템플릿을 입력하세요/), "{{input}}");

    await user.click(screen.getByRole("button", { name: "생성" }));

    await waitFor(() => {
      expect(defaultProps.onCreated).toHaveBeenCalledWith(42);
    });
  });

  it("프롬프트 생성 실패 시 에러 토스트가 표시되어야 한다", async () => {
    const toastSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    server.use(
      http.post(`${API}/prompts`, () =>
        HttpResponse.json({ detail: "서버 에러" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<CreatePromptModal {...defaultProps} />);

    await user.type(screen.getByLabelText("프롬프트 이름"), "실패 테스트");

    await waitFor(() => {
      expect(screen.getByText(/모델을 선택하세요/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: "모델" }));
    await user.click(screen.getByRole("option", { name: "GPT-4o" }));
    await user.type(screen.getByPlaceholderText(/사용자 템플릿을 입력하세요/), "{{input}}");

    await user.click(screen.getByRole("button", { name: "생성" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining("실패"));
    });
    toastSpy.mockRestore();
  });

  it("버전 생성 실패 시 프롬프트는 선택되고 에러 토스트가 표시되어야 한다", async () => {
    const toastSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    server.use(
      http.post(`${API}/prompts`, () =>
        HttpResponse.json({ id: 42, name: "테스트", createdAt: "2026-01-01T00:00:00Z" }),
      ),
      http.post(`${API}/prompts/42/versions`, () =>
        HttpResponse.json({ detail: "서버 에러" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<CreatePromptModal {...defaultProps} />);

    await user.type(screen.getByLabelText("프롬프트 이름"), "테스트");

    await waitFor(() => {
      expect(screen.getByText(/모델을 선택하세요/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: "모델" }));
    await user.click(screen.getByRole("option", { name: "GPT-4o" }));
    await user.type(screen.getByPlaceholderText(/사용자 템플릿을 입력하세요/), "{{input}}");

    await user.click(screen.getByRole("button", { name: "생성" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining("버전"));
    });
    expect(defaultProps.onCreated).toHaveBeenCalledWith(42);
    toastSpy.mockRestore();
  });
});
