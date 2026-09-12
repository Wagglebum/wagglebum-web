// contentDir paths must match the destination paths used by the GitHub Action
// that copies markdown files into this repository. Pages may sit one folder down
// (WagSettings has Docs/Settings/*.md); a section's Images folder is served from
// public/docs-assets/<id>/Images.
export interface DocSource {
  id: string;
  label: string;
  contentDir: string;
  order: number;
}

export const docSources: DocSource[] = [
  {
    id: "guide",
    label: "WagSave",                  // WaggleBum/WagSave/Docs
    contentDir: "content/docs/guide",
    order: 1,
  },
  {
    id: "api",
    label: "Core API Reference",       // WaggleBum/WagSave/Core/Docs
    contentDir: "content/docs/api",
    order: 2,
  },
  {
    id: "wagsettings",
    label: "WagSettings",              // WaggleBum/WagSettings/Docs
    contentDir: "content/docs/wagsettings",
    order: 3,
  },
];
