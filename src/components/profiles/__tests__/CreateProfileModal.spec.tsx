import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { CreateProfileModal } from "../CreateProfileModal";

const API = "http://localhost:8000";

describe("CreateProfileModal", () => {
  it("제약조건 타입을 변경하면 이전 타입의 필드 값이 초기화되어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(
      <CreateProfileModal state={{ open: true, mode: "create" }} onClose={() => {}} />,
    );

    await user.click(screen.getByRole("button", { name: "제약조건 추가" }));

    const valueInput = screen.getByPlaceholderText("값");
    await user.type(valueInput, "기존 값");
    expect(valueInput).toHaveValue("기존 값");

    const typeSelectTrigger = screen.getByRole("combobox");

    await user.click(typeSelectTrigger);
    await user.click(await screen.findByRole("option", { name: "정규식" }));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("값")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "포함" }));

    const resetValueInput = await screen.findByPlaceholderText("값");
    expect(resetValueInput).toHaveValue("");
  });

  it("제약조건 타입 변경 후 새 타입의 기본값이 설정되어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(
      <CreateProfileModal state={{ open: true, mode: "create" }} onClose={() => {}} />,
    );

    await user.click(screen.getByRole("button", { name: "제약조건 추가" }));

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "최대 길이" }));

    const maxInput = await screen.findByPlaceholderText("최대 길이");
    expect(maxInput).toHaveValue(100);
  });

  it("Profile 생성 후 해당 프로필이 자동 선택되어야 한다", async () => {
    const onCreated = vi.fn();
    server.use(
      http.post(`${API}/evaluator-profiles`, () =>
        HttpResponse.json({
          id: 15,
          name: "새 프로필",
          description: null,
          semanticThreshold: 0.85,
          globalConstraints: [],
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(
      <CreateProfileModal
        state={{ open: true, mode: "create" }}
        onClose={() => {}}
        onCreated={onCreated}
      />,
    );

    await user.type(screen.getByPlaceholderText("예: 엄격한 평가, 관대한 평가"), "새 프로필");
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(15);
    });
  });
});
