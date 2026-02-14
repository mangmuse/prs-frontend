import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { PromptList } from "../PromptList";

const API = "http://localhost:8000";

const mockPrompts = [
  {
    id: 1,
    name: "팩트체크 판정기",
    description: null,
    latestVersion: 3,
    versionCount: 3,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("PromptList - 삭제", () => {
  it("Prompt 삭제 버튼 클릭 시 확인 모달이 표시되고 확인하면 삭제되어야 한다", async () => {
    let deleteCalled = false;
    server.use(
      http.get(`${API}/prompts`, () => HttpResponse.json(mockPrompts)),
      http.delete(`${API}/prompts/1`, () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<PromptList selectedId={null} onSelect={vi.fn()} onCreateNew={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("팩트체크 판정기")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(screen.getByText("프롬프트를 삭제하시겠습니까?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
    });

    await waitFor(() => {
      expect(screen.queryByText("프롬프트를 삭제하시겠습니까?")).not.toBeInTheDocument();
    });
  });
});
