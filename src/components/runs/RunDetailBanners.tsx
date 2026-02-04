import type { ComponentType } from "react";

import { FlaskConical } from "lucide-react";

type StatsMessage = {
  icon: ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
};

export const RunDetailBanners = ({
  isLiveEditorOpen,
  isCompareMode,
  stats,
}: {
  isLiveEditorOpen: boolean;
  isCompareMode: boolean;
  stats: StatsMessage | null;
}) => (
  <>
    {isLiveEditorOpen && (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-primary">
        <FlaskConical className="h-5 w-5" />
        <div>
          <p className="font-semibold">실시간 시뮬레이션 모드</p>
          <p className="text-sm opacity-90">
            현재 수정을 통해 결과가 어떻게 변하는지 미리보고 있습니다. (원본 Run 데이터는
            보존됩니다)
          </p>
        </div>
      </div>
    )}

    {isCompareMode && stats && (
      <div className={`flex items-start gap-3 rounded-lg border p-4 ${stats.color}`}>
        <stats.icon className="mt-0.5 h-5 w-5" />
        <div>
          <p className="font-semibold">{stats.title}</p>
          <p className="text-sm opacity-80">{stats.description}</p>
        </div>
      </div>
    )}
  </>
);
