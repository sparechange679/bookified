This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Set up environment variables

Copy `.env.local` and fill in the required values:

```bash
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_ASSISTANT_ID=your_elevenlabs_agent_id
```

- **ElevenLabs API Key**: Get this from [ElevenLabs Settings → API Key](https://elevenlabs.io/settings/api).
  - **Important**: The API key must have the `convai_write` permission. When creating or editing your API key, enable the **Conversational AI** scope (read + write). If you see a `401 Unauthorized` error with `"missing_permissions"` and `"convai_write"`, your key needs this permission — create a new key with the correct scope or update the existing one.
- **Assistant ID (Agent ID)**: Create a Conversational AI agent in the [ElevenLabs Dashboard → Agents](https://elevenlabs.io/agent), then copy the Agent ID.

### 2. Run the development server

```bash
npm run dev
# or
pnpm dev
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
