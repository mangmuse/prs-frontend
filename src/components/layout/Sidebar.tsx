import { Link, useLocation } from "react-router";

import { ScrollArea } from "@/components/ui/scroll-area";
import { mainNavItems, statsItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const location = useLocation();

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

      {/* Stats */}
      <div className="border-t px-3 py-4">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 px-3">Stats</div>
        <div className="flex flex-col gap-2">
          {statsItems.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
              <span className="text-sm font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
