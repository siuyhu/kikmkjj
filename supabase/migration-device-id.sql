-- ============================================================
-- kikmkjj.com 免注册改造：改用 device_id 取代 Supabase Auth 身份
-- 用法：Supabase 控制台 → SQL Editor → New query → 粘贴全文 → Run
-- 只跑一次即可（幂等，重复跑也不会出错）
-- ============================================================

-- 1) 每张表加 device_id 列（记录「哪台设备发的」，用于只能删自己发的）
alter table public.diary      add column if not exists device_id text not null default '';
alter table public.photos     add column if not exists device_id text not null default '';
alter table public.wishes     add column if not exists device_id text not null default '';
alter table public.countdowns add column if not exists device_id text not null default '';

-- 2) 让 user_id 可为空（不再依赖 auth.users 身份）
alter table public.diary      alter column user_id drop not null;
alter table public.photos     alter column user_id drop not null;
alter table public.wishes     alter column user_id drop not null;
alter table public.countdowns alter column user_id drop not null;
