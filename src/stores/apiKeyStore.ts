import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type LLMProvider = "openai" | "anthropic" | "gemini";

interface ApiKeyState {
  keys: Partial<Record<LLMProvider, string>>;
  actions: {
    setKey: (provider: LLMProvider, key: string) => void;
    removeKey: (provider: LLMProvider) => void;
    clearAll: () => void;
  };
}

export const useApiKeyStore = create<ApiKeyState>()(
  devtools(
    persist(
      (set) => ({
        keys: {},
        actions: {
          setKey: (provider, key) =>
            set((state) => ({ keys: { ...state.keys, [provider]: key } }), false, "setKey"),
          removeKey: (provider) =>
            set(
              (state) => {
                const next = { ...state.keys };
                delete next[provider];
                return { keys: next };
              },
              false,
              "removeKey",
            ),
          clearAll: () => set({ keys: {} }, false, "clearAll"),
        },
      }),
      {
        name: "prs_api_keys",
        partialize: (state) => ({ keys: state.keys }),
      },
    ),
    { name: "api-key-store" },
  ),
);

export const useApiKey = (provider: LLMProvider) => useApiKeyStore((s) => s.keys[provider]);

export const useApiKeyByProvider = (provider: LLMProvider | null) =>
  useApiKeyStore((s) => (provider ? s.keys[provider] : undefined));

export const useHasAnyKey = () => useApiKeyStore((s) => Object.keys(s.keys).length > 0);

export const useApiKeyActions = () => useApiKeyStore((s) => s.actions);
