<div align="center">

# SumUp Docs 👩‍💻

The SumUp's Docs provider documentation for public APIs and integrations that let external developers build payment-accepting solutions for businesses. The website is built using [Astro](https://astro.build/) and [Markdoc](https://markdoc.dev/). It also implements custom rendering logic for the OpenAPI specs.

With any questions, please reach out to [#sumup-for-developers](https://sumup.slack.com/archives/C03A06VG287).

</div>

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development](#development)
  - [Local Environment](#local-environment)
  - [Build](#build)
  - [API Specs](#api-specs)
- [Deployment](#deployment)
- [Search](#search)
  - [Crawler](#crawler)

## Getting Started

### Prerequisites

- Make sure you have [**Node.js v20+**](https://nodejs.org/en/about/previous-releases#nodejs-releases) installed. It is highly recommended to install a [Node version manager](http://npm.github.io/installation-setup-docs/installing/using-a-node-version-manager.html) (such as [nvm](https://github.com/nvm-sh/nvm)) that enables you to switch between multiple versions of Node.js.
- The docs are hosted on [Vercel](https://vercel.com/). [Join SumUp’s team](http://vercel.com/teams/invite/ctaHGLeB) on Vercel and install the [Vercel CLI](https://vercel.com/docs/cli) to be able to download environment variables and deploy the docs.

### Installation

1. Clone the repository

Open your terminal and navigate to the directory where you would like to store the project. Then run the following commands:

```bash
git clone git@github.com:sumup/docs.git
cd docs
```

2. Install the dependencies

Run the following command:

```bash
npm i
```

3. Pull the environment variables

All [environment variables](https://vercel.com/sumup/documentation/settings/environment-variables) for the docs are managed in Vercel. Using the [Vercel CLI](https://vercel.com/docs/cli), log in to your account, link your local repository with the "documentation" project in the "SumUp" team on Vercel, and download the development environment variables to the `.env.local` file.

```bash
vercel login
vercel link
vercel env pull .env
```

Learn more about managing environment variables in the [Vercel docs](https://vercel.com/docs/concepts/projects/environment-variables).

### Previous version of developer portal

The last commit for the previous version of the developer portal is [b9774bc](https://github.com/sumup/documentation/commit/b9774bcb09e89921f9b44176cd94d534b448527a). The latest version was introduced by [#470](https://github.com/sumup/documentation/pull/470).

You can browse the code at this point by:

```bash
git checkout b9774bcb09e89921f9b44176cd94d534b448527a
```

## Development

### Local Environment

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

```
$ npm run dev
```

### Build

```
$ npm run build
```

This is a good way to test that everything will succeed when your changes are merged and are going to be deployed.

## API Specs

The OpenAPI specs used for the [API Reference](https://developer.sumup.com/api) section of the developer portal are managed by [sumup/collector](https://github.com/sumup/collector) and automatically synchronized to this repository. For changes and documentation refer to the [linked repository](https://github.com/sumup/collector).

## Deployment

Every commit on every branch is deployed by [Vercel](https://vercel.com) to a unique URL. When you open a (draft) pull request, Vercel leaves a comment with the URL to the deployment. The comment also includes a link to the [Vercel dashboard](https://vercel.com/sumup/documentation) where you can inspect and manage the deployment ([you need to join the Vercel organization first](https://docs.google.com/forms/d/e/1FAIpQLSeUAZeySsnmutLkR_J1QKHMF3I3Rts_RvIgj0ng4jbms34F0Q/viewform?usp=sharing)).

Vercel assigns permanent domains to the latest deployments on these branches:

- `main` → [developer.sumup.com](https://developer.sumup.com), points to the _live_ backend environment
- `stage` → [developer-stage.sumup-vercel.app](https://developer-stage.sumup-vercel.app), points to the _stage_ backend environment. Synced automatically with the `main` branch every day from Monday to Friday at 6 AM UTC through a [GitHub Action](https://github.com/sumup/documentation/actions/workflows/stage.yml).
- `theta` → [developer-theta.sumup-vercel.app](https://developer-theta.sumup-vercel.app), points to the _theta_ backend environment. Synced automatically with the `main` branch every Monday at 6 AM UTC through a [GitHub Action](https://github.com/sumup/documentation/actions/workflows/theta.yml).

## Search

The search is built on top of [pagefind](https://pagefind.app/). Refer to the [docs](https://pagefind.app/) for detailed documentation, e.g. [Configuring what content is indexed](https://pagefind.app/docs/indexing/).

The Astro plugin is under [src/lib/pagefind.js](./src/lib/pagefind.js) and takes care of indexing during the build state and in the local development. The search functionality itself is contained in [src/components/Search.astro](./src/components/Search.astro).

## Common Issues

### Search doesn't work

Search requires `pagefind.js` file which is dynamically generated during build (`npm run build`). To run the search locally, run `npm run build`.
