'use client';

import { useTranslations } from 'next-intl';
import { SETTINGS_SECTIONS } from '@/utils/settingsSections';
import type { ShellRoute } from '@/hooks/useShellRoute';
import { useSettingsSectionText } from '@/hooks/useSectionLabels';

// The label of a Shell page that is not an issue, initiative or cycle detail. An
// /agents/:section route names its section; a page without its own label falls
// back to the project name.
export function usePageLabel() {
  const t = useTranslations('nav');
  const sectionText = useSettingsSectionText();

  return (route: ShellRoute, projectName: string): string => {
    const { sub, section, aiTeamSection } = route;
    const known = (slug: string) => SETTINGS_SECTIONS.some((s) => s.slug === slug);
    if (section) return known(section) ? sectionText(section).label : t('projectSettings');
    if (sub === 'members') return t('members');
    if (sub === 'dashboards') return t('dashboards');
    if (sub === 'initiatives') return t('initiatives');
    if (sub === 'cycles') return t('cycles');
    if (aiTeamSection) return known(aiTeamSection) ? sectionText(aiTeamSection).label : t('aiTeam');
    if (sub === 'agents') return t('aiAgents');
    if (sub === 'api') return t('api');
    return projectName;
  };
}
