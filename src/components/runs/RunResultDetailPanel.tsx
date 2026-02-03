import { CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { RunResultRow } from "@/types/runDetail";
import { isLogicPassed, isSemanticPassed } from "@/utils/evaluation";
import { isJsonString, tryFormatJson } from "@/utils/json";

import { ExpandableViewer } from "../common/ExpandableViewer";
import { JsonViewer } from "./JsonViewer";

interface RunResultDetailPanelProps {
  result: RunResultRow;
}

export const RunResultDetailPanel = ({ result }: RunResultDetailPanelProps) => {
  const PassIcon = result.status === "pass" ? CheckCircle : XCircle;
  const passColor = result.status === "pass" ? "text-green-500" : "text-red-500";

  return (
    <div className="h-full overflow-auto rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <PassIcon className={`h-5 w-5 ${passColor}`} />
        <h3 className="text-lg font-semibold">Row #{result.rowIndex}</h3>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">입력값</Label>
            <ExpandableViewer title="입력 데이터">
              <div className="space-y-3">
                {Object.entries(result.inputSnapshot).map(([key, value]) => (
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
            </ExpandableViewer>
          </div>
          <div className="mt-1 space-y-1">
            {Object.entries(result.inputSnapshot).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="shrink-0 font-mono text-sm text-muted-foreground">{key}:</span>
                <span className="line-clamp-2 text-sm">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* 조립된 프롬프트 */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">조립된 프롬프트</Label>
            <ExpandableViewer title="조립된 프롬프트" maxWidth="max-w-3xl">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">System Instruction</Label>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-blue-50 p-4 text-sm">
                    {result.assembledPrompt.systemInstruction}
                  </pre>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">User Message</Label>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-green-50 p-4 text-sm">
                    {result.assembledPrompt.userMessage}
                  </pre>
                </div>
              </div>
            </ExpandableViewer>
          </div>
          <div className="mt-1 rounded-lg border">
            <div className="border-b bg-blue-50/50 p-2">
              <p className="text-xs font-medium text-blue-700">System</p>
              <p className="line-clamp-2 text-sm">{result.assembledPrompt.systemInstruction}</p>
            </div>
            <div className="bg-green-50/50 p-2">
              <p className="text-xs font-medium text-green-700">User</p>
              <p className="line-clamp-2 text-sm">{result.assembledPrompt.userMessage}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">기대값</Label>
            <JsonViewer
              data={
                typeof result.expectedSnapshot === "string"
                  ? result.expectedSnapshot
                  : (JSON.stringify(result.expectedSnapshot, null, 2) ?? "")
              }
              maxHeight="80px"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">실제 출력</Label>
              <ExpandableViewer title="실제 출력">
                <JsonViewer data={result.rawOutput} maxHeight="60vh" />
              </ExpandableViewer>
            </div>
            <JsonViewer data={result.rawOutput} maxHeight="80px" />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="mb-2 block text-sm font-medium">3단계 평가 결과</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded bg-muted/50 p-2">
              <span className="text-sm">출력형식</span>
              <Badge variant={result.isFormatPassed ? "default" : "destructive"}>
                {result.isFormatPassed ? "통과" : "실패"}
              </Badge>
            </div>

            {/* Semantic */}
            <div className="flex items-center justify-between rounded bg-muted/50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">유사도</span>
                {result.isFormatPassed ? (
                  <span
                    className={`font-mono text-xs ${
                      isSemanticPassed(result) ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    ({(result.semanticScore * 100).toFixed(0)}%)
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">(미측정)</span>
                )}
              </div>
              {result.isFormatPassed ? (
                <Badge variant={isSemanticPassed(result) ? "default" : "secondary"}>
                  {isSemanticPassed(result) ? "통과" : "실패"}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>

            <div className="rounded bg-muted/50 p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">제약조건</span>
                {result.isFormatPassed ? (
                  <Badge variant={isLogicPassed(result) ? "default" : "destructive"}>
                    {isLogicPassed(result) ? "통과" : "실패"}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
              {result.isFormatPassed && result.logicResults?.results?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.logicResults.results.map((constraint, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-muted-foreground">
                        {constraint.constraintType}: "{constraint.target}"
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
      </div>
    </div>
  );
};
