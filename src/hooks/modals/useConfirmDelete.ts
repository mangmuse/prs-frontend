import { useState } from "react";

import type { UseMutationResult } from "@tanstack/react-query";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

export const useConfirmDelete = <TId, TVars = TId>(
  mutation: Pick<UseMutationResult<unknown, Error, TVars>, "mutate" | "isPending">,
  buildArgs?: (id: TId) => TVars,
) => {
  const [deletingId, setDeletingId] = useState<TId | null>(null);

  const dialogProps: ConfirmDeleteDialogProps = {
    open: deletingId !== null,
    onOpenChange: (open: boolean) => !open && setDeletingId(null),
    isPending: mutation.isPending,
    onConfirm: () => {
      if (deletingId === null) return;
      const args = (buildArgs ? buildArgs(deletingId) : deletingId) as TVars;
      mutation.mutate(args, { onSuccess: () => setDeletingId(null) });
    },
  };

  return {
    open: (id: TId) => setDeletingId(id),
    dialogProps,
  };
};
