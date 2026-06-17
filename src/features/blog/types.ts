export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  tags: string[];
  readMinutes: number;
  dateLabel: string;
}
