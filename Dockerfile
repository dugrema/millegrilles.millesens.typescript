# Dockerfile

# --- Base stage for dependencies ---
FROM node:26-bookworm-slim AS base
WORKDIR /app
# Install git for github dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
# Use the same NODE_OPTIONS as in Makefile
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm ci

# --- Builder stage for React build ---
FROM base AS builder
COPY . .
# 1. Prepare build assets (mimic Makefile prepare)
RUN mkdir -p build_assets && \
    echo "{\n  \"date\": \"$(date '+%Y-%m-%d %H:%M')\",\n  \"version\": \"${VERSION_FULL}\"\n}" > build_assets/manifest.build.json
RUN npm run build

# --- Packager stage ---
FROM python:3-slim-bookworm AS packager
WORKDIR /app

# Arguments for versioning
ARG VERSION=2026.3
ARG BUILD_NUMBER=1
# These are used during the build process
ENV VERSION_FULL=${VERSION}.${BUILD_NUMBER}
ENV ARCHIVE_NAME=millegrilles_millesens_typescript

# Copy build artifacts from builder
COPY --from=builder /app/build/client ./build_client
COPY --from=builder /app/catalogue ./catalogue

# 1. Prepare build assets (mimic Makefile prepare)
RUN mkdir -p build_assets && \
    echo "{\n  \"date\": \"$(date '+%Y-%m-%d %H:%M')\",\n  \"version\": \"${VERSION_FULL}\"\n}" > build_assets/manifest.build.json

# 2. Update version in metadata.json (mimic Makefile package step)
RUN python3 -c "import json, sys; \
    path = sys.argv[1]; \
    data = json.load(open(path)); \
    data['version'] = sys.argv[2]; \
    json.dump(data, open(path, 'w'), indent=2)" \
    catalogue/metadata.json "${VERSION_FULL}"

# 3. Gzip files (mimic Makefile package step)
RUN mkdir -p files && \
    cp -r build_client/. files/ && \
    find files/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.map" -o -name "*.json" \) -exec gzip -k {} \;

# 4. Create archive (mimic Makefile package step)
RUN mkdir -p staging/files && \
    cp -r catalogue/. staging/ && \
    cp -r files/. staging/files/ && \
    cp -r build_assets/ staging/build_assets/ && \
    mkdir -p artifacts && \
    tar -C staging -zcf "artifacts/${ARCHIVE_NAME}.${VERSION_FULL}.tar.gz" . && \
    sha256sum "artifacts/${ARCHIVE_NAME}.${VERSION_FULL}.tar.gz" > "artifacts/${ARCHIVE_NAME}.${VERSION_FULL}.tar.gz.sha256"

# --- Export stage ---
FROM scratch AS export
# Copying files to the root of the export stage
COPY --from=packager /app/artifacts/millegrilles_millesens_typescript.*.tar.gz /
COPY --from=packager /app/artifacts/millegrilles_millesens_typescript.*.tar.gz.sha256 /
