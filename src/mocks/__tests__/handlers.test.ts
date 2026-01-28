// src/mocks/__tests__/handlers.test.ts
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { overrideHandlers } from "../test-utils";

interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

describe("MSW Handlers", () => {
  it("health check 핸들러가 정상 응답을 반환한다", async () => {
    const response = await fetch("http://localhost:8000/health");
    const data = (await response.json()) as HealthCheckResponse;

    expect(response.ok).toBe(true);
    expect(data.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
  });

  it("핸들러 오버라이드가 동작한다", async () => {
    overrideHandlers(
      http.get("http://localhost:8000/health", () => {
        return HttpResponse.json({ status: "unhealthy" }, { status: 503 });
      }),
    );

    const response = await fetch("http://localhost:8000/health");
    expect(response.status).toBe(503);
  });
});
