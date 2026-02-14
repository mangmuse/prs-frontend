import { useMutation, useQueryClient } from "@tanstack/react-query";

import { profilesApi } from "@/api/profiles";
import { profileQueries } from "@/queries/profileQueries";
import type { CreateProfileRequest, UpdateProfileRequest } from "@/types/profile";

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileRequest) => profilesApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProfileRequest }) =>
      profilesApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: number) => profilesApi.delete(profileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
    },
  });
};
