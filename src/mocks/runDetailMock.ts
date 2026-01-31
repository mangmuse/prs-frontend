import type { RunDetailData } from "@/types/runDetail";

const systemInstruction = `당신은 전문 팩트체커입니다.

## 핵심 규칙
1. 주어진 주장에 대해 사실 여부를 판단하세요.
2. 응답은 반드시 TRUE 또는 FALSE로만 하세요.
3. 판단이 불확실한 경우 FALSE로 응답하세요.

## 판단 기준
- 과학적으로 검증된 사실: TRUE
- 널리 알려진 상식적 사실: TRUE
- 검증 불가능한 주장: FALSE
- 명백한 거짓: FALSE`;

export const mockRunDetail: RunDetailData = {
  id: 34,
  promptName: "팩트체커",
  versionNumber: 3,
  datasetName: "테스트셋",
  status: "completed",
  createdAt: "2026-01-31T10:30:00Z",
  profile: {
    id: 1,
    name: "기본 프로필",
    semanticThreshold: 0.7,
    globalConstraints: [],
  },
  metrics: {
    passRate: 0.667,
    formatPassRate: 1.0,
    semanticPassRate: 0.667,
    logicPassRate: 1.0,
    avgSemantic: 0.823,
  },
  results: [
    {
      id: 101,
      rowIndex: 1,
      datasetRowId: 1,
      inputSnapshot: {
        claim: "지구는 둥글다",
        source: "NASA",
      },
      expectedSnapshot: "TRUE",
      rawOutput: "TRUE",
      parsedOutput: null,
      status: "pass",
      isFormatPassed: true,
      semanticScore: 1.0,
      logicResults: {
        passed: true,
        results: [{ constraintType: "contains", target: "TRUE", passed: true, message: null }],
        errorMessage: null,
      },
      assembledPrompt: {
        systemInstruction,
        userMessage: `다음 주장을 검증하세요:

주장: 지구는 둥글다
출처: NASA

응답 형식: TRUE 또는 FALSE`,
      },
    },
    {
      id: 102,
      rowIndex: 2,
      datasetRowId: 2,
      inputSnapshot: {
        claim: "태양은 지구 주위를 돈다",
        source: "고대 천문학",
      },
      expectedSnapshot: "FALSE",
      rawOutput: "FALSE",
      parsedOutput: null,
      status: "pass",
      isFormatPassed: true,
      semanticScore: 1.0,
      logicResults: {
        passed: true,
        results: [{ constraintType: "contains", target: "FALSE", passed: true, message: null }],
        errorMessage: null,
      },
      assembledPrompt: {
        systemInstruction,
        userMessage: `다음 주장을 검증하세요:

주장: 태양은 지구 주위를 돈다
출처: 고대 천문학

응답 형식: TRUE 또는 FALSE`,
      },
    },
    {
      id: 103,
      rowIndex: 3,
      datasetRowId: 3,
      inputSnapshot: {
        claim: "물은 100도에서 끓는다",
        source: "물리학 교과서",
      },
      expectedSnapshot: "TRUE",
      rawOutput: `{
  "verdict": "TRUE",
  "confidence": 0.95,
  "reasoning": "표준 대기압에서 물의 끓는점은 100°C입니다."
}`,
      parsedOutput: null,
      status: "semantic",
      isFormatPassed: true,
      semanticScore: 0.45,
      logicResults: {
        passed: true,
        results: [{ constraintType: "contains", target: "TRUE", passed: true, message: null }],
        errorMessage: null,
      },
      assembledPrompt: {
        systemInstruction,
        userMessage: `다음 주장을 검증하세요:

주장: 물은 100도에서 끓는다
출처: 물리학 교과서

응답 형식: TRUE 또는 FALSE`,
      },
    },
    {
      id: 104,
      rowIndex: 4,
      datasetRowId: 4,
      inputSnapshot: {
        document: `인공지능(AI)은 인간의 학습능력, 추론능력, 지각능력, 자연언어의 이해능력 등을 컴퓨터 프로그램으로 실현한 기술이다.`,
        question: "현재 상용화된 AI 서비스는 대부분 어떤 유형의 AI인가?",
        context: "AI 기술 분류",
      },
      expectedSnapshot: "약인공지능(Weak AI)",
      rawOutput: "약인공지능(Weak AI)",
      parsedOutput: null,
      status: "pass",
      isFormatPassed: true,
      semanticScore: 0.98,
      logicResults: {
        passed: true,
        results: [
          { constraintType: "contains", target: "약인공지능", passed: true, message: null },
        ],
        errorMessage: null,
      },
      assembledPrompt: {
        systemInstruction,
        userMessage: `문서를 읽고 질문에 답하세요.`,
      },
    },
    {
      id: 105,
      rowIndex: 5,
      datasetRowId: 5,
      inputSnapshot: {
        json_data: JSON.stringify({
          user_id: "u_12345",
          session: { start: "2026-01-31T09:00:00Z", end: "2026-01-31T10:30:00Z" },
        }),
        task: "사용자 행동 분석",
        output_format: "summary",
      },
      expectedSnapshot: '{"action": "submit", "engagement": "high"}',
      rawOutput: '{"action": "submit", "engagement": "high"}',
      parsedOutput: { action: "submit", engagement: "high" },
      status: "pass",
      isFormatPassed: true,
      semanticScore: 1.0,
      logicResults: {
        passed: true,
        results: [],
        errorMessage: null,
      },
      assembledPrompt: {
        systemInstruction,
        userMessage: `JSON 데이터를 분석하고 요약하세요.`,
      },
    },
    {
      id: 106,
      rowIndex: 6,
      datasetRowId: 6,
      inputSnapshot: {
        claim: "비트코인은 2024년에 처음 만들어졌다",
        source: "익명 블로그",
      },
      expectedSnapshot: "FALSE",
      rawOutput: "아마도 FALSE일 것 같습니다. 비트코인은 2009년에...",
      parsedOutput: null,
      status: "format",
      isFormatPassed: false,
      semanticScore: 0,
      logicResults: {
        passed: false,
        results: [],
        errorMessage: null,
      },
      assembledPrompt: {
        systemInstruction,
        userMessage: `다음 주장을 검증하세요:

주장: 비트코인은 2024년에 처음 만들어졌다
출처: 익명 블로그

응답 형식: TRUE 또는 FALSE`,
      },
    },
  ],
};
