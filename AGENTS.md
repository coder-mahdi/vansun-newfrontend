<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Content: CMS / API vs local dev

- **Live:** copy, images, and structured content are expected from the **backend / CMS API**. Prefer typed fetch helpers and env-based URLs (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CMS_API_URL`).
- **Dev / mock:** set `NEXT_PUBLIC_CONTENT_MODE=mock` (default). Put test images in **`public/dev-cms/`** and resolve URLs with **`contentImageUrl(localFile, cmsUrl)`** from `@/lib/content-assets` so switching to live only requires real `cmsUrl` from the API and `NEXT_PUBLIC_CONTENT_MODE=live`.
- Do not hardcode production asset URLs in components; thread CMS fields through props or server loaders.

