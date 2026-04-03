import React from 'react';

export enum FuelType {
  GASOLINE = 'Gasolina',
  ETHANOL = 'Etanol',
  DIESEL = 'Diesel',
  CNG = 'GNV'
}

export enum ExpenseCategory {
    LAVAGEM = 'Lavagem',
    SEGURO = 'Seguro',
    FINANCIAMENTO = 'Financiamento',
    IMPOSTOS = 'Impostos/IPVA',
    ALIMENTACAO = 'Alimentação',
    INTERNET = 'Internet/Celular',
    OUTROS = 'Outros'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  whatsapp?: string;
  userId: string;
  email?: string;
  pixKey?: string;
  isSetupComplete: boolean;
  wantsPartnerDiscounts?: boolean;
  isLoggedIn?: boolean;
}

export interface Vehicle {
  id: string; // Unique ID for each vehicle
  model: string;
  year: string;
  plate: string;
  avgConsumptionCity: number; // km/l
  avgConsumptionHighway: number; // km/l
  trips: Trip[];
  maintenance: MaintenanceItem[];
  activeTripId: string | null;
  fuelTankCapacityLiters?: number;
  oilType?: string;
}

export interface GasStation {
  id: string;
  name: string;
  price: number;
  fuelType: FuelType;
  isFavorite: boolean;
  dateUpdated: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// Represents a work shift/day, not an individual ride.
export interface Trip {
  id: string;
  startTime: string;
  endTime?: string;
  startOdometer: number;
  endOdometer?: number;
  distance?: number;
  earnings?: number; // Valor recebido da corrida
  cost?: number; // Custo calculado
  profit?: number;
  fuelPriceUsed?: number;
  status: 'active' | 'completed';
  consumption?: number; // km/l for the trip
}

export interface MaintenanceItem {
  id: string;
  name: string; // e.g., Troca de Óleo
  date: string; // Date the service was performed
  cost: number;
  lastServiceOdometer?: number; // Odometer at time of service
  nextRevisionKm?: number; // KM to do it again (calculated)
  nextRevisionDate?: string; // Date to do it again (calculated)
  intervalKm?: number; // Interval used for calculation
  intervalMonths?: number; // Interval used for calculation
  completed: boolean;
}

export interface MaintenanceScheduleItem {
    name: string;
    intervalKm: number;
    intervalMonths: number;
}

export interface Expense {
    id: string;
    vehicleId: string;
    name: string;
    category: ExpenseCategory;
    cost: number;
    date: string;
}

export interface Goal {
    id: string;
    vehicleId: string;
    type: 'weekly' | 'monthly';
    target: number;
    startDate: string;
}

export interface Partner {
  id: string;
  name: string;
  category: 'Autopeças' | 'Serviços' | 'Alimentação' | 'Combustível' | 'Outros';
  benefit: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  whatsapp?: string;
}

export interface AppState {
  user: UserProfile;
  vehicles: Vehicle[];
  stations: GasStation[];
  expenses: Expense[];
  goals: Goal[];
  partners: Partner[];
  activeVehicleId: string | null;
}

export interface ExtractedFuelPrice {
  fuelType: FuelType;
  price: number;
}