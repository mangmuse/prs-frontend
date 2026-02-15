import { describe, expect, it } from "vitest";

import { buildPaginationState, getPageGroup } from "../pagination";

describe("getPageGroup", () => {
  it("첫 번째 그룹의 페이지 번호를 반환해야 한다", () => {
    expect(getPageGroup(1, 20, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("두 번째 그룹의 페이지 번호를 반환해야 한다", () => {
    expect(getPageGroup(6, 20, 5)).toEqual([6, 7, 8, 9, 10]);
  });

  it("마지막 그룹이 groupSize보다 작으면 남은 페이지만 반환해야 한다", () => {
    expect(getPageGroup(9, 9, 5)).toEqual([6, 7, 8, 9]);
  });

  it("단일 페이지면 [1]을 반환해야 한다", () => {
    expect(getPageGroup(1, 1, 5)).toEqual([1]);
  });
});

describe("buildPaginationState", () => {
  it("첫 페이지에서 isFirstPage/isFirstGroup이 true여야 한다", () => {
    const state = buildPaginationState(1, 20, 5);
    expect(state.isFirstPage).toBe(true);
    expect(state.isFirstGroup).toBe(true);
    expect(state.isLastPage).toBe(false);
    expect(state.isLastGroup).toBe(false);
  });

  it("마지막 페이지에서 isLastPage/isLastGroup이 true여야 한다", () => {
    const state = buildPaginationState(20, 20, 5);
    expect(state.isLastPage).toBe(true);
    expect(state.isLastGroup).toBe(true);
  });

  it("중간 페이지에서 모든 경계 플래그가 false여야 한다", () => {
    const state = buildPaginationState(8, 20, 5);
    expect(state.isFirstPage).toBe(false);
    expect(state.isLastPage).toBe(false);
    expect(state.isFirstGroup).toBe(false);
    expect(state.isLastGroup).toBe(false);
  });

  it("이전/다음 그룹 첫 페이지를 올바르게 계산해야 한다", () => {
    const state = buildPaginationState(8, 20, 5);
    expect(state.prevGroupFirstPage).toBe(1);
    expect(state.nextGroupFirstPage).toBe(11);
  });

  it("단일 페이지면 모든 경계 플래그가 true여야 한다", () => {
    const state = buildPaginationState(1, 1, 5);
    expect(state.isFirstPage).toBe(true);
    expect(state.isLastPage).toBe(true);
    expect(state.isFirstGroup).toBe(true);
    expect(state.isLastGroup).toBe(true);
  });
});
