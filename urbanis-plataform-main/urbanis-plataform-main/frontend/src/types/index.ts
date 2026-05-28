export interface DistrictData {
  nm_dist: string;
  n_mob: number;
  n_stations: number;
  dens_demog: number;
  populacao: number;
  id_media: number;
  n_crime: number;
  socio_vulnerability_score: number;
  dens_norm: number;
  mob_norm: number;
  central_raw: number;
  central_norm: number;
  pop_norm: number;
  idade_norm: number;
  crime_norm: number;
  vulner_norm: number;
  // Calculated dynamically
  InfraScore?: number;
  MarketScore?: number;
  OpportunityScore?: number;
  RiskScore?: number;
  UrbanScore?: number;
}

export interface SegmentWeights {
  infra: { dens: number; mob: number };
  market: { central: number; pop: number; idade: number };
  risk: { crime: number; socio: number };
  balance: { infra: number; market: number };
  alpha: number;
}
