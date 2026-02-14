<div align="center">

# SumUp Developer Portal 👩‍💻

[![Documentation][docs-badge]](https://developer.sumup.com)
[![CI Status](https://github.com/sumup/sumup-developer/workflows/CI/badge.svg)](https://github.com/sumup/sumup-developer/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/sumup/sumup-developer)](./LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.1%20adopted-ff69b4.svg)](https://github.com/sumup/sumup-developer/tree/main/CODE_OF_CONDUCT.md)

The SumUp's Developer Portal provides documentation for integrations, SDKs, and public APIs that let external developers build payment-acceptance solutions. The website is built using [Astro](https://astro.build/) and [Markdoc](https://markdoc.dev/).

</div>

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development](#development)
  - [Local Environment](#local-environment)
  - [Build](#build)

## Getting Started

### Prerequisites

- Make sure you have [**Node.js v20+**](https://nodejs.org/en/about/previous-releases#nodejs-releases) installed. It is highly recommended to install a [Node version manager](http://npm.github.io/installation-setup-docs/installing/using-a-node-version-manager.html) (such as [nvm](https://github.com/nvm-sh/nvm)) that enables you to switch between multiple versions of Node.js.

### Installation

1. Clone the repository

Open your terminal and navigate to the directory where you would like to store the project. Then run the following commands:

```bash
git clone git@github.com:sumup/sumup-developer.git
cd sumup-developer
```

2. Install the dependencies

Run the following command:

```bash
npm i
```

## Development

### Local Environment

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

```bash
npm run dev
```

### Build

```bash
npm run build
```

This is a good way to test that everything will succeed when your changes are merged and are going to be deployed.

## API Specs

The OpenAPI specs used for the [API Reference](https://developer.sumup.com/api) section of the developer portal are managed externally from a different repository and synchronized every time they change. If you spotted a mistake or have a suggestion for an improvement please open an issue here and we will take a look.

[docs-badge]: https://img.shields.io/badge/SumUp-documentation-white.svg?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgY29sb3I9IndoaXRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgPHBhdGggZD0iTTIyLjI5IDBIMS43Qy43NyAwIDAgLjc3IDAgMS43MVYyMi4zYzAgLjkzLjc3IDEuNyAxLjcxIDEuN0gyMi4zYy45NCAwIDEuNzEtLjc3IDEuNzEtMS43MVYxLjdDMjQgLjc3IDIzLjIzIDAgMjIuMjkgMFptLTcuMjIgMTguMDdhNS42MiA1LjYyIDAgMCAxLTcuNjguMjQuMzYuMzYgMCAwIDEtLjAxLS40OWw3LjQ0LTcuNDRhLjM1LjM1IDAgMCAxIC40OSAwIDUuNiA1LjYgMCAwIDEtLjI0IDcuNjlabTEuNTUtMTEuOS03LjQ0IDcuNDVhLjM1LjM1IDAgMCAxLS41IDAgNS42MSA1LjYxIDAgMCAxIDcuOS03Ljk2bC4wMy4wM2MuMTMuMTMuMTQuMzUuMDEuNDlaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPC9zdmc+
