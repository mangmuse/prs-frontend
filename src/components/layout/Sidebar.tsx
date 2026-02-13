import { Link, useLocation, useNavigate } from "react-router";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { authApi } from "@/api/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mainNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { authQueries } from "@/queries/authQueries";
import { datasetQueries } from "@/queries/datasetQueries";
import { profileQueries } from "@/queries/profileQueries";
import { promptQueries } from "@/queries/promptQueries";
import { runQueries } from "@/queries/runQueries";
import { useHasAnyKey } from "@/stores/apiKeyStore";
import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

const USER_SCOPE_QUERY_KEYS = [
  authQueries.all(),
  datasetQueries.all(),
  promptQueries.all(),
  profileQueries.all(),
  runQueries.all(),
] as const;

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasAnyKey = useHasAnyKey();
  const { isGuest, isAuthenticated, setGuest } = useAuthStore(
    useShallow((s) => ({
      isGuest: s.isGuest,
      isAuthenticated: s.isAuthenticated,
      setGuest: s.setGuest,
    })),
  );
  const { data: user } = useQuery({
    ...authQueries.me(),
    enabled: isAuthenticated && !isGuest,
  });

  const handleLogout = async () => {
    const createGuestSessionWithRetry = async () => {
      try {
        await authApi.createGuestSession();
        return;
      } catch {
        // 1회 재시도
      }

      try {
        await authApi.createGuestSession();
      } catch {
        toast.error("게스트 세션 생성에 실패했습니다. 새로고침 후 다시 시도해주세요.");
      }
    };

    try {
      await authApi.logout();
    } catch {
      // 서버 실패해도 로컬 로그아웃 진행
    }

    setGuest();
    for (const queryKey of USER_SCOPE_QUERY_KEYS) {
      queryClient.removeQueries({ queryKey });
    }

    void navigate("/", { replace: true });
    void createGuestSessionWithRetry();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          PRS
        </div>
        <span className="text-sm font-medium text-muted-foreground">Prompt Regression Studio</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Auth Section */}
      <div className="border-t px-3 py-3 space-y-1">
        {isGuest && (
          <a
            href={`${API_BASE_URL}/auth/google`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Google로 로그인
          </a>
        )}

        {isAuthenticated && !isGuest && user && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.pictureUrl ?? undefined} alt={user.name ?? ""} />
              <AvatarFallback className="text-xs">
                {user.name?.charAt(0) ?? user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-sm font-medium">{user.name ?? user.email}</span>
            <button
              onClick={() => void handleLogout()}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            location.pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="h-4 w-4" />
          설정
          <span
            className={cn(
              "ml-auto h-2 w-2 rounded-full",
              hasAnyKey ? "bg-green-500" : "bg-gray-300",
            )}
          />
        </Link>
      </div>
    </aside>
  );
};
