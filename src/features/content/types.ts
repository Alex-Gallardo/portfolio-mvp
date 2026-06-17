export interface SectionConfigItem {
  key: string;
  visible?: boolean;
  order?: number;
}

export interface ContentBlockData {
  key: string;
  title: string | null;
  body: string;
  visible: boolean;
  order: number;
}

export type ContentMap = Record<string, ContentBlockData>;
