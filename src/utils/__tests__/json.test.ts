import { isJsonString, tryFormatJson } from "../json";

describe("isJsonString", () => {
  it("객체 형태의 JSON 문자열을 감지한다", () => {
    expect(isJsonString('{"key": "value"}')).toBe(true);
  });

  it("배열 형태의 JSON 문자열을 감지한다", () => {
    expect(isJsonString('["a", "b"]')).toBe(true);
  });

  it("일반 문자열은 false를 반환한다", () => {
    expect(isJsonString("hello world")).toBe(false);
  });

  it("앞뒤 공백이 있어도 감지한다", () => {
    expect(isJsonString('  {"key": "value"}  ')).toBe(true);
  });
});

describe("tryFormatJson", () => {
  it("유효한 JSON을 포맷팅한다", () => {
    const result = tryFormatJson('{"a":1}');
    expect(result).toBe('{\n  "a": 1\n}');
  });

  it("유효하지 않은 JSON은 원본을 반환한다", () => {
    const result = tryFormatJson("not json");
    expect(result).toBe("not json");
  });
});
