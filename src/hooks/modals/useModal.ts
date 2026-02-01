import { useState } from "react";

export const useModal = <T extends { open: boolean } = { open: boolean }>(
  initialState: T = { open: false } as T,
) => {
  const [state, setState] = useState<T>(initialState);

  const open = (data?: Partial<Omit<T, "open">>) => {
    setState({ ...initialState, ...data, open: true } as T);
  };

  const close = () => {
    setState(initialState);
  };

  return {
    state,
    open,
    close,
    onOpenChange: (isOpen: boolean) => !isOpen && close(),
  };
};
