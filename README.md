# Riaj Uddin Portfolio

Next.js portfolio with an admin-managed Gallery and Project CMS.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Local admin

Open `http://localhost:3000/admin`.

If `ADMIN_PASSWORD` and `ADMIN_SECRET` are not set locally, development fallback credentials are used so the admin can be tested immediately. For production, always set your own values.

## Cloudinary setup

Create `.env.local` from `.env.example` and add:

```env
ADMIN_PASSWORD=your-admin-password
ADMIN_SECRET=your-long-random-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Images are uploaded directly from the browser to Cloudinary, so large files do not pass through the Next.js/Vercel request body.

Admin-created project metadata is stored as Cloudinary raw assets. Existing projects remain in `src/data/projects.ts` and are never overwritten.

## Vercel

Add the same five environment variables in the Vercel Project Settings, then redeploy.
