import React from 'react';
import {
  SustainableIcon,
  EcoFriendlyIcon,
  EthicalProductionIcon,
  LocalMadeIcon,
  ArtisanIcon,
  FairTradeIcon,
  OrganicIcon,
  CrueltyFreeIcon,
  VeganIcon,
  InnovativeIcon,
  TechForwardIcon,
  HandmadeIcon
} from '@/components/icons/CauseIcons';

export interface Cause {
  id: string;
  name: string;
  icon: JSX.Element;
}

export const causes: Cause[] = [
  {
    id: 'sustainable',
    name: 'Sustainable',
    icon: <SustainableIcon />
  },

  {
    id: 'eco-friendly',
    name: 'Eco-Friendly',
    icon: <EcoFriendlyIcon />
  },
  {
    id: 'ethical-production',
    name: 'Ethical Production',
    icon: <EthicalProductionIcon />
  },
  {
    id: 'local-made',
    name: 'Locally Made',
    icon: <LocalMadeIcon />
  },
  {
    id: 'artisan',
    name: 'Artisan',
    icon: <ArtisanIcon />
  },
  {
    id: 'fair-trade',
    name: 'Fair Trade',
    icon: <FairTradeIcon />
  },
  {
    id: 'organic',
    name: 'Organic',
    icon: <OrganicIcon />
  },
  {
    id: 'cruelty-free',
    name: 'Cruelty Free',
    icon: <CrueltyFreeIcon />
  },
  {
    id: 'vegan',
    name: 'Vegan',
    icon: <VeganIcon />
  },
  {
    id: 'innovative',
    name: 'Innovative',
    icon: <InnovativeIcon />
  },
  {
    id: 'tech-forward',
    name: 'Tech Forward',
    icon: <TechForwardIcon />
  },
  {
    id: 'handmade',
    name: 'Handmade',
    icon: <HandmadeIcon />
  }
];
