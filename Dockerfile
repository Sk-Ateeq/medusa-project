FROM node:18-alpine

# Enable Corepack and install Yarn 3.2.1
RUN corepack enable && corepack prepare yarn@3.2.1 --activate

WORKDIR /app

# Install build tools (alpine needs these for native deps)
RUN apk add --no-cache python3 make g++

# Copy dependency files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install

# Copy rest of the app
COPY . .

EXPOSE 9000

CMD ["yarn", "start"]

