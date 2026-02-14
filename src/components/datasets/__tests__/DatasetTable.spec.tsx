import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/utils";

import { DatasetTable } from "../DatasetTable";

const API = "http://localhost:8000";

const mockDetailResponse = {
  id: 1,
  name: "테스트 데이터셋",
  rows: [
    {
      id: 10,
      datasetId: 1,
      inputData: { claim: "서울은 수도다" },
      expectedOutput: "TRUE",
      tags: ["상식"],
    },
  ],
  pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 },
};

const setupHandlers = () => {
  server.use(
    http.get(`${API}/datasets/1`, () => HttpResponse.json(mockDetailResponse)),
    http.put(`${API}/datasets/1/rows/10`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: 10,
        datasetId: 1,
        inputData: body.inputData,
        expectedOutput: body.expectedOutput,
        tags: body.tags,
      });
    }),
  );
};

describe("DatasetTable - 행 수정", () => {
  it("행 수정 버튼 클릭 후 내용을 변경하고 저장하면 업데이트되어야 한다", async () => {
    setupHandlers();
    const user = userEvent.setup();
    renderWithClient(<DatasetTable datasetId={1} />);

    await waitFor(() => {
      expect(screen.getByText("테스트 데이터셋")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "수정" }));

    await waitFor(() => {
      expect(screen.getByText("행 수정")).toBeInTheDocument();
    });

    const expectedInput = screen.getByLabelText(/Expected Output/i);
    await user.clear(expectedInput);
    await user.type(expectedInput, "FALSE");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(screen.queryByText("행 수정")).not.toBeInTheDocument();
    });
  });
});
