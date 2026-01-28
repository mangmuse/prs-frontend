// src/mocks/handlers.ts
import { HttpResponse, http } from "msw";

export const handlers = [
  // Health check mock
  http.get("http://localhost:8000/health", () => {
    return HttpResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  }),
];
