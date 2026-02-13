import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/api/auth";

export const useMigrate = () => {
  return useMutation({
    mutationFn: () => authApi.migrate(),
  });
};
