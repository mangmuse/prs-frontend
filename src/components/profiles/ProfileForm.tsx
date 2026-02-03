import type { Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

import type { ProfileFormData } from "./profileSchema";

interface ProfileFormProps {
  control: Control<ProfileFormData>;
}

export const ProfileForm = ({ control }: ProfileFormProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>프로필 이름</FormLabel>
            <FormControl>
              <Input placeholder="예: 엄격한 평가, 관대한 평가" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>설명</FormLabel>
            <FormControl>
              <Textarea placeholder="이 프로필의 용도를 설명하세요" rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="semanticThreshold"
        render={({ field }) => (
          <FormItem>
            <FormLabel>유사도 임계값: {Math.round(field.value * 100)}%</FormLabel>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={(v: number[]) => field.onChange(v[0])}
                min={0}
                max={1}
                step={0.05}
                className="mt-2"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              AI 응답과 Expected의 의미적 유사도 합격선
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
