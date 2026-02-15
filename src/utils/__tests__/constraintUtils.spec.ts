import { describe, expect, it } from "vitest";

import { getConstraintValueDisplay, getDefaultConstraint } from "../constraintUtils";

describe("getConstraintValueDisplay", () => {
  it("contains 타입은 value를 반환해야 한다", () => {
    expect(getConstraintValueDisplay({ type: "contains", target: "output", value: "hello" })).toBe(
      "hello",
    );
  });

  it("not_contains 타입은 value를 반환해야 한다", () => {
    expect(
      getConstraintValueDisplay({ type: "not_contains", target: "output", value: "bad" }),
    ).toBe("bad");
  });

  it("range 타입은 'min ~ max' 형식을 반환해야 한다", () => {
    expect(getConstraintValueDisplay({ type: "range", target: "output", min: 1, max: 10 })).toBe(
      "1 ~ 10",
    );
  });

  it("range 타입에서 한쪽만 null이면 '-'로 대체해야 한다", () => {
    expect(getConstraintValueDisplay({ type: "range", target: "output", min: 5, max: null })).toBe(
      "5 ~ -",
    );
    expect(getConstraintValueDisplay({ type: "range", target: "output", min: null, max: 10 })).toBe(
      "- ~ 10",
    );
  });

  it("range 타입에서 min/max 모두 null이면 null을 반환해야 한다", () => {
    expect(
      getConstraintValueDisplay({ type: "range", target: "output", min: null, max: null }),
    ).toBeNull();
  });

  it("regex 타입은 pattern을 반환해야 한다", () => {
    expect(getConstraintValueDisplay({ type: "regex", target: "output", pattern: "^\\d+$" })).toBe(
      "^\\d+$",
    );
  });

  it("max_length 타입은 'max N' 형식을 반환해야 한다", () => {
    expect(getConstraintValueDisplay({ type: "max_length", target: "output", max: 100 })).toBe(
      "max 100",
    );
  });

  it("빈 문자열 value는 null을 반환해야 한다", () => {
    expect(getConstraintValueDisplay({ type: "contains", target: "output", value: "" })).toBeNull();
    expect(getConstraintValueDisplay({ type: "regex", target: "output", pattern: "" })).toBeNull();
  });
});

describe("getDefaultConstraint", () => {
  it("각 타입별 기본값을 올바르게 생성해야 한다", () => {
    expect(getDefaultConstraint("contains")).toEqual({
      type: "contains",
      target: "",
      value: "",
    });
    expect(getDefaultConstraint("not_contains")).toEqual({
      type: "not_contains",
      target: "",
      value: "",
    });
    expect(getDefaultConstraint("range")).toEqual({
      type: "range",
      target: "",
      min: null,
      max: null,
    });
    expect(getDefaultConstraint("regex")).toEqual({
      type: "regex",
      target: "",
      pattern: "",
    });
    expect(getDefaultConstraint("max_length")).toEqual({
      type: "max_length",
      target: "",
      max: 100,
    });
  });
});
