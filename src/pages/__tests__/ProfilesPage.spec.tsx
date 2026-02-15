import { MemoryRouter } from "react-router";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { ProfilesPage } from "@/pages/ProfilesPage";
import { createMockProfileDetail, createMockProfileSummary } from "@/test/factories/profile";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

const mockProfiles = [
  {
    ...createMockProfileSummary({
      name: "엄격한 평가",
      description: "높은 임계값",
      semanticThreshold: 0.9,
      constraintCount: 3,
    }),
    updatedAt: "2026-01-01",
  },
  {
    ...createMockProfileSummary({
      id: 2,
      name: "관대한 평가",
      description: "",
      semanticThreshold: 0.5,
      constraintCount: 0,
      createdAt: "2026-01-02",
    }),
    updatedAt: "2026-01-02",
  },
];

const mockProfileDetail = createMockProfileDetail({
  name: "엄격한 평가",
  description: "높은 임계값",
  semanticThreshold: 0.9,
  updatedAt: "2026-01-01",
});

const renderProfilesPage = () =>
  renderWithClient(
    <MemoryRouter>
      <ProfilesPage />
    </MemoryRouter>,
  );

describe("ProfilesPage", () => {
  it("Profiles 빈 상태에서 '프로필 만들기' 버튼이 동작해야 한다", async () => {
    server.use(http.get(`${API}/evaluator-profiles`, () => HttpResponse.json([])));
    const user = userEvent.setup();

    renderProfilesPage();

    const ctaButton = await screen.findByRole("button", { name: "프로필 만들기" });
    await user.click(ctaButton);

    expect(await screen.findByText("새 프로필 생성")).toBeInTheDocument();
  });

  it("프로필 선택 시 상세 정보가 표시되어야 한다", async () => {
    server.use(
      http.get(`${API}/evaluator-profiles`, () => HttpResponse.json(mockProfiles)),
      http.get(`${API}/evaluator-profiles/1`, () => HttpResponse.json(mockProfileDetail)),
    );
    const user = userEvent.setup();
    renderProfilesPage();

    await user.click(await screen.findByText("엄격한 평가"));

    await waitFor(() => {
      expect(screen.getByText(/유사도 임계값/)).toBeInTheDocument();
    });
  });

  it("프로필 미선택 시 안내 메시지가 표시되어야 한다", async () => {
    server.use(http.get(`${API}/evaluator-profiles`, () => HttpResponse.json(mockProfiles)));
    renderProfilesPage();

    await waitFor(() => {
      expect(screen.getByText(/프로필을 선택하세요/)).toBeInTheDocument();
    });
  });

  it("프로필 삭제 후 선택이 초기화되어야 한다", async () => {
    server.use(
      http.get(`${API}/evaluator-profiles`, () => HttpResponse.json(mockProfiles)),
      http.get(`${API}/evaluator-profiles/1`, () => HttpResponse.json(mockProfileDetail)),
      http.delete(`${API}/evaluator-profiles/1`, () => new HttpResponse(null, { status: 204 })),
    );
    const user = userEvent.setup();
    renderProfilesPage();

    await user.click(await screen.findByText("엄격한 평가"));

    await waitFor(() => {
      expect(screen.getByText(/유사도 임계값/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.click(await screen.findByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(screen.getByText(/프로필을 선택하세요/)).toBeInTheDocument();
    });
  });
});
