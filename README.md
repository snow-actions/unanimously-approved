# Unanimously Approved

Approved by all reviewers.

## Usage

Create `.github/workflows/unanimously-approved.yml`.

```yml
name: Unanimously Approved

on:
  pull_request:
    types: [opened, reopened, synchronize, review_requested, review_request_removed]
  pull_request_review:
    types: [submitted, dismissed]

jobs:
  unanimously-approved:
    runs-on: ubuntu-latest

    steps:
      - uses: snow-actions/unanimously-approved@v1.0.0
```

## Support events

* `pull_request`
* `pull_request_review`

## Success or Fail

* :heavy_check_mark: Success when all reviewers approve
* :x: Fail when some reviewers do not approve
* :x: Fail when there is no reviewers
