import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

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
      http.post("http://localhost:8000/auth/guest", async () => {
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
      http.post("http://localhost:8000/auth/guest", async () => {
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
});
