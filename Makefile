.PHONY: help install dev build test format check-format watch clean clean-all status rebuild

# Default target
.DEFAULT_GOAL := help

# Detect if we're on Windows and adjust npm command
ifeq ($(OS),Windows_NT)
    NPM := npm.cmd
else
    NPM := npm
endif

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@printf "$(CYAN)HN Hiring Scanner Frontend - Makefile Commands$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Available targets:$(NC)\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@printf "\n"

install: ## Install dependencies
	@printf "$(GREEN)Installing dependencies...$(NC)\n"
	$(NPM) install

dev: ## Start development server
	@printf "$(GREEN)Starting development server...$(NC)\n"
	$(NPM) start

build: ## Build for production
	@printf "$(GREEN)Building for production...$(NC)\n"
	$(NPM) run build

test: ## Run tests
	@printf "$(GREEN)Running tests...$(NC)\n"
	$(NPM) test

format: ## Format code with prettier
	@printf "$(GREEN)Formatting code...$(NC)\n"
	npx prettier --write "src/**/*.{ts,html,scss,css,json}"

check-format: ## Check code formatting without making changes
	@printf "$(GREEN)Checking code format...$(NC)\n"
	npx prettier --check "src/**/*.{ts,html,scss,css,json}"

watch: ## Build in watch mode
	@printf "$(GREEN)Starting watch mode...$(NC)\n"
	$(NPM) run watch

clean: ## Clean build artifacts
	@printf "$(RED)Cleaning build artifacts...$(NC)\n"
	rm -rf dist
	rm -rf .angular
	@printf "$(GREEN)✓ Clean complete!$(NC)\n"

clean-all: clean ## Clean all artifacts including node_modules
	@printf "$(RED)Cleaning all artifacts including dependencies...$(NC)\n"
	rm -rf node_modules
	@printf "$(GREEN)✓ Deep clean complete!$(NC)\n"

status: ## Show project status
	@printf "$(CYAN)Project Status$(NC)\n"
	@printf "\n"
	@if [ -d node_modules ]; then \
		printf "  $(GREEN)✓$(NC) Dependencies installed\n"; \
	else \
		printf "  $(RED)✗$(NC) Dependencies not installed (run 'make install')\n"; \
	fi
	@if [ -d dist ]; then \
		printf "  $(GREEN)✓$(NC) Build exists\n"; \
	else \
		printf "  $(YELLOW)✗$(NC) No build found\n"; \
	fi

rebuild: clean build ## Clean and rebuild
