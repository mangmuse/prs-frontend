import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { useAuthStore } from "@/stores/authStore";

import { AuthInitializer } from "../AuthInitializer";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("AuthInitializer", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      isGuest: false,
      isInitialized: false,
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("초기화 성공 시 children을 렌더링한다", async () => {
    renderWithProviders(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
    );

    await waitFor(() => {
      expect(screen.getByText("App Content")).toBeInTheDocument();
    });
  });

  it("초기화 중 로딩 UI를 표시한다", async () => {
    server.use(
      http.post("http://localhost:8000/auth/refresh", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );

    renderWithProviders(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
    );

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
    expect(screen.queryByText("App Content")).not.toBeInTheDocument();
  });

  it("커스텀 fallback을 지원한다", async () => {
    server.use(
      http.post("http://localhost:8000/auth/refresh", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );

    renderWithProviders(
      <AuthInitializer fallback={<div>Custom Loading</div>}>
        <div>App Content</div>
      </AuthInitializer>,
    );

    await waitFor(() => {
      expect(screen.getByText("Custom Loading")).toBeInTheDocument();
    });
  });

  it("런타임 로그아웃 후 전역 fallback을 다시 표시하지 않는다", async () => {
    useAuthStore.setState({
      accessToken: "token",
      isAuthenticated: true,
      isGuest: false,
      isInitialized: true,
    });

    const TestContent = () => {
      const setGuest = useAuthStore((s) => s.setGuest);

      return (
        <div>
          <button onClick={setGuest}>로그아웃 실행</button>
          <span>App Content</span>
        </div>
      );
    };

    renderWithProviders(
      <AuthInitializer>
        <TestContent />
      </AuthInitializer>,
    );

    const user = userEvent.setup();
    expect(screen.getByText("App Content")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "로그아웃 실행" }));
    expect(screen.getByText("App Content")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("refresh 성공 후 me 실패 시 guest 세션으로 폴백한다", async () => {
    server.use(
      http.post("http://localhost:8000/auth/refresh", () =>
        HttpResponse.json({ accessToken: "valid-token", wasGuest: false }),
      ),
      http.get("http://localhost:8000/auth/me", () =>
        HttpResponse.json({ detail: "사용자를 찾을 수 없습니다" }, { status: 401 }),
      ),
      http.post("http://localhost:8000/auth/guest", () =>
        HttpResponse.json({
          guestId: "00000000-0000-0000-0000-000000000000",
          createdAt: new Date().toISOString(),
        }),
      ),
    );

    renderWithProviders(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
    );

    await waitFor(() => {
      expect(screen.getByText("App Content")).toBeInTheDocument();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isGuest).toBe(true);
  });
});
