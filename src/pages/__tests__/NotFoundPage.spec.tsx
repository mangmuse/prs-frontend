import { MemoryRouter, Route, Routes } from "react-router";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotFoundPage } from "../NotFoundPage";

describe("404 페이지", () => {
  it("존재하지 않는 경로 접근 시 404 페이지를 렌더링해야 한다", () => {
    render(
      <MemoryRouter initialEntries={["/this-does-not-exist"]}>
        <Routes>
          <Route path="/" element={<div>홈</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /페이지를 찾을 수 없습니다/ })).toBeInTheDocument();
  });

  it("404 페이지에서 홈으로 이동할 수 있어야 한다", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/this-does-not-exist"]}>
        <Routes>
          <Route path="/" element={<div>홈</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("link", { name: /홈으로 돌아가기/ }));

    expect(screen.getByText("홈")).toBeInTheDocument();
  });
});
