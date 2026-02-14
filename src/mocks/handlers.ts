import { HttpResponse, http, passthrough } from "msw";

export const handlers = [
  http.get("http://localhost:8000/health", () => passthrough()),
  http.post("http://localhost:8000/auth/guest", () => {
    return HttpResponse.json({
      guestId: "00000000-0000-0000-0000-000000000000",
      createdAt: new Date().toISOString(),
    });
  }),
  http.post("http://localhost:8000/auth/refresh", () => {
    return HttpResponse.json({ detail: "리프레시 토큰이 없습니다" }, { status: 401 });
  }),
  http.get("http://localhost:8000/auth/me", () => {
    return HttpResponse.json({
      id: 1,
      email: "test@example.com",
      name: "테스트 사용자",
      pictureUrl: null,
    });
  }),
  http.post("http://localhost:8000/auth/logout", () => new HttpResponse(null, { status: 204 })),
  http.get("http://localhost:8000/datasets", () => passthrough()),
  http.post("http://localhost:8000/datasets", () => passthrough()),
  http.get("http://localhost:8000/datasets/:id", () => passthrough()),
  http.post("http://localhost:8000/datasets/:id/rows", () => passthrough()),
  http.put("http://localhost:8000/datasets/:id/rows/:rowId", () => passthrough()),
  http.delete("http://localhost:8000/datasets/:id/rows/:rowId", () => passthrough()),
  http.get("http://localhost:8000/prompts", () => passthrough()),
  http.post("http://localhost:8000/prompts", () => passthrough()),
  http.get("http://localhost:8000/prompts/:promptId/versions", () => passthrough()),
  http.post("http://localhost:8000/prompts/:promptId/versions", () => passthrough()),
  http.get("http://localhost:8000/prompts/:promptId/versions/:versionId", () => passthrough()),
  http.get("http://localhost:8000/evaluator-profiles", () => passthrough()),
  http.get("http://localhost:8000/evaluator-profiles/:id", () => passthrough()),
  http.post("http://localhost:8000/evaluator-profiles", () => passthrough()),
  http.patch("http://localhost:8000/evaluator-profiles/:id", () => passthrough()),
];
