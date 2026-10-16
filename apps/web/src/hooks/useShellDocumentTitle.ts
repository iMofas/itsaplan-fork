'use client';

import { useTranslations } from 'next-intl';
import type { ShellRoute } from '@/hooks/useShellRoute';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePageLabel } from '@/hooks/usePageLabel';
import { useCycleQuery } from '@/services/cycles.service';
import { useInitiativeQuery } from '@/services/initiatives.service';
import { useIssueQuery } from '@/services/issues.service';

// The browser tab title of a Shell page: the issue open in the side panel or on its
// own page, the initiative or cycle by name, otherwise the page label and the
// project. A document page sets its own title (DocumentsPage), so it is left alone,
// even while an issue panel is still open over it.
// The issue is read by id, the cache an edit updates, so a rename reaches the tab.
export function useShellDocumentTitle({
  route,
  project,
  routeIssueId,
  panelIssueId,
}: {
  route: ShellRoute;
  project: { name: string; key: string } | null;
  routeIssueId: number | null;
  panelIssueId: number | null;
}) {
  const t = useTranslations('nav');
  const pageLabel = usePageLabel();
  const issue = useIssueQuery(panelIssueId ?? routeIssueId).data;
  const initiative = useInitiativeQuery(route.routeInitiativeId).data;
  const cycle = useCycleQuery(route.routeCycleId).data;

  function title(): string | null {
    if (!project || route.routeDocumentId != null) return null;
    if (issue) return `${issue.identifier} ${issue.title}`;
    if (route.routeIssueSeq != null) return `${project.key}-${route.routeIssueSeq}`;
    if (initiative) return initiative.title;
    if (cycle) return cycle.name;
    const label = sectionLabel() ?? pageLabel(route, project.name);
    return label === project.name ? label : `${label} · ${project.name}`;
  }

  // Pages the header names by the project alone still get their own tab label.
  function sectionLabel(): string | null {
    if (route.sub === 'docs') return t('documents');
    if (route.sub === 'notes') return t('notes');
    if (route.sub === 'inbox') return t('inbox');
    if (route.sub === 'notifications') return t('notifications');
    if (route.sub === 'mcp') return t('mcpServer');
    return null;
  }

  useDocumentTitle(title());
}
