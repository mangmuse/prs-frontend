import { describe, expect, it } from "vitest";

import { extractTemplateVariables } from "../templateUtils";

describe("extractTemplateVariables", () => {
  it("단일 변수를 추출해야 한다", () => {
    expect(extractTemplateVariables("Hello {{name}}")).toEqual(["name"]);
  });

  it("여러 변수를 추출해야 한다", () => {
    expect(extractTemplateVariables("{{claim}} - {{source}}")).toEqual(["claim", "source"]);
  });

  it("중복 변수는 한 번만 반환해야 한다", () => {
    expect(extractTemplateVariables("{{x}} and {{x}}")).toEqual(["x"]);
  });

  it("변수가 없으면 빈 배열을 반환해야 한다", () => {
    expect(extractTemplateVariables("no variables here")).toEqual([]);
  });

  it("불완전한 중괄호는 추출하지 않아야 한다", () => {
    expect(extractTemplateVariables("{name}")).toEqual([]);
    expect(extractTemplateVariables("{{name}")).toEqual([]);
  });
});
