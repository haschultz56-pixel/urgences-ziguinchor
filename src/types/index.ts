export type Lang = 'fr' | 'wo';

export type CategoryId =
  | 'urgence'
  | 'sante'
  | 'poste'
  | 'maternite'
  | 'cabinet'
  | 'paramedical'
  | 'dentiste'
  | 'securite'
  | 'pompiers'
  | 'services'
  | 'pharmacie'
  | 'administration'
  | 'autre';

/** Domaine de soins (tag), indépendant de la catégorie */
export type TagId = 'maternite' | 'pediatrie' | 'vaccination' | 'paludisme';

export interface SecondaryPhone {
  labelFr: string;
  labelWo: string;
  phone: string;
  phoneRaw: string;
}

export interface Department {
  id: string;
  nameFr: string;
  nameWo: string;
  phone?: string;
  phoneRaw?: string;
  extension?: string;
  contactPerson?: string;
  descriptionFr?: string;
}

export interface EmergencyContact {
  id: string;
  nameFr: string;
  nameWo: string;
  category: CategoryId;
  phone: string;
  phoneRaw: string;
  shortCode?: string;
  /** Ligne directe du service d'urgence, affichée en second bouton d'appel */
  emergencyPhone?: string;
  emergencyPhoneRaw?: string;
  secondaryPhones?: SecondaryPhone[];
  isEmergency: boolean;
  is24_7: boolean;
  district: string;
  address: string;
  descriptionFr: string;
  descriptionWo: string;
  keywordsFr: string[];
  keywordsWo: string[];
  departments?: Department[];
  /** Domaines de soins, filtrables dans la liste */
  tags?: TagId[];
  website?: string;
  whatsapp?: string;
  /** Interlocuteur / personne de contact */
  contactPerson?: string;
  /** Remarques internes : sources, points à vérifier */
  notes?: string;
  /** Visites à domicile possibles : true = oui, false = non, absent = inconnu */
  homeVisits?: boolean;
  /** Numéro confirmé par une source fiable */
  verified?: boolean;
  /** ISO date de la dernière modification */
  updatedAt?: string;
}
