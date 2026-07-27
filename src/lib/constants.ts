export const ROOM_TYPES = [
  { id: "bedroom", label: "Bedroom" },
  { id: "living-hall", label: "Living / Hall" },
  { id: "study", label: "Study / Home Office" },
  { id: "bathroom", label: "Bathroom" },
  { id: "kitchen", label: "Kitchen" },
  { id: "dining", label: "Dining" },
  { id: "pooja", label: "Pooja Room" },
  { id: "balcony", label: "Balcony / Sit-out" },
  { id: "kids", label: "Kids Room" },
  { id: "guest", label: "Guest Room" },
  { id: "other", label: "Other" },
] as const;

export const DESIGN_STYLES = [
  { id: "modern-indian", label: "Modern Indian" },
  { id: "contemporary", label: "Contemporary Minimal" },
  { id: "warm-traditional", label: "Warm & Traditional" },
  { id: "luxury", label: "Luxury Contemporary" },
  { id: "boho", label: "Bohemian / Eclectic" },
  { id: "scandi", label: "Scandinavian Light" },
  { id: "jaipur", label: "Jaipur / Heritage" },
  { id: "other", label: "Surprise me" },
] as const;

export const BUDGET_BANDS = [
  { id: "25-50", label: "₹25K – ₹50K", min: 25000, max: 50000 },
  { id: "50-75", label: "₹50K – ₹75K", min: 50000, max: 75000 },
  { id: "75-100", label: "₹75K – ₹1L", min: 75000, max: 100000 },
  { id: "100-150", label: "₹1L – ₹1.5L", min: 100000, max: 150000 },
] as const;

export const PRIORITIES = [
  {
    id: "look",
    label: "Best look",
    description: "Prioritise aesthetics and finish",
  },
  {
    id: "value",
    label: "Best value",
    description: "Smart spend, maximum impact",
  },
  {
    id: "speed",
    label: "Fastest revamp",
    description: "Done quickly, minimal disruption",
  },
] as const;

export const USPS = [
  {
    title: "No room vacation",
    description:
      "You stay at home. We revamp around you — no shifting out, no hotel stays.",
    icon: "home",
  },
  {
    title: "Done in under 4 hours",
    description:
      "Most room revamps completed same day. Back to normal by evening.",
    icon: "clock",
  },
  {
    title: "Bangalore pricing",
    description:
      "Budgets and items sourced for Bengaluru — Hosur Road to Whitefield.",
    icon: "pin",
  },
  {
    title: "Transparent bands",
    description:
      "Pick your budget band upfront. No surprise quotes after you commit.",
    icon: "rupee",
  },
] as const;
