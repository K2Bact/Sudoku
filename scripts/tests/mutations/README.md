# Mutation manifests

The QA pipeline asks whether the gates pass. This asks whether they still know
how to fail.

Run it with `node scripts/tests/run_mutation_audit.js`, or name gates:
`node scripts/tests/run_mutation_audit.js 2-13 2-14`. `--list` prints what is
covered without running anything.

## Why this exists

Gates in this project have been green while protecting nothing, repeatedly:

| Gate | What it reported | What was true |
|---|---|---|
| 3-10 | passed | ended in `.catch(console.error)`, so a timeout exited 0 |
| 3-4 | passed | its contrast comparison had never once executed |
| 2-5 | `PERFECT` | held a stale count; deleting a stage made the numbers agree |
| 2-14 | passed | the policy said the data never leaves the device, and it did |
| 2-4 | `100% Verified` | tested the wallet alone, and the bug was in the seam |

None of those were fixed by making the gate more precise. Two of them were made
*worse* by precision: a gate that confidently holds a wrong number is harder to
doubt than one that holds none. They were found by breaking the thing the gate
claims to protect and watching what it said.

Doing that by hand produced four throwaway scripts in a single day. Hence this
directory.

## Writing a manifest

```json
{
  "gate": "2-13",
  "name": "Billing Honesty",
  "command": "node scripts/tests/unit/test_billing_honesty.js",
  "greenMarker": "Billing gate passed",
  "rebuild": false,
  "mutations": [
    {
      "name": "the entitlement is granted without a confirmed purchase",
      "why": "the shape that turned the remove-ads screen into a giveaway",
      "file": "src/services/adsService.js",
      "find": "if (res.success && res.owned) this.setAdsRemoved(true);",
      "replace": "if (res.success) this.setAdsRemoved(true);",
      "expectFailure": "confirms BOTH success and ownership"
    }
  ]
}
```

- **`find`** must match **exactly once**. Zero matches or two both fail the
  audit — a rotted anchor is the same silent pass this file exists to prevent,
  so it is never skipped.
- **`expectFailure`** is a substring of the message that must appear. Without it
  the audit would credit whichever check happened to fail first. That is not
  hypothetical: a harness that judged by exit code alone reported that a new
  coupling check had caught a mutation which an unrelated case further down the
  same gate had actually caught.
- **`why`** is printed when the mutation survives. Write the consequence for a
  player, not a restatement of the code.
- **`rebuild: true`** for any gate served by `vite preview`. Those read `dist/`,
  not the source tree, so a source mutation is invisible to them until the
  bundle is rebuilt. Getting this wrong reports SURVIVED for a gate that is
  fine.
- **`greenBy: "exit"`** only for a third-party tool with no case structure and
  no summary line. See `isGreen()` in the runner for why it is not the default.

## Verdicts

| | Meaning |
|---|---|
| `CAUGHT` | the gate went red, for the reason claimed |
| `SURVIVED` | the gate passed while the thing it guards was broken |
| `WRONG_REASON` | it went red, but an earlier failure hid this check — unproven |
| `ANCHOR_MISSING` / `ANCHOR_AMBIGUOUS` | the manifest rotted; repoint it |
| `BASELINE_RED` | the gate was already failing, so nothing can be concluded |

## When a mutation survives, suspect the mutation first

On the first full run, three mutations survived. **All three were mine, not the
gates'.**

- Contrast: the replacement colour was 191 units from the gradient, well over
  the threshold of 30. It was supposed to be unreadable and it was perfectly
  legible.
- Modal borders: the class landed in the file with escaped quotes, so the gate
  looked for `className="…"` and the file held `className=\"…\"`.
- Back navigation: the mutation was correct and never reached the browser,
  because those gates serve the last build.

Check the numbers, check what actually landed in the file, and check whether the
gate can even see it. Only then is it a finding.

## Do not run two audits at once

This tool edits the shared source tree. Two runs are not independent: one reads
a file to hold as "the original" while the other has it mutated, then faithfully
restores the broken version. Two audits were once started together, both picked
`AdBanner.jsx`, and one left `export function __renamedAdBanner` behind — which
surfaced minutes later as a lint error in a file nobody had touched.

There is a lock now. If a run was killed and the lock is stale, check
`git status` before removing it.
