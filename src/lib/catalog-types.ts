export type PurchaseLink = { id: string; platform_label: string; url: string };

export type CatalogBook = {
  id: string;
  title: string;
  pen_name: string | null;
  author_id: string;
  author_name: string;
  author_bio: string | null;
  hook: string | null;
  genre: string | null;
  target_audience: string;
  ebook_price: number | null;
  print_price: number | null;
  cover_image_url: string | null;
  times_featured_count: number;
  awards_reviews_text: string | null;
  explicit_content: boolean;
  editors: string | null;
  illustrators: string | null;
  cover_designer: string | null;
  is_spotlight: boolean;
  spotlight_blurb: string | null;
  tags: string[];
  purchase_links: PurchaseLink[];
};

export type CatalogCategory = { category: string; books: CatalogBook[] };

export type CatalogIssueMeta = {
  id: string;
  display_label: string;
  issue_month: string;
  cover_headline: string | null;
  cover_tagline: string | null;
  cover_image_url: string | null;
};

export type CatalogIssueTheme = {
  preset: string;
  border_pattern: string;
};

export type CatalogPageTheme = {
  category: string;
  ground_color: string | null;
  background_image_url: string | null;
};

export type CatalogIssue = {
  issue: CatalogIssueMeta | null;
  categories: CatalogCategory[];
  theme?: CatalogIssueTheme & {
    cover_headline: string | null;
    cover_tagline: string | null;
    cover_image_url: string | null;
  };
  pageThemes?: CatalogPageTheme[];
};

export type IssueSummary = {
  id: string;
  display_label: string;
  issue_month: string;
  published_at: string | null;
  book_count: number;
};

export type JournalPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

export type JournalPost = JournalPostSummary & { body: string };

export const AUDIENCE_LABELS: Record<string, string> = {
  adult: "Adult",
  new_adult: "New adult",
  young_adult: "Young adult",
  middle_grade: "Middle grade",
  picture_book: "Picture book",
};

export const TAG_LABELS: Record<string, string> = {
  award_winner: "Award winner",
  school_themed: "School themed",
  hidden_gem: "Hidden gem",
  needs_love: "Needs love",
  spicy: "Spicy",
  preorder: "Pre-order",
  item: "Boxed item",
};
