export const getPageGroup = (
  currentPage: number,
  totalPages: number,
  groupSize: number,
): number[] => {
  const groupIndex = Math.floor((currentPage - 1) / groupSize);
  const start = groupIndex * groupSize + 1;
  const end = Math.min(start + groupSize - 1, totalPages);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const buildPaginationState = (page: number, totalPages: number, pageGroupSize: number) => {
  const pageNumbers = getPageGroup(page, totalPages, pageGroupSize);
  const currentGroupStart = pageNumbers[0];
  const currentGroupEnd = pageNumbers[pageNumbers.length - 1] ?? currentGroupStart;

  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;
  const isFirstGroup = currentGroupStart === 1;
  const isLastGroup = currentGroupEnd === totalPages;

  const prevGroupFirstPage = Math.max(1, currentGroupStart - pageGroupSize);
  const nextGroupFirstPage = Math.min(totalPages, currentGroupEnd + 1);

  return {
    pageNumbers,
    isFirstPage,
    isLastPage,
    isFirstGroup,
    isLastGroup,
    prevGroupFirstPage,
    nextGroupFirstPage,
  };
};
