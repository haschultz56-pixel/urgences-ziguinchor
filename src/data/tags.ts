import { Baby, Bug, Smile, Syringe, type LucideIcon } from 'lucide-react';
import type { TagId } from '../types';

/** Treatment fields shown as tags on cards and usable as a filter, independent of the category. */
export interface TagDef {
  id: TagId;
  labelFr: string;
  labelWo: string;
  icon: LucideIcon;
}

export const TAGS: TagDef[] = [
  { id: 'maternite', labelFr: 'Maternité', labelWo: 'Wasin', icon: Baby },
  { id: 'pediatrie', labelFr: 'Pédiatrie', labelWo: 'Fajug xale', icon: Smile },
  { id: 'vaccination', labelFr: 'Vaccination', labelWo: 'Ñaq', icon: Syringe },
  { id: 'paludisme', labelFr: 'Paludisme / Fièvre', labelWo: 'Sibbiru / Tàng', icon: Bug },
];

export const tagById = (id: TagId): TagDef | undefined => TAGS.find((tag) => tag.id === id);
