import { Badge } from '@/components/ui/Badge'
import type { DestinationTheme } from '@/lib/data/types'
import { THEME_LABEL, THEME_PILL } from '@/lib/utils/labels'

export function ThemeBadge({ theme }: { theme: DestinationTheme }) {
  return <Badge className={THEME_PILL}>{THEME_LABEL[theme]}</Badge>
}
