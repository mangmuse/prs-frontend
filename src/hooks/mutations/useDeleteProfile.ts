import { useMutation, useQueryClient } from "@tanstack/react-query";

import { profilesApi } from "@/api/profiles";
import { profileQueries } from "@/queries/profileQueries";

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: number) => profilesApi.delete(profileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
    },
  });
};
