import { describe, expect, it } from 'bun:test';
import { localParts, message, shouldEnqueueDeadlineDigest } from '../../deadline-digest-format';

describe('deadline digests', () => {
  it('uses the Istanbul date and hour', () => {
    expect(localParts(new Date('2026-08-25T06:00:00.000Z'))).toEqual({
      date: '2026-08-25',
      hour: 9,
    });
    expect(localParts(new Date('2026-08-25T07:00:00.000Z'))).toEqual({
      date: '2026-08-25',
      hour: 10,
    });
    expect(shouldEnqueueDeadlineDigest(new Date('2026-08-25T06:00:00.000Z'))).toBeFalse();
    expect(shouldEnqueueDeadlineDigest(new Date('2026-08-25T07:00:00.000Z'))).toBeTrue();
  });

  it('groups overdue and today issues', () => {
    expect(
      message('2026-08-25', [
        {
          projectKey: 'INFR',
          sequenceNumber: 1,
          title: 'Просроченная задача',
          dueDate: '2026-08-24',
        },
        { projectKey: 'ITS', sequenceNumber: 2, title: 'Задача на сегодня', dueDate: '2026-08-25' },
      ]),
    ).toBe(
      'Дедлайны ИТС\n\nПросрочены:\n• INFR-1 Просроченная задача — 2026-08-24\n\nСегодня:\n• ITS-2 Задача на сегодня',
    );
  });
});
