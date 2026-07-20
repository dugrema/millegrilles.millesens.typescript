FROM node:26-bookworm-slim AS builder

RUN apt update && apt-get install git -y

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage to expose the output directory
FROM scratch AS export
COPY --from=builder /app/build /
