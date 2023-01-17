# Merge Fast Forward (Github Action)

A simple Github action for run `git merge --ff-only BRANCH` in a Github CI workflow


## Example

Example configuration:

```yml
name: 'Merge to Development'
on:
  workflow_dispatch:
  # Optional: A schedule like this would run the merge every night
  schedule:
    - cron:  '0 0 * * *'
  # Add any other trigger you'd like
jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          # Fetch the whole history to prevent unrelated history errors
          fetch-depth: '0'
          # The branch you want to checkout (usually equal to `branchtomerge`)
          ref: 'master'
      - name: Merge Fast Forward
        uses: MaximeHeckel/github-action-merge-fast-forward@v1.1.0
        with:
          # Branch to merge
          branchtomerge: master
          # Branch that will be updated
          branch: release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
