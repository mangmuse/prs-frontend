import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { datasetQueries } from "@/queries/datasetQueries";
import type { LogicConstraint } from "@/types/common";
import { buildPaginationState } from "@/utils/pagination";

import { DatasetRowForm } from "./DatasetRowForm";

interface DatasetTableProps {
  datasetId: number;
}

const ROWS_PER_PAGE = 10;
const PAGE_GROUP_SIZE = 5;

export const DatasetTable = ({ datasetId }: DatasetTableProps) => {
  const [isAddRowOpen, setIsAddRowOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const { data, isPending, error } = useQuery(
    datasetQueries.detail(datasetId, page, ROWS_PER_PAGE),
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">로딩 중...</div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive">
        데이터를 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{data.name}</h3>
        <Button onClick={() => setIsAddRowOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />행 추가
        </Button>
      </div>

      {data.rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">아직 행이 없습니다.</p>
          <Button variant="link" className="mt-2" onClick={() => setIsAddRowOpen(true)}>
            첫 번째 행 추가하기
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Input</TableHead>
                <TableHead className="w-28">Expected</TableHead>
                <TableHead className="w-40">Tags</TableHead>
                <TableHead className="w-48">Constraints</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {(page - 1) * ROWS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell>
                    <code className="block max-w-md truncate rounded bg-muted px-2 py-1 text-xs">
                      {JSON.stringify(row.inputData)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.expectedOutput === "TRUE"
                          ? "default"
                          : row.expectedOutput === "FALSE"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {row.expectedOutput}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ConstraintsSummary constraints={row.rowConstraints} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data.pagination.totalPages > 1 && (
        <DatasetPagination
          page={page}
          totalPages={data.pagination.totalPages}
          totalCount={data.pagination.totalCount}
          onPageChange={setPage}
        />
      )}

      <DatasetRowForm datasetId={datasetId} open={isAddRowOpen} onOpenChange={setIsAddRowOpen} />
    </div>
  );
};

const ConstraintsSummary = ({ constraints }: { constraints: LogicConstraint[] | null }) => {
  if (!constraints || constraints.length === 0) {
    return <span className="text-xs text-muted-foreground">없음</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {constraints.map((c, i) => (
        <Badge key={i} variant="outline" className="text-xs">
          {c.type}
        </Badge>
      ))}
    </div>
  );
};

interface DatasetPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const DatasetPagination = ({
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
