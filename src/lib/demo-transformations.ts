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

/** Plain apartment rooms — clear walls, doors & floor for renovation overlay demos */
const LIVING_BEFORE =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85";
const BEDROOM_BEFORE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85";
const STUDY_BEFORE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85";

export const DEMO_TRANSFORMATIONS: DemoTransformation[] = [
  {
    id: "living-hsr",
    room: "Living / Hall",
    location: "HSR Layout",
    budget: "₹58,000",
    before: {
      src: LIVING_BEFORE,
      alt: "Plain Bangalore apartment living room before Belvie revamp",
    },
    afterAlt: "Same living room with wallpaper, panels, rug and decor added",
    styling: {
      roomType: "living-hall",
      colorPalette: ["Terracotta (#C4623F)", "Walnut", "Warm sand"],
      keyChanges: [
        "Peel-and-stick wallpaper on accent wall",
        "Wooden wall panels behind TV zone",
        "Sofa cushion covers + throw",
        "Area rug over existing floor tiles",
        "Floor lamp and framed wall art",
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
      "Built-in cabinets",
      "Windows & ceiling fan",
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
      alt: "Simple bedroom before curtains, bedding and decor revamp",
    },
    afterAlt: "Same bedroom with linen bedding, curtains and bedside lamps",
    styling: {
      roomType: "bedroom",
      colorPalette: ["Linen (#E8DCC8)", "Sage green", "Soft blush"],
      keyChanges: [
        "New linen bedding set",
        "Blackout curtains on existing rod",
        "Plug-in bedside lamps",
        "Area rug at foot of bed",
        "Wall mirror and throw blanket",
      ],
    },
    stylingChanges: [
      "New linen bedding set",
      "Blackout curtains",
      "Bedside lamps",
      "Area rug + throw",
      "Wall mirror",
    ],
    unchanged: [
      "Doors & frames",
      "Wall alignment",
      "Wardrobe position",
      "Windows",
      "Bed frame position",
    ],
  },
  {
    id: "study-indiranagar",
    room: "Study / Home Office",
    location: "Indiranagar",
    budget: "₹38,000",
    before: {
      src: STUDY_BEFORE,
      alt: "Home office before wallpaper panels and desk styling",
    },
    afterAlt: "Same study with wallpaper, panels, rug and task lighting",
    styling: {
      roomType: "study",
      colorPalette: ["Charcoal (#36454F)", "Teal", "Cream"],
      keyChanges: [
        "Accent wallpaper on side wall",
        "Wooden wall panels behind desk",
        "Desk organisers and task lamp",
        "Area rug under desk chair",
        "Wall art and desk plant",
      ],
    },
    stylingChanges: [
      "Accent wallpaper",
      "Wall panels behind desk",
      "Desk organisers + task lamp",
      "Area rug",
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
