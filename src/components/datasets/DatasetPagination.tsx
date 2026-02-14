import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { buildPaginationState } from "@/utils/pagination";

const PAGE_GROUP_SIZE = 5;

interface DatasetPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const DatasetPagination = ({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: DatasetPaginationProps) => {
  const {
    pageNumbers,
    isFirstPage,
    isLastPage,
    isFirstGroup,
    isLastGroup,
    prevGroupFirstPage,
    nextGroupFirstPage,
  } = buildPaginationState(page, totalPages, PAGE_GROUP_SIZE);

  const disabledClass = "pointer-events-none opacity-50";
  const navClass = (disabled: boolean) => cn("cursor-pointer", disabled && disabledClass);

  const handleNavClick = (targetPage: number, disabled: boolean) => () => {
    if (disabled) return;
    onPageChange(targetPage);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst
              onClick={handleNavClick(1, isFirstPage)}
              className={navClass(isFirstPage)}
              aria-disabled={isFirstPage}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              onClick={handleNavClick(prevGroupFirstPage, isFirstGroup)}
              className={navClass(isFirstGroup)}
              aria-disabled={isFirstGroup}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={page === pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "cursor-pointer",
                  page === pageNum &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                )}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={handleNavClick(nextGroupFirstPage, isLastGroup)}
              className={navClass(isLastGroup)}
              aria-disabled={isLastGroup}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLast
              onClick={handleNavClick(totalPages, isLastPage)}
              className={navClass(isLastPage)}
              aria-disabled={isLastPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <span className="text-sm text-muted-foreground">총 {totalCount}개</span>
    </div>
  );
};
