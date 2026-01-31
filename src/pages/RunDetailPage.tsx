import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { RunMetricsCards } from "@/components/runs/RunMetricsCards";
import { RunResultDetailPanel } from "@/components/runs/RunResultDetailPanel";
import { RunResultsTable } from "@/components/runs/RunResultsTable";
import { RunStatusBadge } from "@/components/runs/RunStatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runQueries } from "@/queries/runQueries";
import { formatRelativeTime } from "@/utils/date";

type StatusFilter = "all" | "pass" | "fail";

export const RunDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const runId = Number(id);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: run, isPending, isError } = useQuery(runQueries.detail(runId));

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !run) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Run을 불러오는데 실패했습니다.</p>
        <Button variant="outline" onClick={() => void navigate("/runs")}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const selectedResult = run.results.find((r) => r.id === selectedResultId);

  const filteredResults = run.results.filter((r) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pass") return r.status === "pass";
    return r.status !== "pass";
  });

  const passCount = run.results.filter((r) => r.status === "pass").length;
  const failCount = run.results.length - passCount;

  const metricsAsPercent = {
    passRate: run.metrics.passRate * 100,
    formatPassRate: run.metrics.formatPassRate * 100,
    semanticPassRate: run.metrics.semanticPassRate * 100,
    logicPassRate: run.metrics.logicPassRate * 100,
    avgSemantic: run.metrics.avgSemantic,
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
        <MobileSidebar />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => void navigate("/runs")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">
              {run.promptName} v{run.versionNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              {run.datasetName} · {run.profile.name} · {formatRelativeTime(run.createdAt)}
            </p>
          </div>
          <RunStatusBadge status={run.status} />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <RunMetricsCards {...metricsAsPercent} />

          <Tabs defaultValue="results" className="w-full">
            <TabsList>
              <TabsTrigger value="results">결과</TabsTrigger>
              <TabsTrigger value="trace">트레이스</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="mt-4">
              <div className="mb-4 flex gap-2">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                >
                  전체 ({run.results.length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "pass" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pass")}
                >
                  Pass ({passCount})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "fail" ? "default" : "outline"}
                  onClick={() => setStatusFilter("fail")}
                >
                  Fail ({failCount})
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border bg-white">
                  <RunResultsTable
                    results={filteredResults}
                    selectedId={selectedResultId}
                    onSelect={setSelectedResultId}
                  />
                </div>

                {selectedResult && (
                  <div className="w-[400px] shrink-0">
                    <RunResultDetailPanel result={selectedResult} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="trace" className="mt-4">
              <div className="rounded-lg border bg-white p-6">
                <h3 className="mb-4 font-medium">실행 트레이스</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">System Instruction 로드</p>
                      <p className="text-sm text-muted-foreground">
                        프롬프트 버전에서 시스템 지시사항 로드
                      </p>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">15ms</span>
                  </div>

                  <div className="ml-4 h-6 w-px bg-border" />

                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Template 조립</p>
                      <p className="text-sm text-muted-foreground">데이터셋 변수로 템플릿 치환</p>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">3ms</span>
                  </div>

                  <div className="ml-4 h-6 w-px bg-border" />

                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-700">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">LLM 호출</p>
                      <p className="text-sm text-muted-foreground">OpenAI GPT-4o-mini 호출</p>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">1,234ms</span>
                  </div>

                  <div className="ml-4 h-6 w-px bg-border" />

                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">3단계 평가</p>
                      <p className="text-sm text-muted-foreground">
                        Format → Semantic → Logic 검증
                      </p>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">45ms</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
