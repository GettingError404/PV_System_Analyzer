export type ServiceType = "Installer" | "Maintenance";
export type ServiceOffering = "Installation" | "Maintenance";

export interface SolarServiceProvider {
  id: string;
  name: string;
  type: ServiceType;
  city: string;
  lat: number;
  lng: number;
  contact: string;
  rating: number;
  services: ServiceOffering[];
  description: string;
  distanceKm?: number;
}

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  pune: { lat: 18.5204, lng: 73.8567, zoom: 12 },
  mumbai: { lat: 19.076, lng: 72.8777, zoom: 11 },
  delhi: { lat: 28.6139, lng: 77.209, zoom: 11 },
  bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 11 },
  chennai: { lat: 13.0827, lng: 80.2707, zoom: 11 },
};

export const SOLAR_SERVICE_PROVIDERS: SolarServiceProvider[] = [
  {
    id: "svc-pune-1",
    name: "SolarTech Solutions",
    type: "Installer",
    city: "Pune",
    lat: 18.5204,
    lng: 73.8567,
    contact: "+91 9876543210",
    rating: 4.5,
    services: ["Installation", "Maintenance"],
    description: "Residential and commercial rooftop solar installation experts.",
    distanceKm: 2.4,
  },
  {
    id: "svc-pune-2",
    name: "Green Energy Services",
    type: "Maintenance",
    city: "Pune",
    lat: 18.53,
    lng: 73.87,
    contact: "+91 9876500011",
    rating: 4.2,
    services: ["Maintenance"],
    description: "Preventive maintenance and inverter diagnostics for solar systems.",
    distanceKm: 3.1,
  },
  {
    id: "svc-mumbai-1",
    name: "SunGrid Installers",
    type: "Installer",
    city: "Mumbai",
    lat: 19.0896,
    lng: 72.8656,
    contact: "+91 9988776655",
    rating: 4.7,
    services: ["Installation", "Maintenance"],
    description: "End-to-end EPC solar installation with net-metering support.",
    distanceKm: 4.8,
  },
  {
    id: "svc-mumbai-2",
    name: "PowerCare Solar",
    type: "Maintenance",
    city: "Mumbai",
    lat: 19.0584,
    lng: 72.8367,
    contact: "+91 9898989898",
    rating: 4.1,
    services: ["Maintenance"],
    description: "Panel cleaning, inspection, and annual performance servicing.",
    distanceKm: 5.5,
  },
  {
    id: "svc-delhi-1",
    name: "Urban Solar Works",
    type: "Installer",
    city: "Delhi",
    lat: 28.6272,
    lng: 77.2185,
    contact: "+91 9123456789",
    rating: 4.6,
    services: ["Installation"],
    description: "Custom solar plant design and high-efficiency component installs.",
    distanceKm: 3.9,
  },
  {
    id: "svc-delhi-2",
    name: "EcoVolt Maintenance",
    type: "Maintenance",
    city: "Delhi",
    lat: 28.5983,
    lng: 77.2345,
    contact: "+91 9000012345",
    rating: 4,
    services: ["Maintenance"],
    description: "On-demand breakdown service and performance optimization.",
    distanceKm: 6.2,
  },
];
