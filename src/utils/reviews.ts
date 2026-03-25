export type ReviewType = "Platform" | "Provider";

export interface Review {
  name: string;
  rating: number;
  comment: string;
  type: ReviewType;
}

export const REVIEW_DATA: Review[] = [
  {
    name: "Rahul Sharma",
    rating: 4.5,
    comment: "Very helpful tool for planning my solar system.",
    type: "Platform",
  },
  {
    name: "Neha Verma",
    rating: 5,
    comment: "The dashboard breakdown made sizing and budgeting easy to understand.",
    type: "Platform",
  },
  {
    name: "Amit Solar Services",
    rating: 4.2,
    comment: "Good installation service and support.",
    type: "Provider",
  },
  {
    name: "SunGrid Installers",
    rating: 4.7,
    comment: "Professional team and clear communication during setup.",
    type: "Provider",
  },
];