export interface ProjectListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  stack: string[];
  featured: boolean;
  repoUrl?: string | null;
  category?: string | null;
  kind?: string | null;
}
