import type { Control } from "react-hook-form";

import { ProfileConstraintsList } from "@/components/profiles/ProfileConstraintsList";
import { ProfileForm } from "@/components/profiles/ProfileForm";
import type { ProfileFormData } from "@/components/profiles/profileSchema";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LiveProfileEditorPanelProps {
  control: Control<ProfileFormData>;
}

export const LiveProfileEditorPanel = ({ control }: LiveProfileEditorPanelProps) => {
  return (
    <Card className="h-full overflow-hidden border-r bg-white rounded-none border-y-0 border-l-0">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="text-base font-medium">프로필 설정</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 p-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">기본 정보 & 유사도 기준</h4>
            <ProfileForm control={control} />
          </div>

          <Separator />

          <div className="space-y-4">
            <ProfileConstraintsList control={control} />
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
