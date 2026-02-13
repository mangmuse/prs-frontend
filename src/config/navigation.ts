import { Database, FileText, Home, type LucideIcon, Play, UserCircle } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { label: "홈", href: "/", icon: Home },
  { label: "프롬프트", href: "/prompts", icon: FileText },
  { label: "데이터셋", href: "/datasets", icon: Database },
  { label: "평가 프로필", href: "/profiles", icon: UserCircle },
  { label: "실행 기록", href: "/runs", icon: Play },
];
