import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useCreateProfile, useUpdateProfile } from "@/hooks/mutations/profileMutations";
import { profileQueries } from "@/queries/profileQueries";
import type { CreateProfileRequest } from "@/types/profile";

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
  onCreated: (id: number) => void;
}

export const CreateProfileModal = ({ state, onClose, onCreated }: CreateProfileModalProps) => {
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

  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();

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
      updateMutation.mutate(
        { id: profileId!, data: requestData },
        {
          onSuccess: () => {
            toast.success("프로필이 수정되었습니다");
            handleClose();
          },
          onError: () => {
            toast.error("프로필 수정에 실패했습니다");
          },
        },
      );
      return;
    }

    createMutation.mutate(requestData as CreateProfileRequest, {
      onSuccess: (created) => {
        toast.success("프로필이 생성되었습니다");
        onCreated(created.id);
        handleClose();
      },
      onError: () => {
        toast.error("프로필 생성에 실패했습니다");
      },
    });
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
