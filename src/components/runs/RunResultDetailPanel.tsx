import { CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { RunResultRow } from "@/types/runDetail";
import { isLogicPassed, isSemanticPassed } from "@/utils/evaluation";
import { isJsonString, tryFormatJson } from "@/utils/json";

import { ExpandableViewer } from "../common/ExpandableViewer";
import { ExpandablePromptViewer } from "./ExpandablePromptViewer";
import { JsonViewer } from "./JsonViewer";

interface RunResultDetailPanelProps {
  result: RunResultRow;
  baseResult?: RunResultRow;
}

const InputSection = ({ inputSnapshot }: { inputSnapshot: RunResultRow["inputSnapshot"] }) => {
  const entries = Object.entries(inputSnapshot);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">입력값</Label>
        <ExpandableViewer.Root title="입력 데이터">
          <div className="space-y-3">
            {entries.map(([key, value]) => (
              <div key={key}>
                <Label className="text-sm text-muted-foreground">{key}</Label>
                <pre
                  className={`mt-1 whitespace-pre-wrap rounded-lg p-3 text-sm ${
                    isJsonString(String(value))
                      ? "border bg-slate-50 font-mono text-slate-700"
                      : "bg-muted/50"
                  }`}
                >
                  {tryFormatJson(String(value))}
                </pre>
              </div>
            ))}
          </div>
        </ExpandableViewer.Root>
      </div>
      <div className="mt-1 space-y-1">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="shrink-0 font-mono text-sm text-muted-foreground">{key}:</span>
            <span className="line-clamp-2 text-sm">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpectedSection = ({
  expectedSnapshot,
}: {
  expectedSnapshot: RunResultRow["expectedSnapshot"];
}) => {
  const expectedText =
    typeof expectedSnapshot === "string"
      ? expectedSnapshot
      : (JSON.stringify(expectedSnapshot, null, 2) ?? "");

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">기대값</Label>
        <ExpandableViewer.Root title="기대값">
          <JsonViewer data={expectedText} maxHeight="400px" />
        </ExpandableViewer.Root>
      </div>
      <div className="mt-1 max-h-[80px] overflow-hidden">
        <JsonViewer data={expectedText} maxHeight="80px" />
      </div>
    </div>
  );
};

const ExpectedActualSection = ({
  expectedSnapshot,
  rawOutput,
}: Pick<RunResultRow, "expectedSnapshot" | "rawOutput">) => {
  const expectedText =
    typeof expectedSnapshot === "string"
      ? expectedSnapshot
      : (JSON.stringify(expectedSnapshot, null, 2) ?? "");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>기대값 vs 실제 출력</Label>
        <ExpandableViewer.JsonTabs
          title="기대값 vs 실제 출력 비교"
          maxWidth="max-w-3xl"
          tabs={[
            { id: "expected", label: "기대값", data: expectedSnapshot },
            { id: "actual", label: "실제 출력", data: rawOutput },
          ]}
          defaultTab="expected"
        />
      </div>

      <div className="rounded-lg border p-4">
        <Label className="mb-2 text-sm text-muted-foreground">기대값</Label>
        <div className="max-h-[80px] overflow-hidden">
          <JsonViewer data={expectedText} maxHeight="80px" />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <Label className="mb-2 text-sm text-muted-foreground">실제 출력</Label>
        <div className="max-h-[80px] overflow-hidden">
          <JsonViewer data={rawOutput} maxHeight="80px" />
        </div>
      </div>
    </div>
  );
};

