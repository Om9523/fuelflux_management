import React from 'react';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';

export const metadata = {
  title: 'Employee Portal - FuelFlux',
  description: 'FuelFlux restricted self-service employee portal.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <EmployeeLayout>{children}</EmployeeLayout>;
}
