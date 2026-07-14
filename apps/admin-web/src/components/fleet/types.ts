import { LucideIcon } from 'lucide-react';

export interface FleetType {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
}

export interface PlanOption {
  value: string;
  label: string;
  price: string;
  features: string[];
}

export interface FleetTypeCardProps {
  type: FleetType;
  onClick: (typeId: string) => void;
  isSelected?: boolean;
  showFeatures?: boolean;
}

export interface PlanSelectionProps {
  plans: PlanOption[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
  type: string;
}
