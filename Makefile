# Makefile
# Makefile
# --- Configuration ---
VERSION ?= 2026.3
BUILD_NUMBER ?= 1
VERSION_FULL ?= $(VERSION).$(BUILD_NUMBER)
ARCHIVE_NAME ?= millegrilles_millesens_typescript
DATE_STR := $(shell date '+%Y-%m-%d %H:%M')

# --- Paths ---
ARTIFACTS_DIR = artifacts

# --- Environment ---
NODE_OPTIONS = --openssl-legacy-provider
CI = false

# --- Targets ---
.PHONY: all build prepare package clean deploy

all: package

# 1. Prepare build assets (Kept for backward compatibility or local use)
prepare:
	@echo "==> Preparing build assets..."
	@mkdir -p build_assets
	@printf '{\n' > build_assets/manifest.build.json
	@printf '  "date": "%s",\n' "$(DATE_STR)" >> build_assets/manifest.build.json
	@printf '  "version": "%s"\n' "$(VERSION_FULL)" >> build_assets/manifest.build.json
	@printf '}\n' >> build_assets/manifest.build.json

# 2. Install and Build
build: prepare
	@echo "==> Installing dependencies and building..."
	@NODE_OPTIONS=$(NODE_OPTIONS) CI=$(CI) npm install
	@NODE_OPTIONS=$(NODE_OPTIONS) CI=$(CI) npm run build

# 3. Package the artifacts using docker buildx
package:
	@echo "==> Packaging artifacts using Docker..."
	@mkdir -p $(ARTIFACTS_DIR)
	@docker build --target export \
		--output type=local,dest=$(ARTIFACTS_DIR) \
		--build-arg VERSION=$(VERSION) \
		--build-arg BUILD_NUMBER=$(BUILD_NUMBER) .
	@echo "==> Artifacts generated in $(ARTIFACTS_DIR)"

# 4. Deploy the artifacts
deploy: package
	@echo "==> Deploying artifact $(ARCHIVE_NAME).$(VERSION_FULL).tar.gz"
	@rsync "$(ARTIFACTS_DIR)/$(ARCHIVE_NAME).$(VERSION_FULL).tar.gz" ${DEPLOY_RSYNC_WEBAPP_DEST}/millesens
	${DEPLOY_CATALOGUE_UPDATE_COMMAND} --baseurl https://libs.millegrilles.com/archives/millesens --archive "archives/millesens/$(ARCHIVE_NAME).$(VERSION_FULL).tar.gz"


# Clean up build artifacts
clean:
	@echo "==> Cleaning..."
	@rm -rf $(ARTIFACTS_DIR)
	@rm -rf build_assets
	@rm -rf build
	@rm -rf dist
	@rm -rf node_modules
