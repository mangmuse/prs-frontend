import { useNavigate, useSearchParams } from "react-router";

import { useAuthCallback } from "@/hooks/auth/useAuthCallback";
import { useMigrate } from "@/hooks/mutations/authMutations";

const CallbackLoading = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-gray-500">{message}</div>
  </div>
);

const CallbackError = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center space-y-2">
      <div className="text-red-500 font-medium">{title}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  </div>
);

const CallbackMessage = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center space-y-2">
      <div className="text-gray-700 font-medium">{message}</div>
    </div>
  </div>
);

const MigrationPrompt = ({
  onMigrate,
  onSkip,
  isPending,
}: {
  onMigrate: () => void;
  onSkip: () => void;
  isPending: boolean;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">게스트 데이터 이전</h2>
      <p className="text-sm text-gray-600">
        게스트로 작성한 데이터를 회원 계정으로 이전하시겠습니까?
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onSkip}
          disabled={isPending}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          건너뛰기
        </button>
        <button
          onClick={onMigrate}
          disabled={isPending}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "이전 중..." : "이전하기"}
        </button>
      </div>
    </div>
  </div>
);

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  const { isExchanging, exchangeError, wasGuest, isAuthenticated } = useAuthCallback(code);
  const migrate = useMigrate();

  if (!code) {
    return <CallbackError title="인증 코드가 없습니다" />;
  }

  if (exchangeError) {
    return <CallbackError title="토큰 교환에 실패했습니다" subtitle="홈으로 이동합니다..." />;
  }

  if (migrate.isSuccess) {
    const total =
      migrate.data.datasets + migrate.data.prompts + migrate.data.profiles + migrate.data.runs;
    return <CallbackMessage message={`${total}건의 데이터가 이전되었습니다.`} />;
  }

  if (migrate.isError) {
    return <CallbackMessage message="마이그레이션에 실패했습니다. 나중에 다시 시도해주세요." />;
  }

  if (wasGuest && isAuthenticated) {
    return (
      <MigrationPrompt
        isPending={migrate.isPending}
        onMigrate={() =>
          migrate.mutate(undefined, {
            onSuccess: () => setTimeout(() => navigate("/", { replace: true }), 2000),
            onError: () => setTimeout(() => navigate("/", { replace: true }), 3000),
          })
        }
        onSkip={() => void navigate("/", { replace: true })}
      />
    );
  }

  return <CallbackLoading message={isExchanging ? "로그인 처리 중..." : "리다이렉트 중..."} />;
};
