/**
 * Tests for RBP (Ralph-Beads-Proof) stack integration.
 */

import { describe, test, expect } from "bun:test";
import { existsSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = process.cwd();

describe("RBP Stack Structure", () => {
  test("scripts/rbp/ directory exists", () => {
    expect(existsSync(join(PROJECT_ROOT, "scripts/rbp"))).toBe(true);
  });

  test("ralph.sh exists and is the main orchestrator", () => {
    expect(existsSync(join(PROJECT_ROOT, "scripts/rbp/ralph.sh"))).toBe(true);
  });

  test(".beads/ directory initialized", () => {
    expect(existsSync(join(PROJECT_ROOT, ".beads"))).toBe(true);
  });

  test("slash commands exist", () => {
    const commandsDir = join(PROJECT_ROOT, ".claude/commands/rbp");
    expect(existsSync(join(commandsDir, "start.md"))).toBe(true);
    expect(existsSync(join(commandsDir, "status.md"))).toBe(true);
  });
});

describe("Configuration Files", () => {
  test("rbp-config.yaml exists", () => {
    expect(existsSync(join(PROJECT_ROOT, "rbp-config.yaml"))).toBe(true);
  });

  test("package.json exists (bun initialized)", () => {
    expect(existsSync(join(PROJECT_ROOT, "package.json"))).toBe(true);
  });

  test("pyproject.toml exists (uv initialized)", () => {
    expect(existsSync(join(PROJECT_ROOT, "pyproject.toml"))).toBe(true);
  });
});

describe("Finance Guru Tools", () => {
  test("risk metrics CLI exists", () => {
    expect(existsSync(join(PROJECT_ROOT, "src/analysis/risk_metrics_cli.py"))).toBe(true);
  });

  test("momentum CLI exists", () => {
    expect(existsSync(join(PROJECT_ROOT, "src/utils/momentum_cli.py"))).toBe(true);
  });

  test("volatility CLI exists", () => {
    expect(existsSync(join(PROJECT_ROOT, "src/utils/volatility_cli.py"))).toBe(true);
  });
});
