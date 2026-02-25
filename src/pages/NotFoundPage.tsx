import { Link } from "react-router";

export const NotFoundPage = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <title>PRS | 페이지를 찾을 수 없습니다</title>
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-lg text-muted-foreground">페이지를 찾을 수 없습니다</h2>
      <Link to="/" className="text-sm text-primary underline hover:text-primary/80">
        홈으로 돌아가기
      </Link>
    </div>
  );
};
