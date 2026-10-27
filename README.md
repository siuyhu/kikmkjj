# kikmkjj.com · 家人朋友的小空间

一个基于 **Next.js + Supabase** 的个人空间网站，绑定到你的域名 `kikmkjj.com`。

功能：📷 照片墙（上传）、⏳ 倒计时（实时跳动）、📔 日记、⭐ 心愿清单，全部**实时同步**。

- 浏览：完全公开，无需登录
- 发布（上传照片 / 写日记 / 许愿 / 加倒计时）：也无需注册！打开即用，右上角填个昵称就能发
- 每个「设备」只能删自己发的内容

---

## 一、本地跑起来（可选，先验证）

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。此时会看到「尚未配置 Supabase」的提示，按下面步骤配置即可。

---

## 二、配置 Supabase（免费）

1. 打开 [supabase.com](https://supabase.com)，注册 / 登录，**New project** 建一个项目（区域选离你近的，如 Singapore / Tokyo）。
2. 左侧菜单 **SQL Editor → New query**，把本仓库 `supabase/schema.sql` 的**全文粘贴进去，点 Run**。这会一次建好 4 张表、权限、实时同步和照片存储桶。
3. 左侧 **Authentication → Sign In / Providers**，把 **Anonymous** 开关打开（`On`），这样访客打开网站即自动匿名登录、无需注册。
4. 左侧 **Project Settings → API**，复制两个值：
   - `Project URL`
   - `anon` `public` key
5. 在本项目根目录新建 `.env.local`（可复制 `.env.local.example`），填入：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
NEXT_PUBLIC_SITE_TITLE=kikmkjj · 我们的空间
```

6. 重新 `npm run dev`，刷新页面，注册一个账号即可开始用。

---

## 三、部署到 Vercel 并绑定 kikmkjj.com（免费）

1. 把代码推到 GitHub（或直接在 [vercel.com](https://vercel.com) 用 GitHub 导入）。
2. Vercel 新建项目，导入本仓库，**无需改构建命令**（默认 `next build`）。
3. 在 Vercel 项目里 **Settings → Environment Variables**，添加上面三个环境变量（`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_SITE_TITLE`）。
4. 部署完成后，**Settings → Domains → Add**，输入 `kikmkjj.com`。
5. 按 Vercel 提示去你的域名注册商（阿里云 / 腾讯云 / GoDaddy / Cloudflare 等）加 DNS 记录：
   - 根域名 `@` → `A` → `76.76.21.21`
   - `www` → `CNAME` → `cname.vercel-dns.com`
   - （具体以 Vercel 页面给的值为准）
6. 等 DNS 生效（几分钟到几小时），`kikmkjj.com` 就上线了。

---

## 四、常用命令

```bash
npm run dev      # 本地开发
npm run build    # 生产构建
npm start        # 启动生产服务
npm run lint     # 代码检查
```

## 五、说明

- 照片单张上限 10MB，存在 Supabase 免费额度内（免费档约 1GB 存储 + 5GB 月流量），个人/家庭使用足够。
- 免费档 Supabase 数据库项目闲置约 7 天会暂停，偶尔访问一次即可自动恢复；正式长期用可考虑升级 Pro（约 $25/月）。
