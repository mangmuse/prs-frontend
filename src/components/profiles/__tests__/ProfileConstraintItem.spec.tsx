import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithClient } from "@/test/utils";

import { CreateProfileModal } from "../CreateProfileModal";

const defaultProps = {
  state: { open: true, mode: "create" as const },
  onClose: vi.fn(),
  onCreated: vi.fn(),
};

describe("ProfileConstraintItem", () => {
  it("제약조건 타입과 값이 표시되어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateProfileModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "제약조건 추가" }));

    expect(screen.getByPlaceholderText("대상 필드 (예: verdict)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("값")).toBeInTheDocument();
  });

  it("삭제 버튼 클릭 시 제약조건이 제거되어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateProfileModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "제약조건 추가" }));
    expect(screen.queryByText(/제약조건이 없습니다/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "제약조건 삭제" }));

    await waitFor(() => {
      expect(screen.getByText(/제약조건이 없습니다/)).toBeInTheDocument();
    });
  });

  it("타입 변경 시 기본값으로 초기화되어야 한다", async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateProfileModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "제약조건 추가" }));

    await user.type(screen.getByPlaceholderText("값"), "test-value");
    expect(screen.getByPlaceholderText("값")).toHaveValue("test-value");

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "범위" }));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("값")).not.toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("min")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("max")).toBeInTheDocument();
  });

  it("유효하지 않은 값 입력 시 에러가 표시되어야 한다", async () => {
    const onCreated = vi.fn();
    const user = userEvent.setup();
    renderWithClient(
      <CreateProfileModal
        state={{ open: true, mode: "create" }}
        onClose={vi.fn()}
        onCreated={onCreated}
      />,
    );

    await user.type(screen.getByPlaceholderText("예: 엄격한 평가, 관대한 평가"), "테스트 프로필");
    await user.click(screen.getByRole("button", { name: "제약조건 추가" }));

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    });
    expect(onCreated).not.toHaveBeenCalled();
  });
});
