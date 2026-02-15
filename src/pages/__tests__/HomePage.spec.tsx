import { MemoryRouter } from "react-router";

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useApiKeyStore } from "@/stores/apiKeyStore";
import { renderWithClient } from "@/test/utils";

import { HomePage } from "../HomePage";

const renderHomePage = () =>
  renderWithClient(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe("HomePage", () => {
  it("3단계 워크플로우 카드가 모두 표시되어야 한다", () => {
    renderHomePage();

    expect(screen.getByText(/1\. 프롬프트 작성/)).toBeInTheDocument();
    expect(screen.getByText(/2\. 데이터셋 준비/)).toBeInTheDocument();
    expect(screen.getByText(/3\. 평가 프로필 설정/)).toBeInTheDocument();
  });

  it("각 단계의 네비게이션 링크가 있어야 한다", () => {
    renderHomePage();

    expect(screen.getByRole("link", { name: /프롬프트 관리/ })).toHaveAttribute("href", "/prompts");
    expect(screen.getByRole("link", { name: /데이터셋 관리/ })).toHaveAttribute(
      "href",
      "/datasets",
    );
    expect(screen.getByRole("link", { name: /프로필 관리/ })).toHaveAttribute("href", "/profiles");
  });

  it("키가 없으면 경고 메시지가 표시되어야 한다", () => {
    useApiKeyStore.setState({ keys: {} });
    renderHomePage();

    expect(screen.getByText(/API 키를 먼저 설정하세요/)).toBeInTheDocument();
  });

  it("키가 있으면 완료 메시지가 표시되어야 한다", () => {
    useApiKeyStore.setState({ keys: { openai: "sk-test" } });
    renderHomePage();

    expect(screen.getByText(/API 키가 설정되었습니다/)).toBeInTheDocument();
  });
});
