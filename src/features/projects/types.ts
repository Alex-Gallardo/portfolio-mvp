export interface ProjectListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  stack: string[];
  featured: boolean;
}
