import { http, passthrough } from "msw";

export const handlers = [
  http.get("http://localhost:8000/health", () => passthrough()),
  http.post("http://localhost:8000/auth/guest", () => passthrough()),
  http.get("http://localhost:8000/datasets", () => passthrough()),
  http.post("http://localhost:8000/datasets", () => passthrough()),
  http.get("http://localhost:8000/datasets/:id", () => passthrough()),
  http.post("http://localhost:8000/datasets/:id/rows", () => passthrough()),
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
