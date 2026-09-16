import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type {
  CatalogBook,
  CatalogCategory,
  CatalogIssue,
  CatalogIssueMeta,
  IssueSummary,
  JournalPost,
  JournalPostSummary,
  PurchaseLink,
} from "./catalog-types";

export const getCurrentIssue = createServerFn({ method: "GET" }).handler(async () => {
  const { loadIssueCatalog } = await import("./catalog.server");
  return loadIssueCatalog();
});

export const getIssueCatalog = createServerFn({ method: "GET" })
  .inputValidator((data: { issueId: string }) =>
    z.object({ issueId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { loadIssueCatalog } = await import("./catalog.server");
    return loadIssueCatalog(data.issueId);
  });

export const getIssuePreview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { issueId: string }) =>
    z.object({ issueId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    if (!isAdmin) throw new Error("Editors only");
    const { loadIssueCatalog } = await import("./catalog.server");
    return loadIssueCatalog(data.issueId, { includeDrafts: true });
  });

export const listPublishedIssues = createServerFn({ method: "GET" }).handler(async () => {
  const { loadPublishedIssues } = await import("./catalog.server");
  return { issues: await loadPublishedIssues() };
});

export const getCatalogBook = createServerFn({ method: "GET" })
  .inputValidator((data: { bookId: string }) =>
    z.object({ bookId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { loadCatalogBook } = await import("./catalog.server");
    return { book: await loadCatalogBook(data.bookId) };
  });

export const getAuthorShelf = createServerFn({ method: "GET" })
  .inputValidator((data: { authorId: string }) =>
    z.object({ authorId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { loadAuthorShelf } = await import("./catalog.server");
    return { shelf: await loadAuthorShelf(data.authorId) };
  });

export const listJournalPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { loadPublishedPosts } = await import("./catalog.server");
  return { posts: await loadPublishedPosts() };
});

export const getJournalPost = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { loadPublishedPost } = await import("./catalog.server");
    return { post: await loadPublishedPost(data.slug) };
  });

export const getSiteCopy = createServerFn({ method: "GET" }).handler(async () => {
  const { loadSiteCopy } = await import("./catalog.server");
  return { copy: await loadSiteCopy() };
});

const subscribeSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address").max(200),
    catalog: z.boolean(),
    blog: z.boolean(),
  })
  .refine((value) => value.catalog || value.blog, {
    message: "Pick at least one list to join",
  });

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }) => {
    const { upsertSubscriber } = await import("./catalog.server");
    const { email, created } = await upsertSubscriber(data);
    if (created) {
      const { sendWelcomeEmail } = await import("./welcome-email.server");
      // Best effort: the signup stands even when the welcome email can't go out.
      await sendWelcomeEmail(email, { idempotencyKey: `community-welcome-${email}` });
    }
    return { ok: true as const };
  });
