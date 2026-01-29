import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { CreateProfileModal, type ModalState } from "@/components/profiles/CreateProfileModal";
import { ProfileDetail } from "@/components/profiles/ProfileDetail";
import { ProfileList } from "@/components/profiles/ProfileList";

export const ProfilesPage = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ open: false });

  const openCreateModal = () => setModalState({ open: true, mode: "create" });
  const openEditModal = () => {
    if (selectedProfileId) {
      setModalState({ open: true, mode: "edit", profileId: selectedProfileId });
    }
  };
  const closeModal = () => setModalState({ open: false });

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Profiles" />

      <div className="flex-1 grid grid-cols-3 gap-6 p-6">
        <ProfileList
          selectedId={selectedProfileId}
          onSelect={setSelectedProfileId}
          onCreateNew={openCreateModal}
        />

        <div className="col-span-2">
          {selectedProfileId ? (
            <ProfileDetail profileId={selectedProfileId} onEdit={openEditModal} />
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
