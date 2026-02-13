import { MemoryRouter, useLocation } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

import { Sidebar } from "../Sidebar";

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderSidebar = (queryClient: QueryClient) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/datasets"]}>
        <Sidebar />
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("Sidebar", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: "token",
      isAuthenticated: true,
      isGuest: false,
      isInitialized: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("로그아웃 시 홈으로 이동하고 사용자 캐시를 제거한다", async () => {
    const logoutSpy = vi.spyOn(authApi, "logout").mockResolvedValue(undefined);
    const guestSessionSpy = vi.spyOn(authApi, "createGuestSession").mockResolvedValue({
      guestId: "guest-id",
      createdAt: new Date().toISOString(),
    });

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["auth", "me"], {
      id: 1,
      email: "test@example.com",
      name: "테스트 사용자",
      pictureUrl: null,
    });
    queryClient.setQueryData(["datasets", "list"], [{ id: 1 }]);
    queryClient.setQueryData(["prompts", "list"], [{ id: 1 }]);
    queryClient.setQueryData(["profiles", "list"], [{ id: 1 }]);
    queryClient.setQueryData(["runs", "list", { grouped: true }], [{ id: 1 }]);

    renderSidebar(queryClient);
    const user = userEvent.setup();

    await user.click(screen.getByTitle("로그아웃"));

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/");
    });
    await waitFor(() => {
      expect(guestSessionSpy).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Google로 로그인")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(queryClient.getQueryData(["auth", "me"])).toBeUndefined();
    expect(queryClient.getQueryData(["datasets", "list"])).toBeUndefined();
    expect(queryClient.getQueryData(["prompts", "list"])).toBeUndefined();
    expect(queryClient.getQueryData(["profiles", "list"])).toBeUndefined();
    expect(queryClient.getQueryData(["runs", "list", { grouped: true }])).toBeUndefined();
  });

  it("게스트 세션 생성 2회 실패 시 에러 토스트를 표시한다", async () => {
    vi.spyOn(authApi, "logout").mockResolvedValue(undefined);
    const guestSessionSpy = vi
      .spyOn(authApi, "createGuestSession")
      .mockRejectedValue(new Error("fail"));
    const toastSpy = vi.spyOn(toast, "error").mockImplementation(() => "");

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["auth", "me"], {
      id: 1,
      email: "test@example.com",
      name: "테스트 사용자",
      pictureUrl: null,
    });
    renderSidebar(queryClient);
    const user = userEvent.setup();

    await user.click(screen.getByTitle("로그아웃"));

    await waitFor(() => {
      expect(guestSessionSpy).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });
  });
});
