export type OptionType =
  | "dimension"
  | "roof"
  | "frame-color"
  | "roof-color"
  | "feature"
  | "accessory"
  | "installation"
  | "foundation";

export type PriceModifierKind =
  | "flat"
  | "per_sqm"
  | "per_linear_m"
  | "percent";

export interface OptionValue {
  code: string;
  label: string;
  swatch?: string;
  imageUrl?: string;
  priceKind: PriceModifierKind;
  priceCents: number;
  isDefault?: boolean;
  /** For dimension-typed options. */
  minMm?: number;
  maxMm?: number;
  stepMm?: number;
  defaultMm?: number;
}

export interface ConfigOption {
  code: string;
  type: OptionType;
  label: string;
  helper?: string;
  required?: boolean;
  values: OptionValue[];
}

export type RuleAction = "require" | "incompatible" | "default";

export interface OptionRule {
  sourceOption: string;
  sourceValue?: string; // undefined = "any value selected on that option"
  targetOption: string;
  targetValue?: string;
  action: RuleAction;
}

export interface ProductConfigurator {
  productSlug: string;
  basePriceCents: number;
  options: ConfigOption[];
  rules: OptionRule[];
}

export type Selection = Record<string, string | number>;
