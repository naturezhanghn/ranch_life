#!/usr/bin/env node
/**
 * Exhaustive narrative path check, inspired by mary's recompile/symmetry tests.
 * Enumerates every water x development x governance choice and verifies that the
 * five designed endings are reachable without contradictory state.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  applyDevelopmentChoice,
  applyDroughtChoice,
  applyGovernanceChoice,
  createInitialState,
  recordClue,
  resolveEnding,
} from "../js/state.js";

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "results");
mkdirSync(outputDir, { recursive: true });

const waterChoices = ["share", "ranch", "company"];
const developmentChoices = ["coop", "company", "ecology"];
const governanceChoices = ["oversight", "autonomy", "shutdown"];
const expectedEndings = ["common", "company", "autonomy", "ecology", "split"];

const countByEnding = Object.fromEntries(expectedEndings.map((ending) => [ending, 0]));
const rows = [];

for (const water of waterChoices) {
  for (const development of developmentChoices) {
    for (const governance of governanceChoices) {
      const state = createInitialState();
      state.story.chapter = 2;
      state.story.step = "investigate";
      recordClue(state, "elder");
      recordClue(state, "archive");
      recordClue(state, "canal");
      applyDroughtChoice(state, water);
      applyDevelopmentChoice(state, development);
      applyGovernanceChoice(state, governance);
      const ending = resolveEnding(state);
      countByEnding[ending] += 1;
      rows.push({
        water,
        development,
        governance,
        ending,
        community: state.relations.community,
        workers: state.relations.workers,
        ecology: state.relations.ecology,
        corporation: state.relations.corporation,
        aiTrust: state.ai.trust,
        aiClues: Object.values(state.story.clues).filter(Boolean).length,
      });
    }
  }
}

const missing = expectedEndings.filter((ending) => countByEnding[ending] === 0);
const duplicateAssignments = new Set(
  rows.map((row) => `${row.water}/${row.development}/${row.governance}`),
);
const valid =
  missing.length === 0 &&
  rows.length === waterChoices.length * developmentChoices.length * governanceChoices.length &&
  duplicateAssignments.size === rows.length;

const report = {
  model: "ranch-life-story-paths",
  generatedAt: new Date().toISOString(),
  totalPaths: rows.length,
  expectedEndings,
  endingCounts: countByEnding,
  missingEndings: missing,
  duplicateAssignments: rows.length - duplicateAssignments.size,
  valid,
  paths: rows,
};

writeFileSync(join(outputDir, "story_paths.json"), `${JSON.stringify(report, null, 2)}\n`);

const markdown = `# Narrative path coverage

- Total enumerated paths: **${rows.length}**
- Unique choice assignments: **${duplicateAssignments.size}**
- All five endings reachable: **${missing.length === 0 ? "yes" : "no"}**

| Water choice | Development | Governance | Ending | Community |
| --- | --- | --- | --- | ---: |
${rows
  .map(
    (row) =>
      `| ${row.water} | ${row.development} | ${row.governance} | ${row.ending} | ${row.community} |`,
  )
  .join("\n")}

## Ending counts

${expectedEndings.map((ending) => `- ${ending}: ${countByEnding[ending]}`).join("\n")}
`;
writeFileSync(join(outputDir, "story_paths.md"), markdown);

console.log(`Enumerated ${rows.length} story paths.`);
console.log(JSON.stringify(countByEnding, null, 2));
console.log(`All five endings reachable: ${missing.length === 0 ? "yes" : "no"}`);

if (!valid) {
  process.exitCode = 1;
}
