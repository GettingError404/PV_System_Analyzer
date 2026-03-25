export type ProviderType = "Company" | "Technician";
export type ProviderService = "Installation" | "Maintenance" | "Repair";

export interface ProviderReview {
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SolarProvider {
  id: number;
  name: string;
  type: ProviderType;
  city: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviews: ProviderReview[];
  services: ProviderService[];
  experience: string;
}

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number; label: string }> = {
  pune: { lat: 18.5204, lng: 73.8567, zoom: 12, label: "Pune" },
  mumbai: { lat: 19.076, lng: 72.8777, zoom: 11, label: "Mumbai" },
  delhi: { lat: 28.6139, lng: 77.209, zoom: 11, label: "Delhi" },
  bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 11, label: "Bengaluru" },
  chennai: { lat: 13.0827, lng: 80.2707, zoom: 11, label: "Chennai" },
};

export const SOLAR_PROVIDERS: SolarProvider[] = [
  {
    id: 1,
    name: "SolarTech Solutions",
    type: "Company",
    city: "Pune",
    lat: 18.5204,
    lng: 73.8567,
    address: "Shivajinagar, Pune, Maharashtra",
    phone: "+919876543210",
    email: "info@solartech.com",
    rating: 4.6,
    reviews: [
      { user: "Rahul", rating: 5, comment: "Great service and smooth installation.", createdAt: "2026-03-20T10:00:00Z" },
      { user: "Amit", rating: 4, comment: "Good installation support.", createdAt: "2026-03-16T10:00:00Z" },
      { user: "Neha", rating: 5, comment: "Very professional team.", createdAt: "2026-03-10T10:00:00Z" },
    ],
    services: ["Installation", "Maintenance", "Repair"],
    experience: "5 years",
  },
  {
    id: 2,
    name: "Amit Solar Services",
    type: "Technician",
    city: "Pune",
    lat: 18.5332,
    lng: 73.8471,
    address: "Kothrud, Pune, Maharashtra",
    phone: "+919870009999",
    email: "amit.solar@service.in",
    rating: 4.2,
    reviews: [
      { user: "Sonia", rating: 4, comment: "Quick maintenance visit.", createdAt: "2026-03-14T10:00:00Z" },
      { user: "Kiran", rating: 4, comment: "Good troubleshooting skills.", createdAt: "2026-03-05T10:00:00Z" },
    ],
    services: ["Maintenance", "Repair"],
    experience: "7 years",
  },
  {
    id: 3,
    name: "SunGrid Installers",
    type: "Company",
    city: "Mumbai",
    lat: 19.0896,
    lng: 72.8656,
    address: "Andheri East, Mumbai, Maharashtra",
    phone: "+919988776655",
    email: "contact@sungrid.in",
    rating: 4.8,
    reviews: [
      { user: "Manoj", rating: 5, comment: "Best rooftop planning in our area.", createdAt: "2026-03-19T10:00:00Z" },
      { user: "Isha", rating: 5, comment: "Transparent pricing and strong execution.", createdAt: "2026-03-15T10:00:00Z" },
    ],
    services: ["Installation", "Maintenance"],
    experience: "8 years",
  },
  {
    id: 4,
    name: "PowerCare Solar",
    type: "Technician",
    city: "Mumbai",
    lat: 19.0584,
    lng: 72.8367,
    address: "Bandra West, Mumbai, Maharashtra",
    phone: "+919899889999",
    email: "support@powercare.in",
    rating: 4.1,
    reviews: [
      { user: "Ravi", rating: 4, comment: "Affordable maintenance package.", createdAt: "2026-03-11T10:00:00Z" },
      { user: "Tejas", rating: 4, comment: "Good repair support.", createdAt: "2026-03-03T10:00:00Z" },
    ],
    services: ["Maintenance", "Repair"],
    experience: "4 years",
  },
  {
    id: 5,
    name: "Urban Solar Works",
    type: "Company",
    city: "Delhi",
    lat: 28.6272,
    lng: 77.2185,
    address: "Connaught Place, New Delhi",
    phone: "+919123456789",
    email: "hello@urbansolarworks.com",
    rating: 4.7,
    reviews: [
      { user: "Nitin", rating: 5, comment: "Excellent panel quality.", createdAt: "2026-03-12T10:00:00Z" },
      { user: "Priya", rating: 4, comment: "Great post-install support.", createdAt: "2026-03-08T10:00:00Z" },
    ],
    services: ["Installation", "Repair"],
    experience: "6 years",
  },
  {
    id: 6,
    name: "EcoVolt Technician Hub",
    type: "Technician",
    city: "Delhi",
    lat: 28.5983,
    lng: 77.2345,
    address: "Lajpat Nagar, New Delhi",
    phone: "+919000012345",
    email: "team@ecovolt.in",
    rating: 4.5,
    reviews: [
      { user: "Aarav", rating: 5, comment: "Fast response and clear diagnosis.", createdAt: "2026-03-18T10:00:00Z" },
      { user: "Maya", rating: 4, comment: "Reliable maintenance work.", createdAt: "2026-03-04T10:00:00Z" },
    ],
    services: ["Maintenance", "Repair"],
    experience: "9 years",
  },
];
