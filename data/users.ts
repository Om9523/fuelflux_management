export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string;
  phone?: string;
}

export const DUMMY_USERS: User[] = [
  {
    id: "usr-001",
    name: "Rahul Customer",
    email: "customer@fuelflux.in",
    roles: ["Customer"],
    phone: "9876543210"
  },
  {
    id: "usr-002",
    name: "Admin User",
    email: "admin@fuelflux.in",
    roles: ["Admin", "Customer"],
  },
  {
    id: "usr-003",
    name: "Pump Owner",
    email: "owner@fuelflux.in",
    roles: ["Pump Owner", "Customer"],
  }
];
