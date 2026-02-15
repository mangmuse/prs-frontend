import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

import { ProfileDetail } from "../ProfileDetail";

const API = "http://localhost:8000";

const mockProfile = {
  id: 1,
  name: "기본 프로필",
  description: "테스트용 프로필",
  semanticThreshold: 0.85,
  globalConstraints: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const renderProfileDetail = (props?: { onDelete?: () => void }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  server.use(http.get(`${API}/evaluator-profiles/1`, () => HttpResponse.json(mockProfile)));

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileDetail profileId={1} onEdit={() => {}} onDelete={props?.onDelete ?? (() => {})} />
    </QueryClientProvider>,
  );
};

describe("ProfileDetail - Profile 삭제", () => {
  it("Profile 삭제 버튼 클릭 시 확인 모달이 표시되고 확인하면 삭제되어야 한다", async () => {
    let deleteCalled = false;
    const onDelete = vi.fn();

    server.use(
      http.delete(`${API}/evaluator-profiles/1`, () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderProfileDetail({ onDelete });
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/기본 프로필/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(screen.getByText(/프로필을 삭제하시겠습니까/)).toBeInTheDocument();
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
