This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Prerequisites
- Node

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Documentation sections

The docs under `/docs` are copied from the package repositories by the **Sync Docs** workflow
(`.github/workflows/sync-docs.yml`, run by hand from the Actions tab):

| Section | Source | Content | Images |
|---|---|---|---|
| `guide` | wagsave-unity `WaggleBum/WagSave/Docs` | `content/docs/guide` | `public/docs-assets/guide/Images` |
| `api` | wagsave-unity `WaggleBum/WagSave/Core/Docs` | `content/docs/api` | — |
| `wagsettings` | wagsettings-unity `WaggleBum/WagSettings/Docs` | `content/docs/wagsettings` | `public/docs-assets/wagsettings/Images` |

Sections are declared in `config/docs.ts`. Pages may sit one folder down (`Settings/Audio.md` is
`/docs/wagsettings/Settings/Audio`); the sidebar groups them under the folder name and orders pages
the way the section's `index.md` links them. Relative image links are rewritten to the section's
`docs-assets` folder. Translated copies (`es/`, `ja/`, …) are synced but not served yet.

The workflow needs the secrets `DOCS_REPO_PAT`, `DOCS_REPO` (WagSave) and `WAGSETTINGS_REPO`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

