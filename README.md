# Riaj Uddin Portfolio

Next.js portfolio with the original project archive plus an admin-managed gallery and project CMS.

## Admin CMS

1. Copy `.env.example` to `.env.local`.
2. Set a strong `ADMIN_PASSWORD` and `ADMIN_SECRET`.
3. Start the app with `npm run dev`.
4. Open `/admin` and sign in.
5. Use **Gallery** to upload multiple images at once.
6. Use **Projects** to add new case studies with a cover image and optional gallery images.

Existing projects in `src/data/projects.ts` remain the default projects. Admin-created projects are stored separately in `content/projects.json`, so the original data is not overwritten.

Gallery metadata is stored in `content/gallery.json`. Uploaded files are stored in `public/uploads/`.

### Deployment note

The CMS uses the server filesystem for persistence. Deploy it on a Node/VPS/shared-hosting environment with a writable filesystem. On serverless/ephemeral hosting such as Vercel, move uploaded media and JSON persistence to object storage/database (for example S3-compatible storage + a database) before production use.
