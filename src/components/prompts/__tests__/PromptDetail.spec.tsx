import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { PromptDetail } from "../PromptDetail";

const API = "http://localhost:8000";

const mockVersions = [
  {
    id: 10,
    versionNumber: 1,
    model: "gpt-4",
    memo: null,
    userTemplate: "{{input}}",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const mockVersionDetail = {
  id: 10,
  promptId: 1,
  versionNumber: 1,
  systemInstruction: "테스트 시스템 지시문",
  userTemplate: "{{input}}",
  model: "gpt-4",
  temperature: 0.5,
  outputSchema: "Freeform",
  memo: null,
  createdAt: "2026-01-01T00:00:00Z",
};

const defaultProps = {
  promptId: 1,
  promptName: "팩트체크 판정기",
  promptDescription: "테스트 설명",
  onCreateVersion: vi.fn(),
  onDelete: vi.fn(),
};

const setupVersionMocks = () => {
  server.use(
    http.get(`${API}/prompts/1/versions`, () => HttpResponse.json(mockVersions)),
    http.get(`${API}/prompts/1/versions/10`, () => HttpResponse.json(mockVersionDetail)),
  );
};

describe("PromptDetail - 수정", () => {
  it("Prompt 이름을 수정하고 저장하면 업데이트되어야 한다", async () => {
    let patchBody: Record<string, unknown> | null = null;
    setupVersionMocks();
    server.use(
      http.patch(`${API}/prompts/1`, async ({ request }) => {
        patchBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          id: 1,
          name: patchBody.name,
          description: patchBody.description ?? null,
          createdAt: "2026-01-01T00:00:00Z",
        });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<PromptDetail {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("팩트체크 판정기")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "수정" }));

    await waitFor(() => {
      expect(screen.getByLabelText("이름")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("이름");
    await user.clear(nameInput);
    await user.type(nameInput, "수정된 프롬프트");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(patchBody).toEqual(expect.objectContaining({ name: "수정된 프롬프트" }));
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("이름")).not.toBeInTheDocument();
    });
  });
});

describe("PromptDetail - 삭제", () => {
  it("Prompt 삭제 버튼 클릭 시 확인 모달이 표시되고 확인하면 삭제되어야 한다", async () => {
    let deleteCalled = false;
    const onDelete = vi.fn();
    setupVersionMocks();
    server.use(
      http.delete(`${API}/prompts/1`, () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<PromptDetail {...defaultProps} onDelete={onDelete} />);

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
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
