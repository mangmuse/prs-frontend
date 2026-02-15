import { MemoryRouter } from "react-router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { ProfilesPage } from "@/pages/ProfilesPage";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

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
});
