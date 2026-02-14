import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ErrorBoundary } from "../ErrorBoundary";

const ThrowError = () => {
  throw new Error("테스트 에러");
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("자식 컴포넌트에서 에러 발생 시 fallback UI를 표시해야 한다", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: /문제가 발생했습니다/ })).toBeInTheDocument();
  });

  it("fallback에서 새로고침 버튼 클릭 시 앱이 복구되어야 한다", async () => {
    const user = userEvent.setup();
    const shouldThrow = { current: true };

    const MaybeThrowError = () => {
      if (shouldThrow.current) {
        throw new Error("일시적 에러");
      }
      return <div>정상 콘텐츠</div>;
    };

    render(
      <ErrorBoundary>
        <MaybeThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: /문제가 발생했습니다/ })).toBeInTheDocument();

    shouldThrow.current = false;
    await user.click(screen.getByRole("button", { name: /새로고침/ }));

    expect(screen.getByText("정상 콘텐츠")).toBeInTheDocument();
  });
});
