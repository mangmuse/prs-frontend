import type { Control, FieldValues, Path } from "react-hook-form";

import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SCHEMA_OPTIONS } from "@/constants/prompt";
import { llmQueries } from "@/queries/llmQueries";

import type { VersionFormData } from "./versionFormSchema";

interface VersionFormFieldsProps<T extends FieldValues & VersionFormData> {
  control: Control<T>;
}

export const VersionFormFields = <T extends FieldValues & VersionFormData>({
  control,
}: VersionFormFieldsProps<T>) => {
  const { data: modelsData, isPending: modelsLoading } = useQuery(llmQueries.models());
  const models = modelsData?.models ?? [];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={control}
          name={"model" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>모델</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value as string}
                disabled={modelsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="모델을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-96 overflow-y-auto">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"temperature" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Temperature ({field.value as number})
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>낮을수록 일관된 응답, 높을수록 다양한 응답</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Slider
                  value={[field.value as number]}
                  onValueChange={(v: number[]) => field.onChange(v[0])}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"outputSchema" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                출력 형식
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <ul className="space-y-1 text-xs">
                        <li>
                          <strong>JSON Object</strong> - 단일 객체({"{}"}) 반환
                        </li>
                        <li>
                          <strong>JSON Array</strong> - 배열({"[]"}) 반환
                        </li>
                        <li>
                          <strong>Label</strong> - 분류 라벨 반환
                        </li>
                        <li>
                          <strong>Freeform</strong> - 자유 형식 응답
                        </li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SCHEMA_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={"systemInstruction" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>시스템 지시문(System Instruction)</FormLabel>
            <FormDescription>AI에게 역할과 행동 규칙을 지시하는 프롬프트입니다</FormDescription>
            <FormControl>
              <Textarea placeholder="시스템 지시사항을 입력하세요..." rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"userTemplate" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>사용자 템플릿(User Template)</FormLabel>
            <FormDescription>
              실행 시 전달할 입력 템플릿이며, {"{{변수}}"} 형태로 플레이스홀더를 사용합니다
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="사용자 템플릿을 입력하세요. {{변수}} 형태로 플레이스홀더 사용"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"memo" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>메모 (변경사항)</FormLabel>
            <FormControl>
              <Input placeholder="이 버전의 변경사항" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
