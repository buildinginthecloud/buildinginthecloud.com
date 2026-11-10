# Website development guide

This directory contains the Astro site for [buildinginthecloud.com](https://buildinginthecloud.com). This guide describes how to develop the site locally in Docker and how a change reaches production.

## Prerequisites

- Docker with the Compose plugin
- Git

Node.js is not required on your machine. The container runs Node.js 24. To develop without Docker, see [Develop without Docker](#develop-without-docker).

## Start the development environment

Run all commands in this guide from the `site/` directory.

```bash
cd site
docker compose up -d
```

Open http://localhost:4321.

At startup the container does three things:

1. Installs the dependencies with `npm ci`.
2. Builds the site once and generates the search index, so that `/search` works.
3. Starts the Astro development server with hot reload.

The first start takes about a minute. Follow the progress in the logs:

```bash
docker compose logs -f
```

The site is ready when the log shows a line with `ready in`.

To stop the environment:

```bash
docker compose down
```

## How the Docker setup works

The setup is defined in `compose.yaml`.

- The `site/` directory is mounted into the container at `/app`. A file you save on your machine changes in the container at once, and the browser reloads.
- `node_modules` lives in a Docker volume named `site_node_modules`, not on your machine. Some packages contain binaries for a specific operating system. The volume keeps the Linux binaries of the container apart from the binaries of your machine.
- Port 4321 of the container is published on port 4321 of your machine.

## Daily workflow

1. Start the environment with `docker compose up -d`.
2. Edit files under `src/`. The browser reloads on save.
3. Run the checks before you commit. See [Run the checks](#run-the-checks).
4. Commit, push and open a pull request. See [From branch to production](#from-branch-to-production).

### Run the checks

Run the same checks as the pull request workflow, inside the running container:

```bash
# Type-check the Astro files and the frontmatter of all posts
docker compose exec site npm run check

# Build the production site into dist/ and generate the search index
docker compose exec site npm run build

# Check every internal link and image in dist/
docker compose exec site npm run check:links
```

Run `check:links` after `build`, because it reads the `dist/` directory.

### Add or update a dependency

Install the package inside the container. `package.json` and `package-lock.json` are in the mounted directory, so the change appears on your machine and you can commit it.

```bash
docker compose exec site npm install <package>
```

After you pull changes that modify `package-lock.json`, restart the container. The startup command runs `npm ci` again.

```bash
docker compose restart
```

### Refresh the search index

The search index on the development server is a snapshot from the moment the container started. A new or changed post is not searchable until you refresh it:

```bash
docker compose exec site npm run search:index
```

Production does not need this step. `npm run build` generates the index on every deploy.

### Reset the environment

If the dependencies in the container are broken, remove the volume and start again:

```bash
docker compose down -v
docker compose up -d
```

## Write a blog post

1. Create an `.mdx` file in `src/content/blog/`. The file name becomes the URL: `my-post.mdx` is served at `/blog/my-post`.
2. Add the frontmatter:

   ```mdx
   ---
   title: "Title of the post"
   description: "One or two sentences. Shown on the blog index and in link previews."
   date: "2026-11-10"
   tags: ["AWS", "CDK"]
   coverImage: "../../assets/blog/my-post-cover.png"
   draft: true
   ---
   ```

3. Put images in `src/assets/blog/` and reference them with a relative path:

   ```mdx
   ![Architecture overview](../../assets/blog/my-post-01.png)
   ```

4. Preview the post on http://localhost:4321/blog.
5. Remove `draft: true` to publish.

Notes:

- `title`, `description` and `date` are required. The build fails when a field is missing or has the wrong type. The schema is in `src/content.config.ts`.
- A post with `draft: true` is left out of the site, the feed, the sitemap and the search index, on the development server too. To preview a draft, set `draft` to `false` locally and set it back before you commit.
- Images in `src/assets/` are converted to WebP and resized at build time. The cover image is also used for link previews.
- Reuse an existing tag where one fits. Each tag gets its own page under `/blog/tag/`.

## Develop without Docker

Use Node.js 22.23.4 or later.

```bash
cd site
npm ci
npm run search:index   # Once, so that /search works
npm run dev
```

The other commands are the same as in [Run the checks](#run-the-checks), without the `docker compose exec site` prefix.

## From branch to production

Git is the source of truth. Every change reaches production through a pull request.

1. Create a branch from `main`, for example `feature/new-post` or `fix/typo`.
2. Commit with a conventional commit message, for example `feat(site): Add post about Astro`.
3. Push the branch and open a pull request. The title must also be a conventional commit message.
4. Wait for the checks:

   | Check | What it does |
   |-------|--------------|
   | `site` | Type-checks, builds and link-checks this directory |
   | `build` | Builds and tests the CDK project in the repository root |
   | `test` | Runs the CDK tests |

5. Merge the pull request. A push to `main` that changes `site/` or `src/` starts the `Deploy Website` workflow.

The deploy workflow runs these steps:

1. Type-checks, builds and link-checks the site.
2. Deploys the CDK stacks.
3. Syncs `site/dist` to the S3 bucket and removes files that no longer exist.
4. Invalidates the CloudFront cache.

After the workflow finishes, open the live site and check the page you changed.

## Project layout

```
site/
├── src/
│   ├── pages/            # One file per route
│   ├── layouts/          # Base layout: head, header and footer
│   ├── components/       # Reusable Astro components
│   ├── content/blog/     # Blog posts in MDX
│   ├── assets/blog/      # Images used in posts
│   ├── data/cv.ts        # Content of the CV page
│   ├── lib/posts.ts      # Helpers for posts, tags and dates
│   └── styles/global.css # Design tokens, prose, print and code styles
├── public/               # Files served as they are: favicon, robots.txt
├── scripts/              # Link check
├── astro.config.mjs
└── compose.yaml
```

## How URLs map to files

The site is built with `build.format: 'file'`, so `/blog/my-post` is the file `blog/my-post.html`. A CloudFront function in `src/static-hosting-stack.ts` in the repository root maps the clean URL to that file. The link check in `scripts/check-links.mjs` applies the same rules.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 4321 is already in use | Stop the other process, or change the left side of `"4321:4321"` in `compose.yaml` |
| `/search` reports that the index is not available | Run `docker compose exec site npm run search:index` |
| A new post does not show up in search | Refresh the search index. See [Refresh the search index](#refresh-the-search-index) |
| An error about a missing package after `git pull` | Run `docker compose restart` |
| The build fails with a schema error | A post has invalid frontmatter. The message names the file and the field |
