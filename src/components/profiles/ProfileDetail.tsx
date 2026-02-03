import { useQuery } from "@tanstack/react-query";
import { Edit, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { profileQueries } from "@/queries/profileQueries";
import type { LogicConstraint } from "@/types/constraint";
import { CONSTRAINT_TYPE_LABELS, getConstraintValueDisplay } from "@/utils/constraintUtils";

interface ProfileDetailProps {
  profileId: number;
  onEdit: () => void;
}

export const ProfileDetail = ({ profileId, onEdit }: ProfileDetailProps) => {
  const { data: profile, isPending } = useQuery(profileQueries.detail(profileId));

  if (isPending) {
    return <div className="text-muted-foreground">로딩 중...</div>;
  }

  if (!profile) {
    return <div className="text-muted-foreground">프로필을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          {profile.description && (
            <p className="mt-1 text-sm text-muted-foreground">{profile.description}</p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit className="mr-1 h-4 w-4" />
          수정
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">유사도 임계값</div>
          <div className="mt-1 text-3xl font-bold text-primary">
            {Math.round(profile.semanticThreshold * 100)}%
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${profile.semanticThreshold * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">제약조건</div>
          <div className="mt-1 text-3xl font-bold text-primary">
            {profile.globalConstraints.length}개
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          제약조건
        </div>

        {profile.globalConstraints.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            제약조건이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {profile.globalConstraints.map((constraint: LogicConstraint, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3"
              >
                <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {CONSTRAINT_TYPE_LABELS[constraint.type]}
                </span>
                <span className="text-sm font-medium">{constraint.target}</span>
                {getConstraintValueDisplay(constraint) && (
                  <span className="text-sm text-muted-foreground">
                    : {getConstraintValueDisplay(constraint)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
