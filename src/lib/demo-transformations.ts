export type DemoTransformation = {
  id: string;
  room: string;
  location: string;
  budget: string;
  /** Single room photo — before is a styled-down version of the same image */
  image: string;
  alt: string;
  beforeCaption: string;
  afterCaption: string;
  itemsAdded: string[];
  unchanged: string[];
};

export const DEMO_TRANSFORMATIONS: DemoTransformation[] = [
  {
    id: "living-hsr",
    room: "Living / Hall",
    location: "HSR Layout",
    budget: "₹58,000",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85",
    alt: "Bangalore apartment living room styling revamp",
    beforeCaption: "Existing sofa & walls — bare, flat lighting",
    afterCaption: "Same layout — cushions, rug, art & warm lights added",
    itemsAdded: [
      "Sofa cover + cushions (₹12K)",
      "Cotton area rug (₹8K)",
      "Wall art set of 3 (₹6K)",
      "Warm LED floor lamp (₹5K)",
      "Side table & planter (₹7K)",
    ],
    unchanged: ["Room size", "Windows", "Sofa frame", "Flooring"],
  },
  {
    id: "bedroom-koramangala",
    room: "Bedroom",
    location: "Koramangala",
    budget: "₹46,000",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    alt: "Bangalore bedroom styling revamp",
    beforeCaption: "Plain bedding, no curtains, cold overhead light",
    afterCaption: "Same bed & walls — linen, curtains, lamps styled",
    itemsAdded: [
      "Linen bedding set (₹9K)",
      "Blackout curtains (₹11K)",
      "Bedside lamps pair (₹6K)",
      "Wall mirror + hooks (₹5K)",
      "Throw & bedside tray (₹4K)",
    ],
    unchanged: ["Bed frame", "Wall colour", "Window position", "Floor tiles"],
  },
  {
    id: "study-indiranagar",
    room: "Study",
    location: "Indiranagar",
    budget: "₹38,000",
    image:
      "https://images.unsplash.com/photo-1598928506311-c55ded39a2c?auto=format&fit=crop&w=1200&q=85",
    alt: "Bangalore home study styling revamp",
    beforeCaption: "Basic desk, cables visible, no storage",
    afterCaption: "Same desk spot — organisers, shelf, task light added",
    itemsAdded: [
      "Desk organiser set (₹4K)",
      "Floating shelf (₹6K)",
      "Task lamp (₹5K)",
      "Cable management kit (₹2K)",
      "Desk plant + frame (₹5K)",
    ],
    unchanged: ["Desk", "Wall layout", "Room dimensions", "Chair"],
  },
];
