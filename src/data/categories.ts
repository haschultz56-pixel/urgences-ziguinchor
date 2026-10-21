import { Siren, HeartPulse, Cross, Baby, Stethoscope, Syringe, ToothbrushSparkles, ShieldCheck, Flame, Zap, Pill, Landmark, CircleEllipsis, type LucideIcon } from 'lucide-react';
import type { CategoryId } from '../types';

export interface CategoryDef {
  id: CategoryId;
  labelFr: string;
  labelWo: string;
  icon: LucideIcon;
  /** Tailwind classes for the badge / icon background */
  color: string;
  /** Tailwind classes (background + text) for the main call button, one hue per category */
  callButton: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'urgence', labelFr: 'Urgences', labelWo: 'Jamp', icon: Siren, color: 'bg-red-100 text-red-800', callButton: 'bg-red-600 text-white active:bg-red-800' },
  { id: 'sante', labelFr: 'Santé & Hôpitaux', labelWo: 'Wér-gu-yaram', icon: HeartPulse, color: 'bg-teal-100 text-teal-800', callButton: 'bg-teal-700 text-white active:bg-teal-900' },
  { id: 'poste', labelFr: 'Postes de santé', labelWo: 'Poste de santé yi', icon: Cross, color: 'bg-sky-100 text-sky-800', callButton: 'bg-sky-700 text-white active:bg-sky-900' },
  { id: 'maternite', labelFr: 'Maternités', labelWo: 'Wasin', icon: Baby, color: 'bg-pink-100 text-pink-800', callButton: 'bg-pink-600 text-white active:bg-pink-800' },
  { id: 'cabinet', labelFr: 'Cabinets médicaux', labelWo: 'Kabine doktoor', icon: Stethoscope, color: 'bg-purple-100 text-purple-800', callButton: 'bg-purple-600 text-white active:bg-purple-800' },
  { id: 'paramedical', labelFr: 'Soins paramédicaux', labelWo: 'Fajkat yi', icon: Syringe, color: 'bg-lime-100 text-lime-800', callButton: 'bg-lime-500 text-slate-900 active:bg-lime-600' },
  { id: 'dentiste', labelFr: 'Dentistes', labelWo: 'Doktooru bëñ', icon: ToothbrushSparkles, color: 'bg-cyan-100 text-cyan-800', callButton: 'bg-cyan-400 text-slate-900 active:bg-cyan-500' },
  { id: 'securite', labelFr: 'Police & Gendarmerie', labelWo: 'Polis ak Sàndarmëri', icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-800', callButton: 'bg-indigo-800 text-white active:bg-indigo-950' },
  { id: 'pompiers', labelFr: 'Sapeurs-Pompiers', labelWo: 'Pompiyee', icon: Flame, color: 'bg-orange-100 text-orange-800', callButton: 'bg-orange-600 text-white active:bg-orange-800' },
  { id: 'services', labelFr: 'Électricité & Eau', labelWo: 'Kuuraŋ ak Ndox', icon: Zap, color: 'bg-yellow-100 text-yellow-800', callButton: 'bg-yellow-400 text-slate-900 active:bg-yellow-500' },
  { id: 'pharmacie', labelFr: 'Pharmacies', labelWo: 'Farmasi', icon: Pill, color: 'bg-green-100 text-green-800', callButton: 'bg-green-600 text-white active:bg-green-800' },
  { id: 'administration', labelFr: 'Administration', labelWo: 'Njiit yi', icon: Landmark, color: 'bg-blue-100 text-blue-800', callButton: 'bg-blue-600 text-white active:bg-blue-800' },
  { id: 'autre', labelFr: 'Autres', labelWo: 'Yeneen', icon: CircleEllipsis, color: 'bg-slate-200 text-slate-800', callButton: 'bg-slate-600 text-white active:bg-slate-800' },
];

export const categoryById = (id: CategoryId): CategoryDef =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
