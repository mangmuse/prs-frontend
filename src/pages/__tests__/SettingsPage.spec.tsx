import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { useApiKeyStore } from "@/stores/apiKeyStore";
import { renderWithClient } from "@/test/utils";

import { SettingsPage } from "../SettingsPage";

describe("SettingsPage", () => {
  it("모든 LLM 제공자 카드가 렌더링되어야 한다", () => {
    renderWithClient(<SettingsPage />);

    expect(screen.getByText(/OpenAI/)).toBeInTheDocument();
    expect(screen.getByText(/Anthropic/)).toBeInTheDocument();
    expect(screen.getByText(/Google Gemini/)).toBeInTheDocument();
  });

  it("보안 안내 메시지가 표시되어야 한다", () => {
    renderWithClient(<SettingsPage />);

    expect(screen.getByText(/API Key는 브라우저에만 저장됩니다/)).toBeInTheDocument();
    expect(screen.getByText(/서버에 저장되지 않으며/)).toBeInTheDocument();
  });

  it("키가 없으면 '모든 키 삭제' 버튼이 보이지 않아야 한다", () => {
    useApiKeyStore.setState({ keys: {} });
    renderWithClient(<SettingsPage />);

    expect(screen.queryByRole("button", { name: /모든 키 삭제/ })).not.toBeInTheDocument();
  });

  it("키가 있으면 '모든 키 삭제' 버튼이 표시되어야 한다", () => {
    useApiKeyStore.setState({ keys: { openai: "sk-test" } });
    renderWithClient(<SettingsPage />);

    expect(screen.getByRole("button", { name: /모든 키 삭제/ })).toBeInTheDocument();
  });

  it("'모든 키 삭제' 클릭 시 버튼이 사라져야 한다", async () => {
    useApiKeyStore.setState({ keys: { openai: "sk-test", anthropic: "sk-ant-test" } });
    const user = userEvent.setup();
    renderWithClient(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /모든 키 삭제/ }));

    expect(screen.queryByRole("button", { name: /모든 키 삭제/ })).not.toBeInTheDocument();
  });
});
