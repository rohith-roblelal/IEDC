This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production Scaling: Database Connection Pooling (PgBouncer)

For high-concurrency production workloads (>1,000 users), the default direct async connection to Neon PostgreSQL will result in connection pool exhaustion.

To mitigate this, you must configure **PgBouncer** (in transaction pooling mode) to sit between FastAPI and the database. Neon Serverless provides a built-in PgBouncer endpoint.

### Steps to Enable:
1. In your Neon Console, navigate to your Project Dashboard.
2. Under "Connection Details", enable the **Pooled connection** toggle.
3. Copy the pooled connection string (it will typically append `-pooler` to the endpoint host).
4. Update your production `.env` file:
   ```env
   DATABASE_URL=postgresql+asyncpg://<USER>:<PASSWORD>@<PROJECT_ENDPOINT>-pooler.<REGION>.aws.neon.tech/<DB_NAME>
   ```
5. Ensure `backend/app/database/session.py` maintains `pool_size=20` and `max_overflow=50` to gracefully handle the FastAPI application-side queue.
