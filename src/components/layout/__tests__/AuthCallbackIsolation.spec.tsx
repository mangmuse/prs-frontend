import { RouterProvider, createMemoryRouter } from "react-router";

import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { createTestQueryClient } from "@/test/utils";

const LazyAuthCallbackPage = async () => {
  const { AuthCallbackPage } = await import("@/pages/AuthCallbackPage");
  return { Component: AuthCallbackPage };
};

const renderAuthCallback = (code: string) => {
  const queryClient = createTestQueryClient();

  const router = createMemoryRouter(
    [
      {
        path: "/auth/callback",
        lazy: LazyAuthCallbackPage,
      },
    ],
    { initialEntries: [`/auth/callback?code=${code}`] },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
};

describe("AuthCallback 격리 검증", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      isGuest: false,
      isInitialized: false,
    });
  });

  it("콜백 페이지에서 POST /auth/refresh가 호출되지 않는다", async () => {
    const refreshSpy = vi.spyOn(authApi, "refreshToken").mockResolvedValue({
      accessToken: "refreshed-token",
      wasGuest: false,
    });
    vi.spyOn(authApi, "exchangeToken").mockResolvedValue({
      accessToken: "test-token",
      wasGuest: false,
    });
    vi.spyOn(authApi, "getMe").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "테스트",
      pictureUrl: null,
    });

    renderAuthCallback("test-code");

    await waitFor(() => {
      expect(screen.queryByText("로그인 처리 중...")).not.toBeInTheDocument();
    });

    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it("wasGuest=true일 때 마이그레이션 모달이 표시된다", async () => {
    vi.spyOn(authApi, "exchangeToken").mockResolvedValue({
      accessToken: "test-token",
      wasGuest: true,
    });
    vi.spyOn(authApi, "getMe").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "테스트",
      pictureUrl: null,
    });

    renderAuthCallback("test-code");

    await waitFor(() => {
      expect(screen.getByText("게스트 데이터 이전")).toBeInTheDocument();
    });

    expect(screen.getByText("이전하기")).toBeInTheDocument();
    expect(screen.getByText("건너뛰기")).toBeInTheDocument();
  });
});
