import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithClient } from "@/test/utils";

import { DatasetPagination } from "../DatasetPagination";

describe("DatasetPagination", () => {
  it("현재 페이지가 활성 표시되어야 한다", () => {
    renderWithClient(
      <DatasetPagination page={3} totalPages={10} totalCount={100} onPageChange={vi.fn()} />,
    );

    const activePage = screen.getByRole("button", { name: "3", current: "page" });
    expect(activePage).toBeInTheDocument();
  });

  it("첫 페이지에서 이전/처음 버튼이 비활성화되어야 한다", () => {
    renderWithClient(
      <DatasetPagination page={1} totalPages={10} totalCount={100} onPageChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("Go to first page")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByLabelText("Go to previous page")).toHaveAttribute("aria-disabled", "true");
  });

  it("마지막 페이지에서 다음/끝 버튼이 비활성화되어야 한다", () => {
    renderWithClient(
      <DatasetPagination page={10} totalPages={10} totalCount={100} onPageChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("Go to last page")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByLabelText("Go to next page")).toHaveAttribute("aria-disabled", "true");
  });

  it("페이지 번호 클릭 시 onPageChange가 호출되어야 한다", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderWithClient(
      <DatasetPagination page={1} totalPages={10} totalCount={100} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
