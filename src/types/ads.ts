export type AdItem = {
  id: string;
  script: string;
};

export type AdsPosition =
  | "top"
  | "middle"
  | "bottom"
  | "header"
  | "in-post";

export type AdsMap = Partial<Record<AdsPosition, AdItem[]>>;
