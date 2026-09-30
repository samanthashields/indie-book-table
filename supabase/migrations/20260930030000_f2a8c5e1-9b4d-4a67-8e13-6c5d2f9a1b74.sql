-- Creates the catalog-issue-pdfs storage bucket. Its RLS policies were added in
-- 20260929120000_b4e1f7a2-3c9d-4e56-8f01-7a2b6c9d3e58.sql ahead of the bucket
-- itself existing; storage.buckets is a plain table, so inserting the row here
-- has the same effect as creating the bucket from the dashboard.
insert into storage.buckets (id, name, public)
values ('catalog-issue-pdfs', 'catalog-issue-pdfs', false)
on conflict (id) do nothing;
