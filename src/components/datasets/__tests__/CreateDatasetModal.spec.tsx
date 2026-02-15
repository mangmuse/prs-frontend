import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { CreateDatasetModal } from "../CreateDatasetModal";

const API = "http://localhost:8000";

describe("CreateDatasetModal", () => {
  it("Dataset 생성 후 해당 데이터셋이 자동 선택되어야 한다", async () => {
    const onCreated = vi.fn();
    server.use(
      http.post(`${API}/datasets`, () =>
        HttpResponse.json({ id: 7, name: "새 데이터셋", createdAt: "2026-01-01T00:00:00Z" }),
      ),
      http.post(`${API}/datasets/7/rows`, () => HttpResponse.json([])),
    );

    const user = userEvent.setup();
    renderWithClient(
      <CreateDatasetModal open={true} onOpenChange={() => {}} onCreated={onCreated} />,
    );

    await user.type(screen.getByPlaceholderText("데이터셋 이름"), "새 데이터셋");

    const valueField = screen.getAllByPlaceholderText("value")[0];
    await user.type(valueField, "테스트 입력");

    const expectedField = screen.getAllByPlaceholderText("기대값")[0];
    await user.type(expectedField, "TRUE");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(7);
    });
  });
});
