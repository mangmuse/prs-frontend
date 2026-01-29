import { useQuery } from "@tanstack/react-query";
import { Plus, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { profileQueries } from "@/queries/profileQueries";

interface ProfileListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreateNew: () => void;
}

export const ProfileList = ({ selectedId, onSelect, onCreateNew }: ProfileListProps) => {
  const { data: profiles, isPending } = useQuery(profileQueries.list());

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profiles</h2>
        </div>
        <div className="text-sm text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Profiles</h2>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="mr-1 h-4 w-4" />새 프로필
        </Button>
      </div>

      {!profiles || profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Shield className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">프로필을 생성하세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => onSelect(profile.id)}
              className={cn(
                "cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/50",
                selectedId === profile.id && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{profile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(profile.semantic_threshold * 100)}%
                </span>
              </div>
              {profile.description && (
                <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {profile.description}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                {profile.constraint_count}개 제약조건
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
