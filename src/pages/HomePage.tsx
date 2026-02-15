import { Link } from "react-router";

import {
  ArrowRight,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Database,
  FileText,
  Key,
  Play,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useHasAnyKey } from "@/stores/apiKeyStore";

const steps = [
  {
    icon: FileText,
    title: "1. 프롬프트 작성",
    description:
      "AI에게 보낼 지시문을 작성합니다. System Instruction과 User Template을 분리하여 관리하고, 버전별로 변경 이력을 추적할 수 있습니다.",
    href: "/prompts",
    buttonLabel: "프롬프트 관리",
    tips: [
      "사용자 템플릿에 {{변수명}}을 넣으면 데이터셋의 입력 키와 자동 매핑됩니다.",
      "출력 형식(JSON Object, Label 등)을 지정하면 출력형식 검증 단계에서 형식을 자동으로 체크합니다.",
      "프롬프트는 수정이 아닌 새 버전 생성 방식입니다. 이전 버전과 비교하여 회귀 분석이 가능합니다.",
    ],
  },
  {
    icon: Database,
    title: "2. 데이터셋 준비",
    description:
      "테스트할 입력-기대출력 쌍을 준비합니다. 같은 프롬프트를 다양한 입력으로 테스트하여 품질을 검증합니다.",
    href: "/datasets",
    buttonLabel: "데이터셋 관리",
    tips: [
      "Input의 키 이름을 프롬프트의 {{변수명}}과 동일하게 맞춰주세요.",
      "기대값은 유사도 채점의 기준이 됩니다.",
      "행별로 제약조건(포함 문자열, 숫자 범위 등)을 개별 설정할 수 있습니다.",
    ],
  },
  {
    icon: UserCircle,
    title: "3. 평가 프로필 설정",
    description:
      "채점 기준을 정의합니다. 의미 유사도 임계값과 출력 제약 조건(포함 문자열, 숫자 범위 등)을 설정합니다.",
    href: "/profiles",
    buttonLabel: "프로필 관리",
    tips: [
      "유사도 임계값은 AI 응답과 기대값의 의미적 유사도 합격선입니다. 높을수록 엄격합니다.",
      "제약조건은 모든 데이터셋 row에 공통으로 적용되는 출력 규칙입니다.",
      "실행 후 결과 화면에서 임계값을 실시간으로 조정하며 최적값을 찾을 수 있습니다.",
    ],
  },
] as const;

export const HomePage = () => {
  const hasAnyKey = useHasAnyKey();

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
        <h1 className="text-xl font-semibold tracking-tight">Prompt Regression Studio</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* 소개 */}
          <section className="text-center">
            <h2 className="text-2xl font-bold">프롬프트 품질을 데이터로 관리하세요</h2>
            <p className="mt-2 text-muted-foreground">
              프롬프트를 수정할 때마다 기존 테스트 케이스에 대한 품질을 자동으로 검증합니다.
            </p>
          </section>

          {/* 플로우 시각화 */}
          <section className="flex items-center justify-center gap-3">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {step.title.split(". ")[1]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">실행</span>
            </div>
          </section>

          {/* 스텝 카드 */}
          <section className="grid grid-cols-3 gap-4">
            {steps.map((step) => (
              <Card key={step.title} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <step.icon className="h-5 w-5 text-primary" />
                    {step.title}
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={step.href}>
                      {step.buttonLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Collapsible>
                    <CollapsibleTrigger className="flex w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors [&[data-state=open]>svg]:rotate-180">
                      <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                      자세히 보기
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-2 space-y-1.5 border-t pt-2">
                        {step.tips.map((tip) => (
                          <li key={tip} className="text-xs text-muted-foreground leading-relaxed">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* API 키 안내 */}
          <Card
            className={
              hasAnyKey ? "border-green-200 bg-green-50/50" : "border-amber-300 bg-amber-50"
            }
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {hasAnyKey ? (
                  <CircleCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <CircleAlert className="h-5 w-5 text-amber-600" />
                )}
                <Key className={`h-4 w-4 ${hasAnyKey ? "text-green-600" : "text-amber-600"}`} />
                {hasAnyKey ? "API 키가 설정되었습니다" : "API 키를 먼저 설정하세요"}
              </CardTitle>
              <CardDescription>
                {hasAnyKey
                  ? "설정 페이지에서 API 키를 변경하거나 추가할 수 있습니다."
                  : "실행하려면 LLM 제공자(OpenAI, Anthropic 등)의 API 키가 필요합니다. 설정 페이지에서 등록하세요."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className={
                  hasAnyKey
                    ? "border-green-300 hover:bg-green-100"
                    : "border-amber-400 bg-white hover:bg-amber-100"
                }
                asChild
              >
                <Link to="/settings">
                  설정 페이지로 이동
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 실행 카드 */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Play className="h-5 w-5 text-green-600" />
                준비가 되면 실행하세요
              </CardTitle>
              <CardDescription>
                프롬프트, 데이터셋, 평가 프로필을 조합하여 평가를 실행합니다. 출력형식 → 유사도 →
                제약조건 3단계 채점으로 품질을 검증합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-green-300 hover:bg-green-100" asChild>
                <Link to="/runs">
                  실행 기록 보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
