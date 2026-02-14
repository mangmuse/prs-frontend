import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { CreatePromptModal } from "../CreatePromptModal";

const API = "http://localhost:8000";

describe("CreatePromptModal", () => {
  it("Prompt 생성 후 해당 프롬프트가 자동 선택되어야 한다", async () => {
    const onCreated = vi.fn();
    server.use(
      http.post(`${API}/prompts`, () =>
        HttpResponse.json({ id: 42, name: "새 프롬프트", createdAt: "2026-01-01T00:00:00Z" }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<CreatePromptModal open={true} onClose={() => {}} onCreated={onCreated} />);

    await user.type(screen.getByPlaceholderText("예: 감정 분석 프롬프트"), "새 프롬프트");
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(42);
    });
  });
});
