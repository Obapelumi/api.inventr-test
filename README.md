# Inventr Test API

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install
```

## Setup environment variables

1. Create a `.env` file in the project
2. Copy the contents of `.env.example` into the `.env` file and replace the neccesary credentials.

## Run Migrations & Seeders

```bash
node ace migration:run

node ace db:seed
```

## Run Integration Tests

```bash
yarn test
```

## Development Server

Start the development server on http://localhost:1221

```bash
yarn dev
```

Checkout the [Adonis.js documentation](https://adonisjs.com/) to learn more.
