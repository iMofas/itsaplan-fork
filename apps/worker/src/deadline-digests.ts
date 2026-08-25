import { db, notificationDelivery, telegramDeadlineDigest } from '@repo/db';
import { sql } from 'drizzle-orm';
import {
  localParts,
  message,
  shouldEnqueueDeadlineDigest,
  type DueIssue,
} from './deadline-digest-format';

type Recipient = { userId: string; chatId: string };

export async function enqueueDeadlineDigests(now = new Date()): Promise<void> {
  const local = localParts(now);
  if (!shouldEnqueueDeadlineDigest(now)) return;
  const recipients = (await db.execute(sql`
    SELECT user_id AS "userId", chat_id AS "chatId"
    FROM user_telegram_account
    WHERE daily_deadline_digest_enabled = true AND chat_id IS NOT NULL
  `)) as unknown as Recipient[];

  for (const recipient of recipients) {
    const claimed = await db
      .insert(telegramDeadlineDigest)
      .values({ userId: recipient.userId, digestDate: local.date })
      .onConflictDoNothing()
      .returning({ userId: telegramDeadlineDigest.userId });
    if (claimed.length === 0) continue;
    const issues = (await db.execute(sql`
      SELECT p.key AS "projectKey", i.sequence_number AS "sequenceNumber", i.title, i.due_date AS "dueDate"
      FROM issue i
      JOIN project p ON p.id = i.project_id
      JOIN project_member pm ON pm.project_id = i.project_id AND pm.user_id = ${recipient.userId}
      JOIN project_column c ON c.id = i.column_id
      WHERE i.assignee_user_id = ${recipient.userId}
        AND i.due_date <= ${local.date}::date
        AND c.state_type NOT IN ('completed', 'canceled')
      ORDER BY i.due_date, p.key, i.sequence_number
    `)) as unknown as DueIssue[];
    if (!issues.length) continue;
    await db.insert(notificationDelivery).values({
      projectId: null,
      channel: 'telegram',
      recipient: recipient.chatId,
      payload: { text: message(local.date, issues) },
    });
  }
}
