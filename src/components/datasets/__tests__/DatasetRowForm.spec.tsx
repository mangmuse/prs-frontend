import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { DatasetRowForm } from "../DatasetRowForm";

const API = "http://localhost:8000";

const defaultProps = {
  datasetId: 1,
  open: true,
  onOpenChange: vi.fn(),
};

const editingRow = {
  id: 10,
  datasetId: 1,
  inputData: { claim: "지구는 둥글다", source: "NASA" },
  expectedOutput: "TRUE",
  tags: ["science", "fact"],
};

describe("DatasetRowForm", () => {
  beforeEach(() => {
    defaultProps.onOpenChange = vi.fn();
    server.use(http.get(`${API}/prompts`, () => HttpResponse.json([])));
  });

  it("추가 모드에서 '추가' 버튼이 표시되어야 한다", () => {
    renderWithClient(<DatasetRowForm {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /새 행 추가/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
  });

  it("편집 모드에서 기존 데이터로 폼이 초기화되어야 한다", async () => {
    renderWithClient(<DatasetRowForm {...defaultProps} editingRow={editingRow} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /행 수정/ })).toBeInTheDocument();
    });

    const keyInputs = screen.getAllByPlaceholderText("key");
    const valueInputs = screen.getAllByPlaceholderText("value");

    expect(keyInputs[0]).toHaveValue("claim");
    expect(valueInputs[0]).toHaveValue("지구는 둥글다");
    expect(keyInputs[1]).toHaveValue("source");
    expect(valueInputs[1]).toHaveValue("NASA");
    expect(screen.getByLabelText(/Expected Output/)).toHaveValue("TRUE");
  });

  it("inputFields가 최소 1개 필수여야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<DatasetRowForm {...defaultProps} />);

    const keyInputs = screen.getAllByPlaceholderText("key");
    expect(keyInputs).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "필드 추가" }));
    expect(screen.getAllByPlaceholderText("key")).toHaveLength(2);
  });

  it("expectedOutput 미입력 시 제출할 수 없어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<DatasetRowForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() => {
      expect(screen.getByText(/Expected output은 필수입니다/)).toBeInTheDocument();
    });
  });

  it("빈 key로 inputField를 제출할 수 없어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<DatasetRowForm {...defaultProps} />);

    const keyInput = screen.getByPlaceholderText("key");
    await user.clear(keyInput);

    await user.type(screen.getByLabelText(/Expected Output/), "TRUE");
    await user.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() => {
      expect(screen.getByText(/키는 필수입니다/)).toBeInTheDocument();
    });
  });

  it("행 추가 실패 시 에러 토스트가 표시되어야 한다", async () => {
    const toastSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    server.use(
      http.post(`${API}/datasets/:id/rows`, () =>
        HttpResponse.json({ detail: "에러" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<DatasetRowForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/Expected Output/), "TRUE");
    await user.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });
    toastSpy.mockRestore();
  });

  it("행 수정 실패 시 에러 토스트가 표시되어야 한다", async () => {
    const toastSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    server.use(
      http.put(`${API}/datasets/:id/rows/:rowId`, () =>
        HttpResponse.json({ detail: "에러" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<DatasetRowForm {...defaultProps} editingRow={editingRow} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /행 수정/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });
    toastSpy.mockRestore();
  });
});
