"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { DEFAULTS, PRESETS } from "@/model/defaults";
import { COMMERCIAL_DEFAULTS } from "@/model/pnl";
import type { CommercialParams, Params, ParamsAction } from "@/model/types";

export type CommercialLevers = Pick<CommercialParams, "visitCost" | "aov" | "gm">;

type ModelContextValue = {
  params: Params;
  dispatch: (action: ParamsAction) => void;
  commercial: CommercialLevers;
  setCommercial: (key: keyof CommercialLevers, value: number) => void;
};

const ModelContext = createContext<ModelContextValue | null>(null);

function reducer(state: Params, action: ParamsAction): Params {
  switch (action.type) {
    case "set":
      return { ...state, [action.key]: action.value };
    case "preset":
      return { ...state, ...PRESETS[action.name] };
    default:
      return state;
  }
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const [params, dispatch] = useReducer(reducer, DEFAULTS);
  const [commercial, setCommercialState] = useState<CommercialLevers>({
    visitCost: COMMERCIAL_DEFAULTS.visitCost,
    aov: COMMERCIAL_DEFAULTS.aov,
    gm: COMMERCIAL_DEFAULTS.gm,
  });

  const value = useMemo<ModelContextValue>(
    () => ({
      params,
      dispatch,
      commercial,
      setCommercial: (key, value) =>
        setCommercialState((prev) => ({ ...prev, [key]: value })),
    }),
    [params, commercial],
  );

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function useModel() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used inside ModelProvider");
  return ctx;
}
