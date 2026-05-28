import type { SegmentWeights } from "../types";

export const SEGMENTS: Record<string, SegmentWeights> = {
  "Logística Last-Mile": {
    infra: { dens: 0.30, mob: 0.70 },
    market: { central: 0.50, pop: 0.30, idade: 0.20 },
    risk: { crime: 0.40, socio: 0.60 },
    balance: { infra: 0.40, market: 0.60 },
    alpha: 0.20,
  },
  "Restaurante": {
    infra: { dens: 0.50, mob: 0.50 },
    market: { central: 0.60, pop: 0.20, idade: 0.20 },
    risk: { crime: 0.50, socio: 0.50 },
    balance: { infra: 0.30, market: 0.70 },
    alpha: 0.30,
  },
  "Coworking": {
    infra: { dens: 0.40, mob: 0.60 },
    market: { central: 0.70, pop: 0.10, idade: 0.20 },
    risk: { crime: 0.60, socio: 0.40 },
    balance: { infra: 0.20, market: 0.80 },
    alpha: 0.25,
  },
  "Papelaria": {
    infra: { dens: 0.70, mob: 0.30 },
    market: { central: 0.20, pop: 0.60, idade: 0.20 },
    risk: { crime: 0.50, socio: 0.50 },
    balance: { infra: 0.50, market: 0.50 },
    alpha: 0.15,
  },
  "Loja Premium": {
    infra: { dens: 0.30, mob: 0.70 },
    market: { central: 0.80, pop: 0.10, idade: 0.10 },
    risk: { crime: 0.40, socio: 0.60 },
    balance: { infra: 0.15, market: 0.85 },
    alpha: 0.45,
  },
  "Farmácia": {
    infra: { dens: 0.70, mob: 0.30 },
    market: { central: 0.30, pop: 0.40, idade: 0.30 },
    risk: { crime: 0.50, socio: 0.50 },
    balance: { infra: 0.60, market: 0.40 },
    alpha: 0.10,
  },
};
