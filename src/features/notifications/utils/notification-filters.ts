import type { AppNotification } from '@/types/domain/notification';

export type NotificationGroup = {
  key: string;
  label: string;
  items: AppNotification[];
};

export function groupNotificationsByDate(items: AppNotification[]): NotificationGroup[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const buckets: Record<string, AppNotification[]> = {
    today: [],
    yesterday: [],
    week: [],
    earlier: [],
  };

  for (const item of items) {
    const created = new Date(item.createdAt);
    if (created >= startOfToday) {
      buckets.today.push(item);
    } else if (created >= startOfYesterday) {
      buckets.yesterday.push(item);
    } else if (created >= startOfWeek) {
      buckets.week.push(item);
    } else {
      buckets.earlier.push(item);
    }
  }

  const groups: NotificationGroup[] = [];
  if (buckets.today.length) groups.push({ key: 'today', label: 'Today', items: buckets.today });
  if (buckets.yesterday.length) {
    groups.push({ key: 'yesterday', label: 'Yesterday', items: buckets.yesterday });
  }
  if (buckets.week.length) {
    groups.push({ key: 'week', label: 'This week', items: buckets.week });
  }
  if (buckets.earlier.length) {
    groups.push({ key: 'earlier', label: 'Earlier', items: buckets.earlier });
  }
  return groups;
}
