# kikmkjj.com · 家人朋友的小空间

基于 **Next.js + Supabase** 的个人空间网站，绑定到你的域名 `kikmkjj.com`。

功能：📷 照片墙（上传）、⏳ 倒计时（实时跳动）、📔 日记、⭐ 心愿清单，自动同步。

- 浏览：完全公开，无需登录
- 发布（上传照片 / 写日记 / 许愿 / 加倒计时）：也无需注册！打开即用，右上角填个昵称就能发
- 每台「设备」只能删自己发的内容（用浏览器本地生成的 device_id 标记身份）

> ⚠️ 重要架构说明：Supabase（`*.supabase.co`）在国内经常被墙，所以本项目**不直接**让浏览器连 Supabase，
> 而是通过 Vercel 上的 `/api/*` 中转接口，由 Vercel 服务端（海外）去连 Supabase。
> 因此「实时同步」改为**每 5 秒轮询刷新**（家庭用完全够）。

---

## 一、本地跑起来（可选）

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。需要先在 `.env.local` 配置好下面两个变量。

---

## 二、配置 Supabase（免费）

1. 打开 [supabase.com](https://supabase.com)，注册 / 登录，**New project** 建项目（区域选 Singapore / Tokyo）。
2. 左侧 **SQL Editor → New query**，把 `supabase/schema.sql` 全文粘贴进去 **Run**；再把 `supabase/migration-device-id.sql` 全文粘贴进去 **Run**。
3. 左侧 **Project Settings → API**，复制两个值：
   - `Project URL`
   - `service_role` key（⚠️ 这是服务端密钥，绝不能泄露）
4. 在项目根目录新建 `.env.local`（可复制 `.env.local.example`），填入：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的service-role-key
NEXT_PUBLIC_SITE_TITLE=kikmkjj · 我们的空间
```

---

## 三、部署到 Vercel 并绑定 kikmkjj.com（免费）

1. 代码推到 GitHub，Vercel 导入本仓库（构建命令默认 `next build`）。
2. 在 Vercel 项目 **Settings → Environment Variables** 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_TITLE`
   （都勾选 Production）
3. 部署完成后 **Settings → Domains → Add** 输入 `kikmkjj.com`。
4. 去阿里云云解析 DNS 加两条记录：
   - 根域名 `@` → `A` → `76.76.21.21`
   - `www` → `CNAME` → `cname.vercel-dns.com`
5. 等 DNS 生效（几分钟到几小时），`kikmkjj.com` 就上线了。

---

## 四、常用命令

```bash
npm run dev      # 本地开发
npm run build    # 生产构建
npm start        # 启动生产服务
```

## 五、说明

- 照片上传前会在浏览器自动压缩到最长边 2048px，单张约 1MB 以内，存 Supabase 免费额度足够。
- 免费档 Supabase 项目闲置约 7 天会暂停，偶尔访问一次即可自动恢复。
