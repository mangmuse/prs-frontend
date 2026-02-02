import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { profilesApi } from "@/api/profiles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { profileQueries } from "@/queries/profileQueries";
import type { CreateProfileRequest, UpdateProfileRequest } from "@/types/profile";

import { ProfileConstraintsList } from "./ProfileConstraintsList";
import { ProfileForm } from "./ProfileForm";
import { type ProfileFormData, profileFormSchema } from "./profileSchema";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; profileId: number };

interface CreateProfileModalProps {
  state: ModalState;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProfileModal = ({ state, onClose, onSuccess }: CreateProfileModalProps) => {
  const queryClient = useQueryClient();
  const isEditMode = state.open && state.mode === "edit";
  const profileId = isEditMode ? state.profileId : null;

  const { data: existingProfile } = useQuery({
    ...profileQueries.detail(profileId ?? 0),
    enabled: !!profileId,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      description: "",
      semanticThreshold: 0.85,
      globalConstraints: [],
    },
  });

  useEffect(() => {
    if (isEditMode && existingProfile) {
      form.reset({
        name: existingProfile.name,
        description: existingProfile.description || "",
        semanticThreshold: existingProfile.semanticThreshold,
        globalConstraints: existingProfile.globalConstraints,
      });
    } else if (!isEditMode && state.open) {
      form.reset({
        name: "",
        description: "",
        semanticThreshold: 0.85,
        globalConstraints: [],
      });
    }
  }, [isEditMode, existingProfile, state.open, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProfileRequest) => profilesApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
      handleClose();
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profilesApi.update(profileId!, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
      handleClose();
      onSuccess?.();
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: ProfileFormData) => {
    const requestData = {
      name: data.name,
      description: data.description || undefined,
      semanticThreshold: data.semanticThreshold,
      globalConstraints: data.globalConstraints.map((constraint) => {
        switch (constraint.type) {
          case "contains":
          case "not_contains":
            return {
              type: constraint.type,
              target: constraint.target,
              value: constraint.value,
            };
          case "range":
            return {
              type: constraint.type,
              target: constraint.target,
              min: constraint.min,
              max: constraint.max,
            };
          case "regex":
            return {
              type: constraint.type,
              target: constraint.target,
              pattern: constraint.pattern,
            };
          case "max_length":
            return {
              type: constraint.type,
              target: constraint.target,
              max: constraint.max,
            };
        }
      }),
    };

    if (isEditMode) {
      updateMutation.mutate(requestData);
    } else {
      createMutation.mutate(requestData as CreateProfileRequest);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "프로필 수정" : "새 프로필 생성"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6 py-4">
            <ProfileForm control={form.control} />
            <ProfileConstraintsList control={form.control} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export type { ModalState };