const OutputCompareSection = ({
  baseResult,
  targetResult,
}: {
  baseResult: RunResultRow;
  targetResult: RunResultRow;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>출력 비교</Label>
      <ExpandableViewer.JsonTabs
        title="출력 비교"
        maxWidth="max-w-4xl"
        tabs={[
          { id: "base", label: "Base 출력", data: baseResult.rawOutput },
          { id: "target", label: "Target 출력", data: targetResult.rawOutput },
        ]}
        defaultTab="base"
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Base</Label>
        <div className="max-h-[120px] overflow-hidden">
          <JsonViewer data={baseResult.rawOutput} maxHeight="120px" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Target</Label>
        <div className="max-h-[120px] overflow-hidden">
          <JsonViewer data={targetResult.rawOutput} maxHeight="120px" />
        </div>
      </div>
    </div>
  </div>
);

const CompactEvaluation = ({ result, label }: { result: RunResultRow; label: string }) => {
  const semanticPassed = isSemanticPassed(result);
  const logicPassed = isLogicPassed(result);
  const semanticScoreText = `${(result.semanticScore * 100).toFixed(0)}%`;
  const StatusIcon = result.status === "pass" ? CheckCircle : XCircle;
  const statusColor = result.status === "pass" ? "text-green-500" : "text-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
        <Badge variant={result.status === "pass" ? "default" : "destructive"} className="text-xs">
          {result.status === "pass" ? "pass" : result.status}
        </Badge>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1">
          <span className="text-xs">출력형식</span>
          <Badge variant={result.isFormatPassed ? "default" : "destructive"} className="text-xs">
            {result.isFormatPassed ? "통과" : "실패"}
          </Badge>
        </div>
        <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="text-xs">유사도</span>
            {result.isFormatPassed && (
              <span
                className={`font-mono text-xs ${semanticPassed ? "text-green-600" : "text-red-500"}`}
              >
                {semanticScoreText}
              </span>
            )}
          </div>
          {result.isFormatPassed ? (
            <Badge variant={semanticPassed ? "default" : "secondary"} className="text-xs">
              {semanticPassed ? "통과" : "실패"}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
        <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1">
          <span className="text-xs">제약조건</span>
          {result.isFormatPassed ? (
            <Badge variant={logicPassed ? "default" : "destructive"} className="text-xs">
              {logicPassed ? "통과" : "실패"}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      </div>
    </div>
  );
};

const EvaluationCompareSection = ({
  baseResult,
  targetResult,
}: {
  baseResult: RunResultRow;
  targetResult: RunResultRow;
}) => (
  <div className="space-y-2">
    <Label>평가 비교</Label>
    <div className="grid grid-cols-2 gap-3">
      <CompactEvaluation result={baseResult} label="Base" />
      <CompactEvaluation result={targetResult} label="Target" />
    </div>
  </div>
);

const EvaluationSection = ({ result }: { result: RunResultRow }) => {
  const semanticPassed = isSemanticPassed(result);
  const logicPassed = isLogicPassed(result);
  const showLogicResults = result.isFormatPassed && result.logicResults?.results?.length > 0;
  const semanticScoreText = `(${(result.semanticScore * 100).toFixed(0)}%)`;

  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">3단계 평가 결과</Label>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded bg-muted/50 p-2">
          <span className="text-sm">출력형식</span>
          <Badge variant={result.isFormatPassed ? "default" : "destructive"}>
            {result.isFormatPassed ? "통과" : "실패"}
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded bg-muted/50 p-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">유사도</span>
            {result.isFormatPassed ? (
              <span
                className={`font-mono text-xs ${semanticPassed ? "text-green-600" : "text-red-500"}`}
              >
                {semanticScoreText}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">(미측정)</span>
            )}
          </div>
          {result.isFormatPassed ? (
            <Badge variant={semanticPassed ? "default" : "secondary"}>
              {semanticPassed ? "통과" : "실패"}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>

        <div className="rounded bg-muted/50 p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">제약조건</span>
            {result.isFormatPassed ? (
              <Badge variant={logicPassed ? "default" : "destructive"}>
                {logicPassed ? "통과" : "실패"}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
          {showLogicResults && (
            <div className="mt-2 space-y-1">
              {result.logicResults?.results?.map((constraint, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">
                    {constraint.constraintType}: &quot;{constraint.target}&quot;
                  </span>
                  {constraint.passed ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RunResultDetailPanel = ({ result, baseResult }: RunResultDetailPanelProps) => {
  const PassIcon = result.status === "pass" ? CheckCircle : XCircle;
  const passColor = result.status === "pass" ? "text-green-500" : "text-red-500";

  if (baseResult) {
    return (
      <div className="h-full overflow-auto rounded-lg border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <PassIcon className={`h-5 w-5 ${passColor}`} />
          <h3 className="text-lg font-semibold">Row #{result.rowIndex}</h3>
        </div>

        <div className="space-y-4">
          <InputSection inputSnapshot={result.inputSnapshot} />

          <Separator />

          <ExpectedSection expectedSnapshot={result.expectedSnapshot} />

          <Separator />

          <OutputCompareSection baseResult={baseResult} targetResult={result} />

          <Separator />

          <EvaluationCompareSection baseResult={baseResult} targetResult={result} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <PassIcon className={`h-5 w-5 ${passColor}`} />
        <h3 className="text-lg font-semibold">Row #{result.rowIndex}</h3>
      </div>

      <div className="space-y-4">
        <InputSection inputSnapshot={result.inputSnapshot} />

        <Separator />

        <ExpandablePromptViewer
          systemInstruction={result.assembledPrompt.systemInstruction}
          userTemplate={result.assembledPrompt.userMessage}
          labelClassName="text-sm text-muted-foreground"
        />

        <Separator />

        <ExpectedActualSection
          expectedSnapshot={result.expectedSnapshot}
          rawOutput={result.rawOutput}
        />

        <Separator />

        <EvaluationSection result={result} />
      </div>
    </div>
  );
};
