#!/bin/bash

# Configuration
UPSTREAM_REMOTE="upstream"
UPSTREAM_BRANCH="main"
CURRENT_BRANCH=$(git branch --show-current)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting upstream sync process...${NC}"

# Check if upstream remote exists
if ! git remote | grep -q "^${UPSTREAM_REMOTE}$"; then
    echo -e "${RED}Error: Remote '${UPSTREAM_REMOTE}' does not exist.${NC}"
    echo "Please add it using: git remote add ${UPSTREAM_REMOTE} <upstream-url>"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes.${NC}"
    read -p "Do you want to stash them and continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborting sync process.${NC}"
        exit 1
    fi
    echo "Stashing changes..."
    git stash save "Auto-stash before upstream sync"
    STASHED=true
fi

# Fetch upstream
echo -e "${GREEN}Fetching changes from ${UPSTREAM_REMOTE}...${NC}"
git fetch ${UPSTREAM_REMOTE}

# Merge upstream changes
echo -e "${GREEN}Merging ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH} into ${CURRENT_BRANCH}...${NC}"
if git merge ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}; then
    echo -e "${GREEN}Successfully merged upstream changes!${NC}"
    
    if [ "$STASHED" = true ]; then
        echo -e "${YELLOW}Restoring stashed changes...${NC}"
        if git stash pop; then
            echo -e "${GREEN}Stash restored successfully.${NC}"
        else
            echo -e "${RED}Conflict detected while restoring stash.${NC}"
            echo "Please resolve conflicts manually."
        fi
    fi
else
    echo -e "${RED}Merge conflict detected!${NC}"
    echo "Please resolve conflicts manually, then run:"
    echo "  git add ."
    echo "  git commit -m 'Merge upstream changes'"
    if [ "$STASHED" = true ]; then
        echo "After resolving merge conflicts, don't forget to run 'git stash pop' to restore your changes."
    fi
    exit 1
fi

echo -e "${GREEN}Sync complete!${NC}"
