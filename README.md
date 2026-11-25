
# XMR Lab Website

A MUX-inspired landing page and documentation site for XMR Lab, built with Vite, React, TypeScript, and Tailwind CSS v4.

## Requirements

- Node.js 20.19+ or 22.12+
- pnpm

## Run locally

```bash
pnpm install
pnpm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
pnpm run build
pnpm run preview
```

The production site is generated in `dist/`.

Run the TypeScript check with:

```bash
pnpm run typecheck
```

## Deploy with Render

Create a Render Blueprint from this repository. Render uses `render.yaml` to
build the Vite site and route client-side paths to `index.html`.

## Customize

- Update the GitHub repository and release URLs in `src/App.tsx`.
- Replace the illustrative screenshot mockups in `ScreenshotMock` with real app screenshots when available.
- Update documentation content in the `Docs` component to match the exact behavior of the current XMR Lab release.

## Automatic APK Download

The website checks the GitHub Releases API:

`https://api.github.com/repos/mahfuz0712/XMR-Lab/releases?per_page=100`

It follows these rules:

1. Only numeric semantic version tags are accepted, such as `1.0.0`, `1.0.1`, or `2.0.0`.
2. Tags with a `v` prefix, such as `v1.0.0`, are ignored.
3. Non-version tags such as `latest` are ignored.
4. Draft releases and prereleases are ignored.
5. Releases without an APK asset are ignored.
6. Versions are compared numerically, so `1.10.0` is newer than `1.9.0`.
7. The highest matching version containing an APK is selected.
8. The download button links directly to that APK asset.

If the GitHub API is unavailable or no matching APK is found, the download button falls back to the GitHub Releases page.

## Notes

Documentation is intentionally conservative: device and USB compatibility can vary by build and hardware.
