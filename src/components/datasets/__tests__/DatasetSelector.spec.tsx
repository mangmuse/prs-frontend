import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { createMockDataset } from "@/test/factories/dataset";
import { renderWithClient } from "@/test/utils";

import { DatasetSelector } from "../DatasetSelector";

const API = "http://localhost:8000";

const mockDatasets = [
  createMockDataset({ name: "감성 분석", rowCount: 120 }),
  createMockDataset({ id: 2, name: "팩트체크", rowCount: 45, createdAt: "2026-01-02" }),
];

describe("DatasetSelector", () => {
  it("데이터셋 목록이 드롭다운에 표시되어야 한다", async () => {
    server.use(http.get(`${API}/datasets`, () => HttpResponse.json(mockDatasets)));
    const user = userEvent.setup();
    renderWithClient(<DatasetSelector selectedId={null} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /데이터셋 선택/ })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /데이터셋 선택/ }));

    expect(await screen.findByRole("menuitem", { name: /감성 분석/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /팩트체크/ })).toBeInTheDocument();
  });

  it("데이터셋 선택 시 콜백이 호출되어야 한다", async () => {
    server.use(http.get(`${API}/datasets`, () => HttpResponse.json(mockDatasets)));
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderWithClient(<DatasetSelector selectedId={null} onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /데이터셋 선택/ })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /데이터셋 선택/ }));
    await user.click(await screen.findByRole("menuitem", { name: /팩트체크/ }));

    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("데이터셋이 없으면 빈 상태가 표시되어야 한다", async () => {
    server.use(http.get(`${API}/datasets`, () => HttpResponse.json([])));
    renderWithClient(<DatasetSelector selectedId={null} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/데이터셋을 생성하세요/)).toBeInTheDocument();
    });
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("데이터셋 목록 로딩 실패 시 에러 상태가 표시되어야 한다", async () => {
    server.use(http.get(`${API}/datasets`, () => HttpResponse.error()));
    renderWithClient(<DatasetSelector selectedId={null} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/데이터셋을 생성하세요/)).toBeInTheDocument();
    });
  });
});
