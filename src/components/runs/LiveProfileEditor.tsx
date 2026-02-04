import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Save, X } from "lucide-react";

import { runsApi } from "@/api/runs";
import { useUpdateProfile } from "@/hooks/mutations/useUpdateProfile";
import { ProfileConstraintsList } from "@/components/profiles/ProfileConstraintsList";
import { ProfileForm } from "@/components/profiles/ProfileForm";
import type { ProfileFormData } from "@/components/profiles/profileSchema";
import { profileFormSchema } from "@/components/profiles/profileSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { runQueries } from "@/queries/runQueries";
import type { LogicConstraint } from "@/types/constraint";
import type { ReEvaluateResponse, RunDetailData, RunResultRow } from "@/types/runDetail";

interface LiveProfileEditorProps {
  run: RunDetailData;
  onClose: () => void;
  onPreviewUpdate: (updatedResults: RunResultRow[]) => void;
}

export const LiveProfileEditor = ({ run, onClose, onPreviewUpdate }: LiveProfileEditorProps) => {
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);
  const [diffStats, setDiffStats] = useState({ changed: 0, newPassRate: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: run.profile.name,
      description: "",
      semanticThreshold: run.profile.semanticThreshold,
      globalConstraints: run.profile.globalConstraints,
    },
  });

  const watchedThreshold = useWatch({ control: form.control, name: "semanticThreshold" });
  const watchedConstraints = useWatch({ control: form.control, name: "globalConstraints" });

  const reEvaluate = useCallback(
    async (threshold: number, constraints: LogicConstraint[]) => {
      setIsCalculating(true);
      try {
        const response: ReEvaluateResponse = await runsApi.reEvaluate(run.id, {
          semanticThreshold: threshold,
          globalConstraints: constraints,
        });

        const resultMap = new Map(response.results.map((r) => [r.id, r]));
        const newResults = run.results.map((row) => {
          const reEvaluated = resultMap.get(row.id);
          if (reEvaluated) {
            return { ...row, status: reEvaluated.status };
          }
          return row;
        });

        const changedCount = newResults.filter(
          (r, idx) => r.status !== run.results[idx].status,
        ).length;

        setDiffStats({
          changed: changedCount,
          newPassRate: Math.round(response.passRate * 100),
        });

        onPreviewUpdate(newResults);
      } catch {
        // API 에러 시 원래 결과 유지
      } finally {
        setIsCalculating(false);
      }
    },
    [run.id, run.results, onPreviewUpdate],
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void reEvaluate(watchedThreshold, watchedConstraints);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [watchedThreshold, watchedConstraints, reEvaluate]);

  const updateProfileMutation = useUpdateProfile();

  const onSubmit = async (data: ProfileFormData) => {
    await Promise.all([
      updateProfileMutation.mutateAsync({
        id: run.profile.id,
        data: {
          name: data.name,
          description: data.description,
          semanticThreshold: data.semanticThreshold,
          globalConstraints: data.globalConstraints,
        },
      }),
      runsApi.updateProfileSnapshot(run.id, {
        semanticThreshold: data.semanticThreshold,
        globalConstraints: data.globalConstraints,
      }),
    ]);

    void queryClient.invalidateQueries({ queryKey: runQueries.detail(run.id).queryKey });
    onClose();
  };

  return (
    <Form {...form}>
      <div className="flex h-full flex-col border-l bg-white shadow-xl transition-all w-[280px] lg:w-[340px] xl:w-[400px] shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">실시간 프로필 튜너</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 gap-px bg-slate-200 border-b">
          <div className="bg-white p-3 text-center">
            <div className="text-xs text-muted-foreground">새 통과율</div>
            <div className={cn("text-lg font-bold", isCalculating && "opacity-50")}>
              {diffStats.newPassRate}%
            </div>
          </div>
          <div className={cn("bg-white p-3 text-center", diffStats.changed > 0 && "bg-yellow-50")}>
            <div className="text-xs text-muted-foreground">영향받은 행</div>
            <div
              className={cn(
                "text-lg font-bold",
                diffStats.changed > 0 ? "text-yellow-600" : "text-slate-900",
              )}
            >
              {diffStats.changed}
            </div>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  기본 정보 및 유사도 임계값
                </h4>
                <ProfileForm control={form.control} />
              </div>

              <Separator />

              <div className="space-y-4">
                <ProfileConstraintsList control={form.control} />
              </div>
            </div>
          </ScrollArea>
          {isCalculating && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <div className="text-xs font-medium text-muted-foreground animate-pulse">
                계산 중...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-slate-50">
          <Button
            className="w-full"
            onClick={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            disabled={updateProfileMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateProfileMutation.isPending ? "저장 중..." : "프로필 업데이트"}
          </Button>
          <p className="mt-2 text-[10px] text-center text-muted-foreground">
            * 프로필 설정과 현재 Run의 스냅샷이 함께 업데이트됩니다.
          </p>
        </div>
      </div>
    </Form>
  );
};
