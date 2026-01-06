export type AdsPosition =
  | "header"
  | "top"
  | "middle"
  | "bottom"
  | "in-post";
export interface AdItem {
  id: string;
  script: string;
}

export type AdsMap = Partial<Record<AdsPosition, AdItem[]>>;
