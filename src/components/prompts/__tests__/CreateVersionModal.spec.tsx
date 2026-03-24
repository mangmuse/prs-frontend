import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { CreateVersionModal } from "../CreateVersionModal";

const API = "http://localhost:8000";

const mockModels = {
  models: [
    { id: "gpt-4o", displayName: "GPT-4o", provider: "openai" },
    { id: "claude-3-5-sonnet", displayName: "Claude 3.5 Sonnet", provider: "anthropic" },
  ],
};

const defaultProps = {
  open: true,
  promptId: 1,
  onClose: vi.fn(),
};

const prefillData = {
  model: "gpt-4o",
  temperature: 0.7,
  outputSchema: "JSON Array" as const,
  systemInstruction: "You are a helpful assistant.",
  userTemplate: "Analyze the following: {{input}}",
};

describe("CreateVersionModal", () => {
  beforeEach(() => {
    defaultProps.onClose = vi.fn();
    server.use(http.get(`${API}/llm/models`, () => HttpResponse.json(mockModels)));
  });

  describe("prefill", () => {
    it("prefill 데이터가 주어지면 모델, 온도, 출력형식, 지시문, 템플릿이 채워진 상태로 렌더링 되어야한다", async () => {
      renderWithClient(<CreateVersionModal {...defaultProps} prefillData={prefillData} />);

      await waitFor(() => {
        expect(screen.getAllByText("GPT-4o").length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getByText(/Temperature \(0.7\)/)).toBeInTheDocument();
      expect(screen.getAllByText("JSON Array").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByDisplayValue("You are a helpful assistant.")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Analyze the following: {{input}}")).toBeInTheDocument();
    });

    it("prefill 데이터가 주어져도 메모 필드는 비어있어야한다", () => {
      renderWithClient(<CreateVersionModal {...defaultProps} prefillData={prefillData} />);

      expect(screen.getByPlaceholderText("이 버전의 변경사항")).toHaveValue("");
    });

    it("prefill 데이터가 없으면 기본값으로 렌더링 되어야한다", () => {
      renderWithClient(<CreateVersionModal {...defaultProps} />);

      expect(screen.getByText("모델을 선택하세요")).toBeInTheDocument();
      expect(screen.getByText(/Temperature \(1\)/)).toBeInTheDocument();
      expect(screen.getAllByText("JSON Object").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByPlaceholderText("시스템 지시사항을 입력하세요...")).toHaveValue("");
      expect(screen.getByPlaceholderText(/사용자 템플릿을 입력하세요/)).toHaveValue("");
      expect(screen.getByPlaceholderText("이 버전의 변경사항")).toHaveValue("");
    });
  });

  it("모달이 열리면 폼 필드들이 표시되어야 한다", () => {
    renderWithClient(<CreateVersionModal {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /새 버전 생성/ })).toBeInTheDocument();
    expect(screen.getByText("모델")).toBeInTheDocument();
    expect(screen.getByText(/Temperature/)).toBeInTheDocument();
    expect(screen.getByText(/출력 형식/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("시스템 지시사항을 입력하세요...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/사용자 템플릿을 입력하세요/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("이 버전의 변경사항")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("필수 필드 미입력 시 저장 버튼이 비활성화되어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateVersionModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(screen.getByText(/모델을 선택해주세요/)).toBeInTheDocument();
    });
  });

  it("유효한 데이터 입력 후 저장하면 모달이 닫혀야 한다", async () => {
    server.use(
      http.post(`${API}/prompts/:promptId/versions`, () =>
        HttpResponse.json({ id: 1, model: "gpt-4o" }),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<CreateVersionModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/모델을 선택하세요/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: "모델" }));
    await user.click(screen.getByRole("option", { name: "GPT-4o" }));

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("저장 실패 시 에러 토스트가 표시되어야 한다", async () => {
    const toastSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    server.use(
      http.get(`${API}/llm/models`, () => HttpResponse.json(mockModels)),
      http.post(`${API}/prompts/:promptId/versions`, () =>
        HttpResponse.json({ detail: "서버 에러" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<CreateVersionModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/모델을 선택하세요/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: "모델" }));
    await user.click(screen.getByRole("option", { name: "GPT-4o" }));

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });
    toastSpy.mockRestore();
  });

  it("모델 목록 로딩 실패 시 에러 상태가 표시되어야 한다", async () => {
    server.use(http.get(`${API}/llm/models`, () => HttpResponse.error()));
    renderWithClient(<CreateVersionModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/모델을 선택하세요/)).toBeInTheDocument();
    });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
