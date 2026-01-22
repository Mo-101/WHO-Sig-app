// Backend Signal Model - matches FastAPI Signal schema
export interface BackendSignal {
  id: number;
  signal_id: string;
  source: string;
  text: string;
  created_at: string;
  raw: Record<string, any>;
}

export interface SignalsResponse {
  total: number;
  limit: number;
  offset: number;
  items: BackendSignal[];
}

export interface LatestSignalsResponse {
  items: BackendSignal[];
}

// Assistant Query Response
export interface AssistantQueryRequest {
  question: string;
  tab?: string;
  ui_context?: Record<string, any>;
}

export interface AssistantQueryResponse {
  answer: string;
  plan: Record<string, any>;
  count: number;
  preview: Array<Record<string, any>>;
  found: boolean;
  status: "ok" | "not_found" | "error";
}

// Signal Classification Codes
export interface DiseaseCode {
  code: string;
  name: string;
  syndrome: string;
}

export const AFRO_DISEASES: DiseaseCode[] = [
  { code: "A00", name: "Cholera", syndrome: "AWD" },
  { code: "A01", name: "Typhoid fever", syndrome: "Febrile" },
  { code: "A20", name: "Plague", syndrome: "Febrile" },
  { code: "A80", name: "Polio", syndrome: "AFP" },
  { code: "A90", name: "Dengue", syndrome: "Febrile" },
  { code: "A92", name: "Yellow fever", syndrome: "Febrile" },
  { code: "A95", name: "Yellow fever", syndrome: "Febrile" },
  { code: "B50", name: "Malaria", syndrome: "Febrile" },
  { code: "B05", name: "Measles", syndrome: "Rash" },
  { code: "B20", name: "HIV", syndrome: "Chronic" },
  { code: "A16", name: "Tuberculosis", syndrome: "Respiratory" },
  { code: "A98", name: "Viral hemorrhagic fevers", syndrome: "Hemorrhagic" },
  { code: "A99", name: "Ebola/Marburg", syndrome: "Hemorrhagic" },
  { code: "U07", name: "COVID-19", syndrome: "Respiratory" },
  { code: "A82", name: "Rabies", syndrome: "Neurological" },
  { code: "A37", name: "Pertussis", syndrome: "Respiratory" },
  { code: "A33", name: "Neonatal tetanus", syndrome: "Neurological" },
  { code: "A39", name: "Meningococcal disease", syndrome: "Neurological" },
  { code: "B55", name: "Leishmaniasis", syndrome: "Febrile" },
  { code: "A27", name: "Leptospirosis", syndrome: "Febrile" },
  { code: "A96", name: "Lassa fever", syndrome: "Hemorrhagic" },
  { code: "A78", name: "Q fever", syndrome: "Febrile" },
  { code: "A75", name: "Typhus", syndrome: "Febrile" },
];

export const AFRO_SYNDROMES = [
  "AWD",
  "AFP",
  "ILI",
  "SARI",
  "Febrile",
  "Hemorrhagic",
  "Rash",
  "Neurological",
  "Chronic",
  "Respiratory",
];

export const AFRO_COUNTRIES = [
  "AGO", "BEN", "BWA", "BFA", "BDI", "CPV", "CMR", "CAF", "TCD", "COM",
  "COG", "CIV", "COD", "GNQ", "ERI", "ETH", "GAB", "GMB", "GHA", "GIN",
  "GNB", "KEN", "LSO", "LBR", "MDG", "MWI", "MLI", "MRT", "MUS", "MOZ",
  "NAM", "NER", "NGA", "RWA", "STP", "SEN", "SYC", "SLE", "ZAF", "SSD",
  "TZA", "TGO", "UGA", "ZMB", "ZWE", "DZA", "TUN", "LBY", "MAR", "SWZ",
];
