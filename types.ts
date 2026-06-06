// Shared Data Contract Models for Sales Management System

export enum SaleStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  RECONCILED = 'RECONCILED',
  REVERSED = 'REVERSED',
}

export enum ShiftStatus {
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  RECONCILED = 'RECONCILED',
}

export enum AttendantPerformanceType {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  EXCELLENT = 'EXCELLENT',
}

export enum NozzlePerformanceType {
  OPTIMAL = 'OPTIMAL',
  NORMAL = 'NORMAL',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
}

export interface SaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PointReading {
  timestamp: string;
  value: number;
  unit: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  saleDate: string;
  shiftId: string;
  userId: string;
  status: SaleStatus;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
}

export interface Shift {
  id: string;
  shiftNumber: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  pointReadings: PointReading[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
