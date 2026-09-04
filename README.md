# First Move

[ภาษาไทย](README.th.md) | English

First Move is a private, local-first job application tracker built with Nuxt. It combines a visual application pipeline with a job discovery workspace, follow-up reminders, response metrics, and JSON backup tools.

## Features

- Track opportunities through `Saved`, `Applied`, `Responded`, `Interview`, `Offer`, `Rejected`, and `Withdrawn`.
- Move cards by drag and drop or use the status selector on each card.
- Record the important middle step where an employer has replied or sent a test but no interview has been scheduled yet.
- See application totals, active conversations, response rate, and average first-response time.
- Receive reminders when an active application has had no activity for a configurable number of days.
- Search and filter the pipeline by keyword, platform, work mode, and date.
- Discover jobs from up to six live sources, depending on the selected region.
- Search the official JobsDB website using a matching filter link.
- Import and export versioned JSON backups.
- Use a responsive, collapsible sidebar whose preference is remembered in the browser.

## Technology

- [Nuxt 3](https://nuxt.com/) and Vue 3
- TypeScript
- Tailwind CSS
- Zod for input and backup validation
- Vitest
- Lucide icons

## Requirements

- Node.js 20.19+ on the 20.x release line, or Node.js 22.12+
- npm

## Getting started

```bash
git clone https://github.com/Fujipp/job-tracker.git
cd job-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm test          # Run the test suite
```

## How to use it

### Pipeline

1. Select **Add opportunity**.
2. Paste the job URL and enter the role and company details.
3. Move the card to **Applied** after submitting the application.
4. Use **Responded** when the employer replies, requests more information, or sends a test before arranging an interview.
5. Continue moving the card as the application progresses.

The reminder panel highlights active applications that have been quiet longer than the threshold in **Settings**. Logging a follow-up resets the activity timer.

### Discover

The Discover page can combine results from these sources:

- ไทยมีงานทำ — Department of Employment, Thailand
- Job Opportunities API
- Jobicy
- Remote OK
- Remotive
- Remote Landers

Available sources vary by region. Results are cached in memory for 15 minutes. The **Refresh** button requests fresh results. JobsDB is not ingested because it does not provide a public applicant search API; the JobsDB button opens its official search page instead.

External job listings can change or expire. Always confirm the role, compensation, location, and application instructions on the original listing.

## Local data and privacy

Application data is stored in:

```text
data/job-tracker.json
```

This file is excluded from Git. The storage directory can be changed with:

```bash
JOB_TRACKER_DATA_DIR=/absolute/path/to/data npm run dev
```

The pipeline does not require an account or send its stored application records to a hosted database. The Discover page does make outbound requests to job providers, and **Get details** requests metadata from the job URL supplied by the user.

This is a single-user local application. If it is exposed on a network or deployed publicly, add authentication and appropriate persistent storage first.

## Backups

- **Export** downloads all jobs, settings, status history, and dismissed discoveries as JSON.
- **Import** validates the file, previews the number of new, updated, and duplicate records, and writes data only after confirmation.
- Keep exported backups private because notes and application history may contain personal information.

## Project structure

```text
assets/css/          Global styles and design tokens
components/          Logo, sidebar, cards, and form components
pages/               Pipeline and Discover pages
public/              Static brand assets
server/api/          Job, discovery, settings, import, and export endpoints
server/utils/        Local JSON data store
shared/              Shared types, schemas, and job utilities
tests/               Unit tests
```

## Production

```bash
npm run build
node .output/server/index.mjs
```

Set `JOB_TRACKER_DATA_DIR` to a writable persistent directory in production. The default local JSON store is not suitable for serverless or multi-instance deployments.

## License

No license has been specified yet. Add a license before redistributing the project.
