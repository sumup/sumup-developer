<div align="center">

# SumUp Developer Portal 👩‍💻

[![Stars](https://img.shields.io/github/stars/sumup/sumup-developer?style=social)](https://github.com/sumup/sumup-developer/)
[![CI Status](https://github.com/sumup/sumup-developer/workflows/CI/badge.svg)](https://github.com/sumup/sumup-developer/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/sumup/sumup-developer)](./LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.1%20adopted-ff69b4.svg)](https://github.com/sumup/sumup-developer/tree/main/CODE_OF_CONDUCT.md)

The SumUp's Developer Portal provides documentation for public APIs and integrations that let external developers build payment-accepting solutions for businesses. The website is built using [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

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
cd docs
```

2. Install the dependencies

Run the following command:

```bash
npm i
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
