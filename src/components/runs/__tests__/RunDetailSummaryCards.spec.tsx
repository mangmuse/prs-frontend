import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RunDetailSummaryCards } from "../RunDetailSummaryCards";

const MOCK_SUMMARY = {
  regressed: 3,
  improved: 5,
  changed: 2,
  unchanged: 40,
};

const clickCard = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  const labelEl = screen.getByText(label);
  const card = labelEl.closest("[class*='cursor-pointer']")!;
  await user.click(card);
};

describe("RunDetailSummaryCards 필터", () => {
  it("changed 카드 클릭 시 changed 항목만 필터링해야 한다", async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();

    render(
      <RunDetailSummaryCards
        summary={MOCK_SUMMARY}
        statusFilter="all"
        onStatusFilterChange={onFilter}
      />,
    );

    await clickCard(user, "변경");

    expect(onFilter).toHaveBeenCalledWith("changed");
  });

  it("unchanged 카드 클릭 시 unchanged 항목만 필터링해야 한다", async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();

    render(
      <RunDetailSummaryCards
        summary={MOCK_SUMMARY}
        statusFilter="all"
        onStatusFilterChange={onFilter}
      />,
    );

    await clickCard(user, "유지");

    expect(onFilter).toHaveBeenCalledWith("unchanged");
  });

  it("활성 필터 재클릭 시 필터가 해제되어야 한다", async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();

    render(
      <RunDetailSummaryCards
        summary={MOCK_SUMMARY}
        statusFilter="changed"
        onStatusFilterChange={onFilter}
      />,
    );

    await clickCard(user, "변경");

    expect(onFilter).toHaveBeenCalledWith("all");
  });
});
