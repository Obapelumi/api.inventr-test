
# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:16.13.0

# Create and change to the app directory.
WORKDIR /usr/src/app

# Set PORT & HOST For Google Cloud Run
ENV PORT 8080 
ENV HOST 0.0.0.0

# Copy application dependency manifests to the container image.
# Copying this first prevents re-running yarn install on every code change.
COPY package*.json yarn.lock ./

# Install production dependencies.
RUN yarn install

# Install Argon2
RUN yarn add argon2 --build-from-source

# Copy local code to the container image.
COPY . ./

# Build Adonis.js app
RUN yarn build

# Run Migrations
RUN node ace migration:run --force

# Run Seeders
RUN node ace db:seed

# Run the web service on container startup.
CMD [ "npm", "run", "start" ]