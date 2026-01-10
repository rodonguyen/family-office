---
allowed-tools: Bash, Read, Glob
description: Start the RBP autonomous execution loop
argument-hint: [spec-file | max-iterations]
---

# /rbp:start

Start the RBP autonomous execution loop to implement tasks with test-gated verification.

## Variables

ARG1: $1 (optional - either a spec file path OR max iterations number)
MAX_ITERATIONS: default 10
SCRIPTS_DIR: scripts/rbp
PROGRESS_FILE: scripts/rbp/progress.txt

## Workflow

1. Run `bd status` to show current task state
2. Run `bd ready` to check for available tasks

### If NO tasks available:

3. **Auto-discover specs** - Look for spec files:
   - Check if ARG1 is a file path (ends in .md) → use that spec
   - Otherwise, search common spec locations:
     - `specs/*.md`
     - `docs/specs/*.md`
     - `*.spec.md`
   - Use Glob tool to find spec files

4. **If spec found:**
   - Show the spec file(s) found
   - Ask user which spec to use (if multiple)
   - Run `./rbp/scripts/parse-spec-to-beads.sh <spec-file>` to create tasks
   - Run `bd ready` again to confirm tasks were created

5. **If NO spec found:**
   - Report "No tasks in beads and no spec files found"
   - Suggest: "Create a spec with /quick-plan or add tasks with bd create"
   - Stop

### If tasks ARE available:

6. Confirm with user before starting execution loop
7. Run `./rbp/scripts/ralph.sh MAX_ITERATIONS` to start the execution loop
8. Monitor output for completion or errors

## Report

RBP Execution Started

Status: Execution loop running
Max Iterations: `MAX_ITERATIONS`
Progress Log: `PROGRESS_FILE`

Monitor with:
- `bd status` - Task overview
- `tail -f `PROGRESS_FILE`` - Live progress
- `Ctrl+C` - Stop execution
