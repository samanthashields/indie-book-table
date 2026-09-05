import { z } from "zod";

export const AUDIENCE_OPTIONS = [
  { value: "adult", label: "Adult" },
  { value: "new_adult", label: "New adult" },
  { value: "young_adult", label: "Young adult" },
  { value: "middle_grade", label: "Middle grade" },
  { value: "picture_book", label: "Picture book" },
] as const;

export const AI_OPTIONS = [
  { value: "none", label: "None" },
  { value: "some", label: "Some" },
  { value: "significant", label: "Significant" },
] as const;

export const TAG_OPTIONS = [
  { value: "award_winner", label: "Award winner" },
  { value: "school_themed", label: "School themed" },
  { value: "hidden_gem", label: "Hidden gem" },
  { value: "needs_love", label: "Needs love" },
  { value: "spicy", label: "Spicy" },
  { value: "preorder", label: "Pre-order" },
  { value: "item", label: "Boxed item" },
] as const;

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  added_to_database: "Added to the database",
  removed: "Removed",
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : ""));

const optionalPrice = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), "Use a number like 4.99");

export const purchaseLinkSchema = z.object({
  platform_label: z.string().trim().min(1, "Add a label").max(60),
  url: z.string().trim().url("Enter a full link starting with https://").max(500),
});

export const submissionSchema = z.object({
  author_name: z.string().trim().min(2, "Tell us the name to print").max(120),
  author_email: z.string().trim().email("Enter a valid email").max(200),
  instagram_handle: optionalText(60),
  website: optionalText(300),
  bio: optionalText(1200),

  title: z.string().trim().min(1, "Your book needs a title").max(200),
  pen_name: optionalText(120),
  genre: optionalText(80),
  target_audience: z.enum(["adult", "new_adult", "young_adult", "middle_grade", "picture_book"]),
  hook: z.string().trim().min(10, "A one-line hook helps readers pick it up").max(300),
  explicit_content: z.boolean(),

  editors: optionalText(300),
  illustrators: optionalText(300),
  cover_designer: optionalText(300),
  ai_writing_contribution: z.enum(["none", "some", "significant"]),
  ai_art_contribution: z.enum(["none", "some", "significant"]),

  cover_image_url: z.string().nullable(),
  ebook_price: optionalPrice,
  print_price: optionalPrice,
  purchase_links: z.array(purchaseLinkSchema).max(8),

  awards_reviews_text: optionalText(1200),
  tags: z.array(z.string()).max(7),
});

export type SubmissionValues = z.infer<typeof submissionSchema>;

export const emptySubmission: SubmissionValues = {
  author_name: "",
  author_email: "",
  instagram_handle: "",
  website: "",
  bio: "",
  title: "",
  pen_name: "",
  genre: "",
  target_audience: "adult",
  hook: "",
  explicit_content: false,
  editors: "",
  illustrators: "",
  cover_designer: "",
  ai_writing_contribution: "none",
  ai_art_contribution: "none",
  cover_image_url: null,
  ebook_price: "",
  print_price: "",
  purchase_links: [],
  awards_reviews_text: "",
  tags: [],
};

export const SUBMIT_STEPS = [
  { key: "you", label: "You" },
  { key: "book", label: "The book" },
  { key: "credits", label: "Credits & AI" },
  { key: "cover", label: "Cover & buying" },
  { key: "extras", label: "Extras" },
  { key: "review", label: "Review & send" },
] as const;

/** Fields that must be valid before the author can leave a given step. */
export const STEP_FIELDS: Record<string, (keyof SubmissionValues)[]> = {
  you: ["author_name", "author_email"],
  book: ["title", "target_audience", "hook"],
  credits: [],
  cover: ["purchase_links", "ebook_price", "print_price"],
  extras: [],
  review: [],
};
