-- ============================================================
-- kikmkjj.com 个人空间 · Supabase 初始化脚本
-- 用法：Supabase 控制台 → SQL Editor → 粘贴全文 → Run（跑一次即可）
-- ============================================================

-- ---------- 建表 ----------
create table if not exists public.diary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '',
  content text not null,
  mood text not null default '🙂',
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '',
  caption text not null default '',
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '',
  content text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.countdowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '',
  title text not null,
  target_date date not null,
  created_at timestamptz not null default now()
);

-- ---------- 行级安全（RLS）----------
alter table public.diary enable row level security;
alter table public.photos enable row level security;
alter table public.wishes enable row level security;
alter table public.countdowns enable row level security;

-- 完全公开：任何人（含未登录访客）都可查看
create policy "public read diary"      on public.diary      for select using (true);
create policy "public read photos"     on public.photos     for select using (true);
create policy "public read wishes"     on public.wishes     for select using (true);
create policy "public read countdowns" on public.countdowns for select using (true);

-- 登录用户可新增自己的内容
create policy "auth insert diary"      on public.diary      for insert with check (auth.uid() = user_id);
create policy "auth insert photos"     on public.photos     for insert with check (auth.uid() = user_id);
create policy "auth insert wishes"     on public.wishes     for insert with check (auth.uid() = user_id);
create policy "auth insert countdowns" on public.countdowns for insert with check (auth.uid() = user_id);

-- 仅本人可修改 / 删除
create policy "owner update diary"      on public.diary      for update using (auth.uid() = user_id);
create policy "owner delete diary"      on public.diary      for delete using (auth.uid() = user_id);
create policy "owner update photos"     on public.photos     for update using (auth.uid() = user_id);
create policy "owner delete photos"     on public.photos     for delete using (auth.uid() = user_id);
create policy "owner update wishes"     on public.wishes     for update using (auth.uid() = user_id);
create policy "owner delete wishes"     on public.wishes     for delete using (auth.uid() = user_id);
create policy "owner update countdowns" on public.countdowns for update using (auth.uid() = user_id);
create policy "owner delete countdowns" on public.countdowns for delete using (auth.uid() = user_id);

-- ---------- 实时同步（Realtime）----------
alter publication supabase_realtime add table public.diary;
alter publication supabase_realtime add table public.photos;
alter publication supabase_realtime add table public.wishes;
alter publication supabase_realtime add table public.countdowns;

-- ---------- 照片存储桶 ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- 公开读取
create policy "public read photo objects" on storage.objects
  for select using (bucket_id = 'photos');
-- 任何已登录用户（含匿名）可上传
create policy "auth upload photo objects" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.uid() is not null);
-- 仅本人可删除
create policy "owner delete photo objects" on storage.objects
  for delete using (bucket_id = 'photos' and auth.uid() = owner);
