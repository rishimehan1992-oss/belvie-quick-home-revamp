import type { StylingOverlayConfig } from "./same-image-revamp";

export type DemoTransformation = {
  id: string;
  room: string;
  location: string;
  budget: string;
  before: { src: string; alt: string };
  afterAlt: string;
  styling: StylingOverlayConfig;
  stylingChanges: string[];
  unchanged: string[];
};

const LIVING_BEFORE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85";
const BEDROOM_BEFORE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85";
const STUDY_BEFORE =
  "https://images.unsplash.com/photo-1598928506311-c55ded39a2c?auto=format&fit=crop&w=1200&q=85";

export const DEMO_TRANSFORMATIONS: DemoTransformation[] = [
  {
    id: "living-hsr",
    room: "Living / Hall",
    location: "HSR Layout",
    budget: "₹58,000",
    before: {
      src: LIVING_BEFORE,
      alt: "Living room before Belvie styling",
    },
    afterAlt: "Living room after wallpaper panels and decor added",
    styling: {
      roomType: "living",
      colorPalette: ["Terracotta", "Walnut", "Sand"],
      keyChanges: [
        "Wallpaper accent on back wall",
        "Wooden wall panels near TV",
        "Sofa cover + new cushions",
        "Area rug + floor lamp",
        "Wall art frames",
      ],
    },
    stylingChanges: [
      "Wallpaper accent on back wall",
      "Wooden wall panels near TV",
      "Sofa cover + new cushions",
      "Area rug + floor lamp",
      "Wall art frames",
    ],
    unchanged: [
      "Doors & frames",
      "Wall alignment",
      "Cabinets & wardrobes",
      "Windows",
      "Floor tiles",
    ],
  },
  {
    id: "bedroom-koramangala",
    room: "Bedroom",
    location: "Koramangala",
    budget: "₹46,000",
    before: {
      src: BEDROOM_BEFORE,
      alt: "Bedroom before Belvie styling",
    },
    afterAlt: "Bedroom after curtains bedding and lamps added",
    styling: {
      roomType: "bedroom",
      colorPalette: ["Linen", "Sage", "Blush"],
      keyChanges: [
        "New linen bedding set",
        "Blackout curtains",
        "Bedside lamps",
        "Wall mirror + throw",
      ],
    },
    stylingChanges: [
      "New linen bedding set",
      "Blackout curtains",
      "Bedside lamps",
      "Wall mirror + throw",
    ],
    unchanged: [
      "Doors & frames",
      "Wall alignment",
      "Wardrobes",
      "Windows",
      "Bed frame position",
    ],
  },
  {
    id: "study-indiranagar",
    room: "Study",
    location: "Indiranagar",
    budget: "₹38,000",
    before: {
      src: STUDY_BEFORE,
      alt: "Study before Belvie styling",
    },
    afterAlt: "Study after shelf lamp and organisers added",
    styling: {
      roomType: "study",
      colorPalette: ["Charcoal", "Teal", "Cream"],
      keyChanges: [
        "Floating shelf",
        "Desk organisers",
        "Task lamp",
        "Wall art + plant",
      ],
    },
    stylingChanges: [
      "Floating shelf",
      "Desk organisers",
      "Task lamp",
      "Wall art + plant",
    ],
    unchanged: [
      "Doors & frames",
      "Wall alignment",
      "Built-in shelves",
      "Windows",
      "Desk & chair position",
    ],
  },
];
