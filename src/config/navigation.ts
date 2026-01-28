import { BarChart3, Database, FileText, type LucideIcon, Play, UserCircle } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { label: "Prompts", href: "/prompts", icon: FileText },
  { label: "Datasets", href: "/datasets", icon: Database },
  { label: "Profiles", href: "/profiles", icon: UserCircle },
  { label: "Runs", href: "/runs", icon: Play },
];

export const statsItems: StatItem[] = [
  { label: "Total Runs", value: "0", icon: BarChart3 },
  { label: "Avg Pass Rate", value: "0%", icon: BarChart3 },
];
