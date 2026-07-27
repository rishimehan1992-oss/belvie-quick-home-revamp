import type {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "./constants";

export type RoomTypeId = (typeof ROOM_TYPES)[number]["id"];
export type DesignStyleId = (typeof DESIGN_STYLES)[number]["id"];
export type BudgetBandId = (typeof BUDGET_BANDS)[number]["id"];
export type PriorityId = (typeof PRIORITIES)[number]["id"];

export type RevampBrief = {
  roomType: RoomTypeId;
  designStyle: DesignStyleId;
  budgetBand: BudgetBandId;
  priority: PriorityId;
  revampNotes: string;
  timeline: string;
};

export type BudgetItem = {
  name: string;
  estimatedCost: number;
  whereToBuy: string;
  category: string;
};

export type CostLineItem = {
  lineNumber: number;
  item: string;
  description: string;
  qty: number;
  estimatedUnitCost: number;
  unitCostRange?: string;
  estimatedTotal: number;
  whereToBuy: string;
  isLabor?: boolean;
  category: string;
};

export type CostTotals = {
  subtotal: number;
  laborTotal: number;
  contingencyPercent: number;
  contingency: number;
  grandTotal: number;
  budgetVersionTotal: number;
  budgetVersionNote: string;
};

export type RevampVision = {
  roomAnalysis: string;
  primaryTheme: string;
  designConcept: string;
  alternativeTheme: string;
  afterImageBrief: string;
  visionSummary: string;
  designDirection: string;
  colorPalette: string[];
  keyChanges: string[];
  assumptions: string[];
  costLineItems: CostLineItem[];
  costTotals: CostTotals;
  phasingPlan: string[];
  items: BudgetItem[];
  estimatedBudget: {
    min: number;
    max: number;
    breakdown: string;
  };
  timelineHours: number;
  bangaloreTip: string;
  noVacationNote: string;
};

export type LeadPayload = {
  name: string;
  phone: string;
  whatsappSame: boolean;
  brief: RevampBrief;
  vision: RevampVision;
  photoCount: number;
};
