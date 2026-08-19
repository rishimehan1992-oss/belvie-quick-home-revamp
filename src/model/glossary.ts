import type { CommercialLevers } from "@/model/pnl";
import type { Params } from "@/model/types";

export type GlossaryItem = {
  name: string;
  symbol: string;
  unit: string;
  def: string;
  meaning: string;
  formula?: string;
  now?: (params: Params, commercial: CommercialLevers) => string;
};

export type GlossarySection = {
  id: string;
  title: string;
  lead: string;
  items: GlossaryItem[];
};

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export const GLOSSARY: GlossarySection[] = [
  {
    id: "flow",
    title: "How the tabs connect",
    lead: "P&L sets what you sell and how customers buy. Network sizes the physical system to serve that demand. Sensitivity moves one lever at a time. Favorable maps the green operating pocket. Growth copies the city model across India. Inventory is the 900/1,500 SKU edit and replacement rates. Lifestyle adds premium bags, footwear and watches on the consulted customer. Simulate plays one kit cycle and a van tour on the map. This page defines every line item those tabs use.",
    items: [
      {
        name: "P&L",
        symbol: "1",
        unit: "—",
        def: "Start here",
        meaning:
          "Commercial inputs: consults, conversion, non-consults per consult, visit cost, consult AOV, non-consult AOV, gross margin. Consults × conversion / (1 − reorder mix) becomes monthly orders D for the network.",
      },
      {
        name: "Network",
        symbol: "2",
        unit: "—",
        def: "Size the system",
        meaning:
          "Chooses how many spokes S* minimise monthly cost to serve D. Outputs hub+spoke opex, advisor payroll, delivery, and amortised capex. That ₹/order is subtracted in P&L.",
      },
      {
        name: "Sensitivity",
        symbol: "3",
        unit: "—",
        def: "Stress-test",
        meaning:
          "Re-runs the full chain while moving one input. AOV and visit cost move P&L only. Conversion, mix, volume and k also re-optimise the network.",
      },
      {
        name: "Favorable",
        symbol: "4",
        unit: "—",
        def: "Green / red zones",
        meaning:
          "At a mature-city volume, pick which levers to sweep — AOV, reorders, k, conversion, visit cost, sampling, margin. Named combinations or custom axes. Does not overwrite P&L until you apply a cell.",
      },
      {
        name: "Growth",
        symbol: "5",
        unit: "—",
        def: "Scale-out",
        meaning:
          "A planning path from 100 orders/day in Bengaluru to 2,500/day per city and 25,000/day across five major metros then five next metros. Each live city is its own hub–spoke optimiser using this session’s commercial levers. Does not overwrite Bengaluru demand on P&L.",
      },
      {
        name: "Inventory",
        symbol: "6",
        unit: "—",
        def: "Assortment",
        meaning:
          "Planning tree: 900 SKUs on every spoke, 1,500 at the hub (900 + 600 extras). Categories × brand-line roles × SKUs. Replacement = 30 / days of cover by A/B/C class. Does not change S* or P&L. Testers stay on the sampling slider.",
      },
      {
        name: "Lifestyle",
        symbol: "7",
        unit: "—",
        def: "Bags, shoes, watches",
        meaning:
          "Premium attach on the same consulted customer. Default 0.5 pieces per consult, ticket ₹8,000–20,000, GM 40%. Gross profit sits on top of beauty P&L. Does not change S*, CAC or beauty inventory.",
      },
      {
        name: "Simulate",
        symbol: "8",
        unit: "—",
        def: "Watch the day",
        meaning:
          "A stage map of one kit cycle and a van tour, at ~100 orders/day and at this session’s S*. Scooters use travel + kit + k × consult + home-to-home. Last-mile vans use the slot tour. The restock van uses the hub→spoke envelope. Not a discrete-event digital twin — vehicle counts are reduced so the motion stays readable.",
      },
      {
        name: "Line items",
        symbol: "9",
        unit: "—",
        def: "This page",
        meaning:
          "Definitions for every input, factor and constraint: line-haul, circuity, tour constant, peak factor, CAC/LTV, and the cost stack. “Now” follows whatever you set on P&L and Network.",
      },
    ],
  },
  {
    id: "pnl",
    title: "P&L commercial line items",
    lead: "Money in and out before the network is sized. All figures are planning estimates.",
    items: [
      {
        name: "Monthly consults",
        symbol: "V",
        unit: "visits / month",
        def: "27,083 at 25k orders",
        meaning:
          "In-home visits. Orders = consults × conversion / (1 − reorder mix). Moving consults on P&L writes demand D into the network.",
        formula: "visits = D · (1 − ρ) / φ",
        now: (p) => Math.round((p.D * (1 - p.rho / 100)) / (p.phi / 100)).toLocaleString("en-IN"),
      },
      {
        name: "Cost of one visit",
        symbol: "c_v",
        unit: "₹ / consult",
        def: "400",
        meaning:
          "Planning cost to generate one consult (ads, booking, no-show load). Not observed CAC. Monthly visit spend = consults × c_v.",
        now: (_p, c) => inr(c.visitCost),
      },
      {
        name: "Sampling cost per visit",
        symbol: "c_s",
        unit: "₹ / consult",
        def: "100",
        meaning:
          "Testers / kit given on the in-home visit. Not CAC and not inside S*. Monthly sampling = consults × c_s. Slider 50–250 on P&L. Shown on the Network cost stack and subtracted in P&L, Favorable and Growth. Per acquired customer this is c_s / φ.",
        formula: "sampling = V · c_s",
        now: (_p, c) => inr(c.samplingCost),
      },
      {
        name: "Consult AOV",
        symbol: "AOV_c",
        unit: "₹ / first order",
        def: "4,000",
        meaning:
          "Average ticket on the order that follows a converting visit. Used for consult LTV. Does not change network cost.",
        now: (_p, c) => inr(c.aov),
      },
      {
        name: "Non-consult AOV",
        symbol: "AOV_n",
        unit: "₹ / reorder",
        def: "4,000",
        meaning:
          "Average ticket on reorders that need no visit. Can be lower than consult AOV if refill baskets are smaller.",
        now: (_p, c) => inr(c.nonConsultAov),
      },
      {
        name: "Conversion per visit",
        symbol: "φ",
        unit: "%",
        def: "60",
        meaning:
          "Share of consults that become a first order. CAC = visit cost / φ. Higher conversion also means fewer visits (and fewer advisors) for the same order book.",
        now: (p) => `${p.phi}%`,
      },
      {
        name: "Gross margin",
        symbol: "GM",
        unit: "% of revenue",
        def: "35",
        meaning:
          "After product COGS, before visit acquisition and network. Gross profit = revenue × GM. Kit BOM is not in this number.",
        now: (_p, c) => `${c.gm}%`,
      },
      {
        name: "CAC",
        symbol: "CAC",
        unit: "₹ / customer",
        def: "667 at defaults",
        meaning:
          "Cost to acquire one converting customer, including unconverted visits. CAC = visit cost / conversion.",
        formula: "CAC = c_v / φ",
      },
      {
        name: "Non-consults per consult",
        symbol: "n",
        unit: "reorders / first order",
        def: "0.54 (was 35% reorder share)",
        meaning:
          "How many no-visit reorders follow one consult order. Internally ρ = n / (1+n). At 0.54, each customer places 1 consult order + 0.54 reorders = 1.54 orders lifetime in this steady-state mix.",
        formula: "n = ρ / (1 − ρ)    ρ = n / (1 + n)",
        now: (p) => (p.rho / 100 / (1 - p.rho / 100)).toFixed(2),
      },
      {
        name: "LTV (gross profit)",
        symbol: "LTV",
        unit: "₹ / customer",
        def: "—",
        meaning:
          "Consult AOV × GM × 1, plus non-consult AOV × GM × n. Revenue LTV is the same without multiplying by GM.",
        formula: "LTV_GP = GM · (AOV_c + n · AOV_n)",
      },
      {
        name: "LTV : CAC",
        symbol: "—",
        unit: "×",
        def: "—",
        meaning: "Gross-profit LTV divided by CAC. Above ~3× is the usual planning comfort zone; this is not a target the model enforces.",
      },
      {
        name: "Contribution / customer",
        symbol: "—",
        unit: "₹",
        def: "—",
        meaning:
          "GP LTV − CAC − sampling per customer − (network ₹/order × orders per customer). This is the number that must stay positive for the plan to hang together.",
      },
    ],
  },
  {
    id: "demand",
    title: "Demand the network must serve",
    lead: "The optimiser does not choose how many orders to chase. It costs a given volume.",
    items: [
      {
        name: "Orders / month",
        symbol: "D",
        unit: "orders",
        def: "25,000",
        meaning:
          "Total fulfilled orders, consult + non-consult. Set from P&L consults unless you override it on Network.",
        now: (p) => Math.round(p.D).toLocaleString("en-IN"),
      },
      {
        name: "Serviceable area",
        symbol: "A",
        unit: "km²",
        def: "350",
        meaning:
          "Bengaluru catchment treated as uniform density. Larger A stretches advisor travel, van tours, and line-haul to the rim.",
        now: (p) => String(p.A),
      },
      {
        name: "Peak-day factor",
        symbol: "π",
        unit: "×",
        def: "1.25",
        meaning:
          "Spoke throughput is sized on a peak day, not the monthly average. Peak orders/day/spoke = (D / delivery days / S) × π. This is what hits κ_S.",
        now: (p) => String(p.peak),
      },
      {
        name: "Delivery days / month",
        symbol: "d_del",
        unit: "days",
        def: "30",
        meaning: "Days the van network runs. Spreads D into orders/day.",
        now: (p) => String(p.ddel),
      },
      {
        name: "Advisor days / month",
        symbol: "d_adv",
        unit: "days",
        def: "26",
        meaning: "Paid working days per advisor. Headcount N = monthly visits / (consults per day × d_adv).",
        now: (p) => String(p.dadv),
      },
    ],
  },
  {
    id: "advisor",
    title: "Advisor cycle",
    lead: "She picks a kit at the spoke, visits homes, and returns to rebuild. k is the headline lever.",
    items: [
      {
        name: "k — consults per kit load",
        symbol: "k",
        unit: "consults before return",
        def: "1",
        meaning:
          "How many homes she does on one kit before going back to the spoke. At k=1 most of the paid day is travel. k=3 is the “kit problem solved” case. The model treats extra k as free of kit-module capex — that is a known gap.",
        now: (p) => String(p.k),
      },
      {
        name: "Mean spoke distance",
        symbol: "d̄(S)",
        unit: "km",
        def: "—",
        meaning:
          "Average road distance from a random home to the nearest of S uniformly spread spokes. The 0.40 is a geometry constant, not a calibration.",
        formula: "d̄(S) = 0.40 · τ · √(A / S)",
      },
      {
        name: "Advisor travel",
        symbol: "min/km",
        unit: "min / km",
        def: "8  (~7.5 km/h)",
        meaning:
          "Door-to-spoke speed including Bengaluru traffic, parking, and building access. Round trip minutes = 2 · d̄ · this number.",
        now: (p) => String(p.mkAdv),
      },
      {
        name: "In-home consult",
        symbol: "T_c",
        unit: "min",
        def: "45",
        meaning: "Time in the home. Multiplied by k in the cycle.",
        now: (p) => String(p.Tc),
      },
      {
        name: "Kit rebuild at spoke",
        symbol: "T_kit",
        unit: "min",
        def: "12  (4 if kit is pre-built)",
        meaning: "Paid time at the spoke restocking the bag. The k=3 preset cuts this to 4 on the assumption you swap a pre-built kit.",
        now: (p) => String(p.Tkit),
      },
      {
        name: "Home to home",
        symbol: "t_intra",
        unit: "min",
        def: "20",
        meaning: "Between consults on the same kit load. Appears (k − 1) times. Zero at k=1.",
        now: (p) => String(p.tintra),
      },
      {
        name: "Shift / admin",
        symbol: "T_shift, T_admin",
        unit: "min",
        def: "540 / 60  (9h / 1h)",
        meaning:
          "Paid day is 9 hours; 1 hour is admin. The remaining 8 hours are the productive window. Consults/day = k · (shift − admin) / cycle. Fractional cycles are allowed — this slightly overstates productivity at high k.",
        now: (p) => `${p.Tshift} / ${p.Tadmin}`,
      },
      {
        name: "Advisor cost",
        symbol: "w",
        unit: "₹ / month",
        def: "40,000",
        meaning: "Fully loaded monthly cost as entered. No PF, bonus, or attrition loading unless you raise w yourself.",
        now: (p) => inr(p.w),
      },
    ],
  },
  {
    id: "delivery",
    title: "Last-mile delivery",
    lead: "Orders cluster in gated societies, so a van does not make one stop per order.",
    items: [
      {
        name: "Van travel",
        symbol: "min/km",
        unit: "min / km",
        def: "6  (~10 km/h)",
        meaning: "In-slot speed for the delivery tour, worse than line-haul because it runs in the day.",
        now: (p) => String(p.mkVan),
      },
      {
        name: "Cost per trip",
        symbol: "c_trip",
        unit: "₹",
        def: "1,400",
        meaning: "All-in cost of one van outing (vehicle, rider, fuel). Delivery ₹/order = c_trip / drops per trip.",
        now: (p) => inr(p.ct),
      },
      {
        name: "Slot length",
        symbol: "T_slot",
        unit: "min",
        def: "240",
        meaning: "The route must finish inside this window. If even one drop does not fit, that spoke count is infeasible.",
        now: (p) => String(p.Tslot),
      },
      {
        name: "Handover / drop",
        symbol: "θ_drop",
        unit: "min / order",
        def: "3",
        meaning: "Handing the bag to the customer, per order.",
        now: (p) => String(p.thd),
      },
      {
        name: "Society entry / stop",
        symbol: "θ_stop",
        unit: "min / society",
        def: "5",
        meaning: "Gate, security, parking. Charged once per physical stop, not per order.",
        now: (p) => String(p.thst),
      },
      {
        name: "Orders per society per trip",
        symbol: "q_soc",
        unit: "orders / stop",
        def: "4",
        meaning:
          "Clustering. Stops m = max(n / q_soc, 1). Without this, Bengaluru speeds make every route infeasible.",
        now: (p) => String(p.qsoc),
      },
      {
        name: "Tour length",
        symbol: "L(n)",
        unit: "km",
        def: "—",
        meaning:
          "Continuous-approximation tour through the stops in one spoke’s zone. Shorter when there are more spokes (smaller zone) or more clustering (fewer stops).",
        formula: "L(n) = β · √(m · A/S) · τ",
      },
    ],
  },
  {
    id: "factors",
    title: "Factors and line-haul",
    lead: "These are the geometry and speed constants. They are easy to misread as bugs.",
    items: [
      {
        name: "Road circuity τ",
        symbol: "τ",
        unit: "× straight-line",
        def: "1.3",
        meaning:
          "Roads are not crow-flies. Every distance in the model is multiplied by τ. 1.3 is a typical urban circuity. Raise it if you believe Bengaluru routing is worse.",
        now: (p) => String(p.tau),
      },
      {
        name: "Tour constant β",
        symbol: "β",
        unit: "—",
        def: "0.75",
        meaning:
          "Turns a set of stops in an area into an expected driving distance. 0.75 is a Beardwood–Halton–Hammersley style constant for a planar tour, not a GPS measurement.",
        now: (p) => String(p.beta),
      },
      {
        name: "0.40 in spoke distance",
        symbol: "0.40",
        unit: "—",
        def: "fixed",
        meaning:
          "Mean distance from a random point to the nearest of S facilities on a plane is about 0.40 · √(A/S). Do not treat it as a fitted Bengaluru parameter.",
      },
      {
        name: "Line-haul min/km",
        symbol: "minPerKmLine",
        unit: "min / km",
        def: "2.7  (~22 km/h)",
        meaning:
          "Hub → spoke replenishment speed. Default is off-peak / pre-dawn, much faster than advisor or van-in-slot speeds. This is only used for the replenishment envelope, not for last-mile cost.",
        now: (p) => String(p.mkLine),
      },
      {
        name: "Hub→spoke limit",
        symbol: "Λ",
        unit: "min",
        def: "45",
        meaning:
          "Maximum allowed one-way line-haul to the furthest spoke. If the rim is farther than this, you must run waves off-peak (lower min/km) or add a second hub. It does not change with S.",
        now: (p) => String(p.Lam),
      },
      {
        name: "Line-haul time (C3)",
        symbol: "lineHaul",
        unit: "min",
        def: "37 at defaults",
        meaning:
          "Time to the rim of a circle with area A: radius √(A/π), then × τ × line-haul min/km. At 350 km², 1.3, 2.7 this is 37 min vs a 45 min limit. Above ~3.3 min/km the banner fires. The solution still renders — C3 is not folded into per-spoke feasibility.",
        formula: "lineHaul = √(A / π) · τ · minPerKmLine",
      },
    ],
  },
  {
    id: "infra",
    title: "Hub, spoke, capex",
    lead: "Opex is in the objective every month. Capex only if the checkbox is on, converted to an equivalent monthly cost.",
    items: [
      {
        name: "Hub opex",
        symbol: "f_H",
        unit: "₹ / month / hub",
        def: "7,50,000",
        meaning: "Rent, staff, utilities for one hub. Number of hubs H = max(ceil(D / hub capacity), 1).",
        now: (p) => inr(p.fH),
      },
      {
        name: "Spoke opex",
        symbol: "f_S",
        unit: "₹ / month / spoke",
        def: "2,25,000",
        meaning: "Each extra spoke adds this every month. That is why the model does not sprinkle spokes everywhere even when travel is slow.",
        now: (p) => inr(p.fS),
      },
      {
        name: "Spoke capacity",
        symbol: "κ_S",
        unit: "orders / peak day",
        def: "130",
        meaning:
          "Throughput ceiling per spoke on the peak day. If peak load > κ_S that S is infeasible. Capacity floor minS = ceil((D/d_del) · π / κ_S).",
        now: (p) => String(p.kapS),
      },
      {
        name: "Hub capacity",
        symbol: "κ_H",
        unit: "orders / month",
        def: "40,000",
        meaning: "When D exceeds this you add a second hub. At 25k orders, H = 1.",
        now: (p) => p.kapH.toLocaleString("en-IN"),
      },
      {
        name: "Hub / spoke capex",
        symbol: "K_H, K_S",
        unit: "₹ one-off",
        def: "57.5L / 19.5L",
        meaning:
          "Build-out cash. If “include capex” is on, converted to a monthly equivalent at the cost of capital over asset life (EAC). Otherwise shown in the hero but not in the objective.",
        now: (p) => `${inr(p.KH)} / ${inr(p.KS)}`,
      },
      {
        name: "Cost of capital / life",
        symbol: "r, years",
        unit: "% p.a. / years",
        def: "12% / 5",
        meaning:
          "EAC(P, r, years) = P · r_m / (1 − (1+r_m)^(−n)) with r_m = r/12, n = years·12. If r = 0 this is straight-line P / n, not a divide-by-zero.",
        now: (p) => `${p.coc}% / ${p.life} yr`,
      },
    ],
  },
  {
    id: "objective",
    title: "What is minimised, and what is left out",
    lead: "C_total(S) = hub+spoke opex + advisors + delivery + optional amortised capex, over S = 1…28.",
    items: [
      {
        name: "S*",
        symbol: "S*",
        unit: "spokes",
        def: "10 at base",
        meaning:
          "Feasible S with the lowest total. Ties go to fewer spokes. Infeasible rows (capacity or route) are excluded. Grey bars on the chart failed capacity.",
      },
      {
        name: "C1 Spoke capacity",
        symbol: "C1",
        unit: "—",
        def: "per S",
        meaning: "Peak-day orders per spoke must be ≤ κ_S. Fail → that S cannot be chosen.",
        formula: "(D / d_del / S) · π ≤ κ_S",
      },
      {
        name: "C2 Van route fits the slot",
        symbol: "C2",
        unit: "—",
        def: "per S",
        meaning: "At least one drop must fit in T_slot at the current speeds and clustering. Fail → infeasible.",
      },
      {
        name: "C3 Line-haul envelope",
        symbol: "C3",
        unit: "—",
        def: "not per S",
        meaning:
          "Furthest spoke vs 45 min. Independent of S, so it is a banner, not a reason to blank the whole table. Fix: slower? No — faster off-peak waves, or a second hub.",
      },
      {
        name: "Excluded from both models",
        symbol: "—",
        unit: "—",
        def: "—",
        meaning:
          "Product COGS (except via GM on P&L), kit BOM beyond the sampling-per-visit slider, marketing beyond the visit-cost slider, technology, corporate overhead, statutory loading on w. High k is treated as free of extra kit modules — the largest known gap.",
      },
    ],
  },
  {
    id: "growth",
    title: "National growth path",
    lead: "A scenario on the Growth tab, not a second solver. Same cost stack in every city.",
    items: [
      {
        name: "National orders / day",
        symbol: "V_nat",
        unit: "orders / day",
        def: "100 → 25,000",
        meaning:
          "Slider on Growth. Monthly orders in a city = that city’s daily orders × delivery days. 100/day is early Bengaluru; 2,500/day is a mature city; 25,000/day is ten cities at target.",
      },
      {
        name: "Sequential fill",
        symbol: "—",
        unit: "orders / day",
        def: "mature, then seed",
        meaning:
          "Fill the current city to its target, then open the next only if leftover ≥ 100/day. Thinner leftover stays on the last live city so a new hub is never opened on a handful of orders.",
      },
      {
        name: "Five major metros",
        symbol: "—",
        unit: "cities",
        def: "12,500 / day together",
        meaning:
          "Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai — 2,500 orders/day each when filled. Home market first, then the other four majors.",
      },
      {
        name: "Next five metros",
        symbol: "—",
        unit: "cities",
        def: "12,500 / day together",
        meaning:
          "Pune, Ahmedabad, Kolkata, Kochi, Jaipur — 2,500 orders/day each. They start after the five majors are filled.",
      },
      {
        name: "Per-city optimiser",
        symbol: "—",
        unit: "—",
        def: "independent H, S",
        meaning:
          "Each live city runs the same hub–spoke model with this session’s conversion, mix, AOV, visit cost, sampling, wages and factors. Only catchment area and local demand change. No shared national hub, no city wage index. Bengaluru’s area follows the Network tab; other areas are planning envelopes.",
      },
    ],
  },
  {
    id: "favorable",
    title: "Favorable operating zone",
    lead: "A map, not a second optimiser. Volume is held at scale; AOV, mix, k and sampling move.",
    items: [
      {
        name: "Combination",
        symbol: "—",
        unit: "—",
        def: "dropdown",
        meaning:
          "Named pairs such as AOV × reorders by k, visit cost × conversion, sampling × AOV. Or set columns, rows and an optional split yourself. Held sliders stay fixed while those axes sweep.",
      },
      {
        name: "At-scale volume",
        symbol: "—",
        unit: "orders / day",
        def: "2,500",
        meaning:
          "Default is one mature city. Toggle uses this session’s P&L demand instead. Mix still changes consults, so visit and sampling cash move even when orders are fixed.",
      },
      {
        name: "Heatmap cell",
        symbol: "—",
        unit: "₹ lakh / month",
        def: "click to inspect",
        meaning:
          "Colour is city P&L after network, CAC and sampling. Apply sends that cell’s levers to P&L. The ring is the held point, not a fitted optimum.",
      },
      {
        name: "Held levers",
        symbol: "—",
        unit: "—",
        def: "not on the axes",
        meaning:
          "Conversion, visit cost, sampling, GM, k, mix and both AOVs can be held or swept. Holds do not write P&L until you apply or reset.",
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory and SKUs",
    lead: "A planning catalog on the Inventory tab. Not inside C_total(S).",
    items: [
      {
        name: "Spoke edit",
        symbol: "900",
        unit: "SKUs / spoke",
        def: "900",
        meaning:
          "A+B assortment cloned to every spoke so last-mile can leave the same day. Built as categories × brand-line roles × SKUs. Testers on the visit are not in this number.",
      },
      {
        name: "Hub catalog",
        symbol: "1,500",
        unit: "SKUs / hub",
        def: "1,500",
        meaning: "Spoke 900 plus 600 extras: slow colorways, oversized, seasonal. Not planted at every spoke.",
      },
      {
        name: "Replacement rate",
        symbol: "30 / cover",
        unit: "waves / SKU / month",
        def: "A 3.0 · B 1.4 · C 0.75",
        meaning:
          "Stock replacement, not catalog delist. Default cover 10 / 21 / 40 days. Network waves = SKUs × locations × this rate. Catalog churn is a separate 20% / year on the tail.",
        formula: "replace = 30 / days of cover",
      },
    ],
  },
];
