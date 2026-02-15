import { MemoryRouter } from "react-router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

const renderDatasetsPage = () =>
  renderWithClient(
    <MemoryRouter>
      <DatasetsPage />
    </MemoryRouter>,
  );

describe("DatasetsPage", () => {
  it("Datasets 빈 상태에서 '데이터셋 만들기' 버튼이 동작해야 한다", async () => {
    server.use(http.get(`${API}/datasets`, () => HttpResponse.json([])));
    const user = userEvent.setup();

    renderDatasetsPage();

    const ctaButton = await screen.findByRole("button", { name: "데이터셋 만들기" });
    await user.click(ctaButton);

    expect(await screen.findByRole("heading", { name: "새 데이터셋" })).toBeInTheDocument();
  });
});
