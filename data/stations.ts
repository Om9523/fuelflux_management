export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  petrolPrice: number;
  dieselPrice: number;
  cngPrice: number;
  evPrice: number;
  rating: number;
  queueTime: number; // in minutes
  services: string[];
  images: string[];
  address: string;
}

export const DUMMY_STATIONS: Station[] = [
  {
    id: "st-001",
    name: "FuelFlux Premier - Indiranagar",
    latitude: 12.9784,
    longitude: 77.6408,
    petrolPrice: 101.94,
    dieselPrice: 87.89,
    cngPrice: 75.50,
    evPrice: 18.00,
    rating: 4.8,
    queueTime: 5,
    services: ["Air", "Water", "Convenience Store", "EV Charging", "Restroom"],
    images: ["/station1.jpg"],
    address: "100ft Road, Indiranagar, Bangalore"
  },
  {
    id: "st-002",
    name: "FuelFlux Connect - Koramangala",
    latitude: 12.9279,
    longitude: 77.6271,
    petrolPrice: 101.94,
    dieselPrice: 87.89,
    cngPrice: 75.50,
    evPrice: 18.00,
    rating: 4.5,
    queueTime: 12,
    services: ["Air", "Water", "Restroom"],
    images: ["/station2.jpg"],
    address: "80ft Road, Koramangala, Bangalore"
  },
  {
    id: "st-003",
    name: "FuelFlux Highway - Hosur Road",
    latitude: 12.8741,
    longitude: 77.6402,
    petrolPrice: 101.50,
    dieselPrice: 87.40,
    cngPrice: 74.00,
    evPrice: 16.50,
    rating: 4.9,
    queueTime: 2,
    services: ["Air", "Water", "Restaurant", "Restroom", "Mechanic"],
    images: ["/station3.jpg"],
    address: "Hosur Road, Bangalore"
  }
];
