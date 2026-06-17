export interface ServiceListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  icon: string | null;
  priceLabel: string | null;
  features: string[];
}
