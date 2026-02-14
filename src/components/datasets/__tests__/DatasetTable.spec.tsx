import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

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

describe("DatasetTable - 데이터셋 삭제", () => {
  it("Dataset 삭제 버튼 클릭 시 확인 모달이 표시되고 확인하면 삭제되어야 한다", async () => {
    let deleteCalled = false;
    const onDelete = vi.fn();
    server.use(
      http.get(`${API}/datasets/1`, () => HttpResponse.json(mockDetailResponse)),
      http.delete(`${API}/datasets/1`, () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<DatasetTable datasetId={1} onDelete={onDelete} />);

    await waitFor(() => {
      expect(screen.getByText("테스트 데이터셋")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "데이터셋 삭제" }));

    await waitFor(() => {
      expect(screen.getByText("데이터셋을 삭제하시겠습니까?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
    });

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });
  });
});

describe("DatasetTable - 행 삭제", () => {
  it("행 삭제 버튼 클릭 시 확인 모달이 표시되고 확인하면 삭제되어야 한다", async () => {
    let deleteCalled = false;
    server.use(
      http.get(`${API}/datasets/1`, () => HttpResponse.json(mockDetailResponse)),
      http.delete(`${API}/datasets/1/rows/10`, () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<DatasetTable datasetId={1} onDelete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("테스트 데이터셋")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(screen.getByText("행을 삭제하시겠습니까?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
    });

    await waitFor(() => {
      expect(screen.queryByText("행을 삭제하시겠습니까?")).not.toBeInTheDocument();
    });
  });
});

describe("DatasetTable - 데이터셋 수정", () => {
  it("Dataset 이름을 수정하고 저장하면 업데이트되어야 한다", async () => {
    let patchBody: Record<string, unknown> | null = null;
    server.use(
      http.get(`${API}/datasets/1`, () => HttpResponse.json(mockDetailResponse)),
      http.patch(`${API}/datasets/1`, async ({ request }) => {
        patchBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          id: 1,
          name: patchBody.name,
          description: patchBody.description ?? null,
          rowCount: 1,
          createdAt: "2026-01-01T00:00:00Z",
        });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<DatasetTable datasetId={1} onDelete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("테스트 데이터셋")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "데이터셋 수정" }));

    await waitFor(() => {
      expect(screen.getByLabelText("이름")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("이름");
    await user.clear(nameInput);
    await user.type(nameInput, "수정된 데이터셋");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(patchBody).toEqual(expect.objectContaining({ name: "수정된 데이터셋" }));
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("이름")).not.toBeInTheDocument();
    });
  });
});

describe("DatasetTable - 토스트 알림", () => {
  it("mutation 성공 시 성공 토스트를 표시해야 한다", async () => {
    const toastSpy = vi.spyOn(toast, "success").mockImplementation(() => "");
    server.use(
      http.get(`${API}/datasets/1`, () => HttpResponse.json(mockDetailResponse)),
      http.delete(`${API}/datasets/1`, () => new HttpResponse(null, { status: 204 })),
    );
    const user = userEvent.setup();
    renderWithClient(<DatasetTable datasetId={1} onDelete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("테스트 데이터셋")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "데이터셋 삭제" }));
    await waitFor(() => {
      expect(screen.getByText("데이터셋을 삭제하시겠습니까?")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });

    toastSpy.mockRestore();
  });

  it("mutation 실패 시 에러 토스트를 표시해야 한다", async () => {
    const toastSpy = vi.spyOn(toast, "error").mockImplementation(() => "");
    server.use(
      http.get(`${API}/datasets/1`, () => HttpResponse.json(mockDetailResponse)),
      http.delete(`${API}/datasets/1`, () => new HttpResponse(null, { status: 500 })),
    );
    const user = userEvent.setup();
    renderWithClient(<DatasetTable datasetId={1} onDelete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("테스트 데이터셋")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "데이터셋 삭제" }));
    await waitFor(() => {
      expect(screen.getByText("데이터셋을 삭제하시겠습니까?")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });

    toastSpy.mockRestore();
  });
});

describe("DatasetTable - 행 수정", () => {
  it("행 수정 버튼 클릭 후 내용을 변경하고 저장하면 업데이트되어야 한다", async () => {
    setupHandlers();
    const user = userEvent.setup();
    renderWithClient(<DatasetTable datasetId={1} onDelete={vi.fn()} />);

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
