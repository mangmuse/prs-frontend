import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { CreateProfileModal, type ModalState } from "@/components/profiles/CreateProfileModal";
import { ProfileDetail } from "@/components/profiles/ProfileDetail";
import { ProfileList } from "@/components/profiles/ProfileList";
import { useModal } from "@/hooks/modals/useModal";

export const ProfilesPage = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const {
    state: modalState,
    open: openModal,
    close: closeModal,
  } = useModal<ModalState>({ open: false });

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Profiles" />

      <div className="flex-1 grid grid-cols-3 gap-6 p-6">
        <ProfileList
          selectedId={selectedProfileId}
          onSelect={setSelectedProfileId}
          onCreateNew={() => openModal({ mode: "create" })}
        />

        <div className="col-span-2">
          {selectedProfileId ? (
            <ProfileDetail
              profileId={selectedProfileId}
              onEdit={() => {
                if (selectedProfileId) {
                  openModal({ mode: "edit", profileId: selectedProfileId });
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <p className="text-muted-foreground">프로필을 선택하세요</p>
            </div>
          )}
        </div>
      </div>

      <CreateProfileModal state={modalState} onClose={closeModal} />
    </div>
  );
};
