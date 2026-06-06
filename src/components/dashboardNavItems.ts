import type { LucideIcon } from 'lucide-react';
import { Gauge, FileQuestion, PieChart } from 'lucide-react';

export type DashboardTabId = 'left' | 'main' | 'right';

export const dashboardNavItems: {
  id: DashboardTabId;
  icon: LucideIcon;
  labelKey: 'progress' | 'question' | 'stats';
}[] = [
  { id: 'left', icon: Gauge, labelKey: 'progress' },
  { id: 'main', icon: FileQuestion, labelKey: 'question' },
  { id: 'right', icon: PieChart, labelKey: 'stats' },
];
