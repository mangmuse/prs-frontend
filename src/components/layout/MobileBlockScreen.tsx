import { Monitor } from "lucide-react";

export const MobileBlockScreen = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-8 text-center md:hidden">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
      PRS
    </div>

    <Monitor className="h-16 w-16 text-muted-foreground" />

    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-foreground">PC에서 이용해 주세요</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        PRS는 데이터 테이블과 프롬프트 편집 등<br />
        데스크톱에 최적화된 서비스입니다.
      </p>
    </div>
  </div>
);
