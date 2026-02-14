import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithClient } from "@/test/utils";

import { CreateProfileModal } from "../CreateProfileModal";

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
});
