const TIME_ZONE = 'Europe/Istanbul';

export type DueIssue = {
  projectKey: string;
  sequenceNumber: number;
  title: string;
  dueDate: string;
};

export function localParts(now: Date): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    hour: Number(value('hour')),
  };
}

export function shouldEnqueueDeadlineDigest(now: Date): boolean {
  return localParts(now).hour >= 10;
}

export function message(today: string, issues: DueIssue[]): string {
  const overdue = issues.filter((issue) => issue.dueDate < today);
  const todayIssues = issues.filter((issue) => issue.dueDate === today);
  const lines = ['Дедлайны ИТС'];
  if (overdue.length)
    lines.push(
      '',
      'Просрочены:',
      ...overdue.map((i) => `• ${i.projectKey}-${i.sequenceNumber} ${i.title} — ${i.dueDate}`),
    );
  if (todayIssues.length)
    lines.push(
      '',
      'Сегодня:',
      ...todayIssues.map((i) => `• ${i.projectKey}-${i.sequenceNumber} ${i.title}`),
    );
  return lines.join('\n');
}
