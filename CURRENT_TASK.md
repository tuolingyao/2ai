# 任务：修复 Logo 和截图本地化（seed 数据 + 截图下载）

## 问题
Logo 文件已下载到 `public/images/tools/`，但：
1. seed-tools.ts 和 seed.ts 的 toolLogos 仍用 `logo.clearbit.com` 外部链接
2. 截图文件未下载到本地，toolScreenshots 仍用 `og:image` 外部链接
3. 测试文件 test-logo.png 和 test-screenshot.png 应删除

## 范围

### 1. 更新 seed 数据的 Logo 路径
- [ ] `seed-tools.ts` 的 `toolLogos` 全部改为 `/images/tools/{slug}-logo.png`
- [ ] `seed.ts` 的 `toolLogos` 同步更新

### 2. 下载官网首页大图到本地
用 Playwright 逐个访问 25 个工具官网，提取首页大图并下载：
- [ ] 访问官网首页，提取 `<img>` 标签
- [ ] 按尺寸排序，优先选宽 ≥ 600px 的大图
- [ ] 下载前 3 张，保存为 `public/images/tools/{slug}-1.png`、`-2.png`、`-3.png`
- [ ] 不足 3 张的按实际数量保存
- [ ] 无大图的工具，screenshotUrls 设为空数组

### 3. 更新 seed 数据的截图路径
- [ ] `seed-tools.ts` 的 `toolScreenshots` 全部改为 `/images/tools/` 本地路径
- [ ] `seed.ts` 的 `toolScreenshots` 同步更新

### 4. 清理
- [ ] 删除 `public/images/tools/test-logo.png`
- [ ] 删除 `public/images/tools/test-screenshot.png`
- [ ] 更新 `next.config.ts`，移除不再需要的外部图片域名

### 5. 验证
- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过

## 验收标准
- [ ] `toolLogos` 无 `logo.clearbit.com` 链接
- [ ] `toolScreenshots` 无外部链接（全部本地路径或空数组）
- [ ] `public/images/tools/` 有各工具的首页大图文件
- [ ] 无 test-logo.png / test-screenshot.png
- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过

## 禁止
- 不改 API、认证、权限逻辑
- 不改数据库 schema / migration
- 不改其他场景内容
- 不新增注释
- 不新增未要求文档
