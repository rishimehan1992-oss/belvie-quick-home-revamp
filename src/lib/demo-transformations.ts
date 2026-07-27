import {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "./constants";
import type { RevampBrief, RevampVision } from "./types";
import { generateDemoAfterUrl } from "./room-image";
import { imageEditPromptPrefix } from "./styling-rules";

export type DemoTransformation = {
  id: string;
  room: string;
  location: string;
  budget: string;
  before: { src: string; alt: string };
  after: { src: string; alt: string };
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
    after: {
      src: generateDemoAfterUrl(
        LIVING_BEFORE,
        `${imageEditPromptPrefix()} Add terracotta wallpaper on back wall only, sofa cushion covers, area carpet, wall art frames, floor lamp. Doors cabinets windows unchanged.`,
      ),
      alt: "Living room after wallpaper panels and decor added",
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
    after: {
      src: generateDemoAfterUrl(
        BEDROOM_BEFORE,
        `${imageEditPromptPrefix()} Add linen bedding, blackout curtains, bedside lamps, wall mirror, throw blanket. Doors cabinets walls windows unchanged.`,
      ),
      alt: "Bedroom after curtains bedding and lamps added",
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
    after: {
      src: generateDemoAfterUrl(
        STUDY_BEFORE,
        `${imageEditPromptPrefix()} Add desk organisers, task lamp, wall art, desk plant, small shelf. Doors cabinets walls desk position unchanged.`,
      ),
      alt: "Study after shelf lamp and organisers added",
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
