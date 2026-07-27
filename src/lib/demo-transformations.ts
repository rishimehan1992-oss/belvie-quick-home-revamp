import type { RevampBrief, RoomStructure } from "./types";

export type DemoTransformation = {
  id: string;
  room: string;
  location: string;
  budget: string;
  before: { src: string; alt: string };
  afterAlt: string;
  afterImageBrief: string;
  roomStructure: RoomStructure;
  brief: RevampBrief;
  colorPalette: string[];
  keyChanges: string[];
  stylingChanges: string[];
  unchanged: string[];
};

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
    afterAlt: "Photorealistic revamped living room — same layout and fixtures",
    afterImageBrief:
      "Same living room photograph angle. Add terracotta wallpaper on far wall, walnut wall panels beside TV area, patterned area rug on floor tiles, new sofa cushions and throw, floor lamp in corner, framed wall art. Doors, windows, ceiling fan unchanged.",
    brief: {
      roomType: "living-hall",
      designStyle: "warm-traditional",
      budgetBand: "50-75",
      priority: "look",
      timeline: "Within 2 weeks",
      revampNotes: "Living hall cosmetic refresh",
    },
    roomStructure: {
      approximateDimensions: "~14ft x 16ft rectangular living hall",
      ceilingHeight: "~10ft with ceiling fan center",
      cameraAngle: "Eye-level from entry, facing sofa and far wall",
      floorType: "Light floor tiles, existing layout unchanged",
      wallDescription: "Plain white walls, window on right side",
      lightDirection: "Natural light from right window",
      referencePhotoIndex: 0,
      fixtures: [
        {
          type: "window",
          position: "right wall",
          description: "large window, same size and frame",
        },
        {
          type: "ceiling fan",
          position: "ceiling center",
          description: "must stay exact position",
        },
      ],
      existingFurniture: [
        {
          item: "sofa",
          position: "along far wall",
          notes: "same position, new cushions and throw only",
        },
      ],
    },
    colorPalette: ["Terracotta", "Walnut", "Warm sand"],
    keyChanges: [
      "Peel-and-stick wallpaper on accent wall",
      "Wooden wall panels behind TV zone",
      "Sofa cushion covers + throw",
      "Area rug over existing floor tiles",
      "Floor lamp and framed wall art",
    ],
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
    afterAlt: "Photorealistic revamped bedroom — same bed position and windows",
    afterImageBrief:
      "Same bedroom angle. Add linen bedding, sage and blush cushions, blackout curtains on window, area rug at foot of bed, plug-in bedside lamps, wall mirror. Wardrobe, door, window positions unchanged.",
    brief: {
      roomType: "bedroom",
      designStyle: "scandi",
      budgetBand: "25-50",
      priority: "look",
      timeline: "Within 2 weeks",
      revampNotes: "Bedroom soft furnishing refresh",
    },
    roomStructure: {
      approximateDimensions: "~12ft x 13ft bedroom",
      ceilingHeight: "~10ft flat ceiling",
      cameraAngle: "From foot of bed facing headboard wall",
      floorType: "Wooden or tile floor, unchanged structure",
      wallDescription: "Neutral walls, wardrobe on one side",
      lightDirection: "Window light from side wall",
      referencePhotoIndex: 0,
      fixtures: [
        {
          type: "window",
          position: "side wall behind bed area",
          description: "same window, add curtains only",
        },
        {
          type: "door",
          position: "visible wall",
          description: "bedroom door unchanged",
        },
      ],
      existingFurniture: [
        {
          item: "bed frame",
          position: "center against back wall",
          notes: "same position, new bedding only",
        },
      ],
    },
    colorPalette: ["Linen", "Sage green", "Soft blush"],
    keyChanges: [
      "New linen bedding set",
      "Blackout curtains on existing rod",
      "Plug-in bedside lamps",
      "Area rug at foot of bed",
      "Wall mirror and throw blanket",
    ],
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
    afterAlt: "Photorealistic revamped study — same desk position and windows",
    afterImageBrief:
      "Same study angle. Add charcoal accent wallpaper on side wall, teal wood panels behind desk, cream area rug under chair, desk organisers, task lamp, wall art, small plant. Windows, shelves, desk position unchanged.",
    brief: {
      roomType: "study",
      designStyle: "contemporary",
      budgetBand: "25-50",
      priority: "value",
      timeline: "Within 3 weeks",
      revampNotes: "Study workspace styling",
    },
    roomStructure: {
      approximateDimensions: "~10ft x 12ft study room",
      ceilingHeight: "~10ft with tube light or fan",
      cameraAngle: "Eye-level facing desk and back wall",
      floorType: "Tile or wood floor unchanged",
      wallDescription: "Plain walls, window on far wall",
      lightDirection: "Bright daylight from window behind desk",
      referencePhotoIndex: 0,
      fixtures: [
        {
          type: "window",
          position: "far wall behind desk",
          description: "large window grid, exact same",
        },
      ],
      existingFurniture: [
        {
          item: "desk and chair",
          position: "center facing window",
          notes: "same desk position, add organisers and lamp only",
        },
      ],
    },
    colorPalette: ["Charcoal", "Teal", "Cream"],
    keyChanges: [
      "Accent wallpaper on side wall",
      "Wooden wall panels behind desk",
      "Desk organisers and task lamp",
      "Area rug under desk chair",
      "Wall art and desk plant",
    ],
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
