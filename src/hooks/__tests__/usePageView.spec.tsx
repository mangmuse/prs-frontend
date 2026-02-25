import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePageView } from "../usePageView";

const mockSendPageView = vi.fn();

vi.mock("@/utils/gtag", () => ({
  sendPageView: (...args: unknown[]): void => {
    mockSendPageView(...args);
  },
}));

const createWrapper =
  (initialEntries: string[]) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

describe("usePageView", () => {
  it("마운트 시 현재 경로로 페이지뷰를 전송해야 한다", () => {
    mockSendPageView.mockClear();

    renderHook(() => usePageView(), {
      wrapper: createWrapper(["/prompts"]),
    });

    expect(mockSendPageView).toHaveBeenCalledWith("/prompts");
  });

  it("쿼리 파라미터가 있으면 경로에 포함하여 전송해야 한다", () => {
    mockSendPageView.mockClear();

    renderHook(() => usePageView(), {
      wrapper: createWrapper(["/runs?status=completed"]),
    });

    expect(mockSendPageView).toHaveBeenCalledWith("/runs?status=completed");
  });
});
