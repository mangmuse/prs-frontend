import { MemoryRouter } from "react-router";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { renderWithClient } from "@/test/utils";

const API = "http://localhost:8000";

const mockDatasets = [
  { id: 1, name: "테스트 데이터셋", description: "설명", rowCount: 2, createdAt: "2026-01-01" },
];

const mockDatasetDetail = {
  id: 1,
  name: "테스트 데이터셋",
  description: "설명",
  rows: [
    {
      id: 1,
      datasetId: 1,
      inputData: { question: "질문1" },
      expectedOutput: "답변1",
      tags: [],
    },
  ],
  pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 },
};

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

  it("데이터셋 선택 시 테이블이 표시되어야 한다", async () => {
    server.use(
      http.get(`${API}/datasets`, () => HttpResponse.json(mockDatasets)),
      http.get(`${API}/datasets/1`, () => HttpResponse.json(mockDatasetDetail)),
    );
    const user = userEvent.setup();

    renderDatasetsPage();

    await user.click(await screen.findByRole("button", { name: /데이터셋 선택/ }));
    await user.click(await screen.findByText("테스트 데이터셋"));

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });
});
