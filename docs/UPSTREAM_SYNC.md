# Upstream Synchronization Guide

This guide explains how to keep your forked repository (`viosson-d/P16-Topoo-Gateway`) synchronized with the upstream repository (`lbjlaq/Antigravity-Manager`).

## Prerequisites

Ensure you have the `upstream` remote configured:

```bash
git remote -v
# Should show:
# upstream https://github.com/lbjlaq/Antigravity-Manager.git (fetch)
# upstream https://github.com/lbjlaq/Antigravity-Manager.git (push)
```

If not, add it:

```bash
git remote add upstream https://github.com/lbjlaq/Antigravity-Manager.git
```

## Automatic Sync

We have provided a script to automate the sync process:

```bash
./scripts/sync_upstream.sh
```

This script will:

1. Check for uncommitted changes (prompts to stash if necessary).
2. Fetch changes from the `upstream` remote.
3. Merge `upstream/main` into your current branch.
4. Handle stash restoration if needed.

## Manual Sync

If you prefer to sync manually, follow these steps:

1. **Fetch Upstream Changes:**

    ```bash
    git fetch upstream
    ```

2. **Merge into Current Branch:**

    ```bash
    git merge upstream/main
    ```

## Handling Conflicts

If a merge conflict occurs (either via script or manual merge):

1. Open the conflicting files in your editor (e.g., VS Code).
2. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Decide which changes to keep:
    - **Accept Current Change (HEAD):** Keep your local modifications.
    - **Accept Incoming Change:** Use the upstream version.
    - **Accept Both Changes:** Merge both manually.
4. After resolving conflicts, add and commit the changes:

    ```bash
    git add .
    git commit -m "Merge upstream changes and resolve conflicts"
    ```

## Pushing Changes

After merging upstream changes, push them to your origin repository:

```bash
git push origin HEAD
```
