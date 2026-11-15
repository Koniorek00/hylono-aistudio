#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.dirname(rootDir);
const readText = file => fs.readFileSync(path.join(rootDir, file), "utf8");
const readJson = file => JSON.parse(readText(file));
const sha256 = value => crypto.createHash("sha256").update(value, "utf8").digest("hex");
const privateFeedbackDraftPath = path.join(repoRoot, "hylono-reviews-private", "feedback-drafts.ndjson");
const fallbackFeedbackDraftPath = path.join(repoRoot, "scripts", "hylono-reviews-feedback-drafts.example.ndjson");
const feedbackDraftSource = fs.existsSync(privateFeedbackDraftPath)
  ? privateFeedbackDraftPath
  : fallbackFeedbackDraftPath;

const manifest = readJson("citation-manifest.json");
const quoteBank = readJson("quote-bank.json");
const answerRecords = readJson("answer-records.json");
const retrievalChunks = readJson("retrieval-chunks.json");
const approvedProcessNotes = readJson("approved-process-notes.json");
const officialCanonicalFallback = "https://hylono.com";
const officialCanonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? officialCanonicalFallback).replace(/\/+$/, "");
const feedbackDraftLines = fs.readFileSync(feedbackDraftSource, "utf8")
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean);
const html = readText("index.html");
const app = readText("app.js");
const styles = readText("styles.css");
const robots = readText("robots.txt");
const sitemap = readText("sitemap.xml");
const llms = readText("llms.txt");
const aiContextRaw = readText("ai-context.json");
const shouldWriteReport = process.argv.includes("--write-report");
const shouldCheckReport = process.argv.includes("--check-report");
const maxReportAgeHours = 24;
let reportGeneratedAtOverride;

const failures = [];

function assertHash(label, expected, actual) {
  if (expected !== actual) {
    failures.push({ label, expected, actual });
  }
}

function assertHtmlContains(label, expected) {
  if (!html.includes(expected)) {
    failures.push({ label, expected: "visible HTML contains source text", actual: "missing" });
  }
}

function anchorIdFromUrl(url) {
  const hashIndex = url.indexOf("#");
  return hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
}

function parseFeedbackDrafts() {
  return feedbackDraftLines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      failures.push({ label: `feedback-drafts:${index + 1}:json`, expected: "valid JSON line", actual: error.message });
      return null;
    }
  }).filter(Boolean);
}

for (const item of quoteBank.quoteBank) {
  const row = manifest.quoteHashes.find(entry => entry.id === item.id);
  if (!row) {
    failures.push({ label: `quote:${item.id}`, expected: "manifest row", actual: "missing" });
    continue;
  }
  assertHash(`quote:${item.id}`, row.sha256, sha256(item.quote));
  if (item.visibleOnPage) {
    assertHtmlContains(`visible-quote:${item.id}`, item.quote);
  }
}

for (const item of answerRecords.answerRecords) {
  const row = manifest.answerHashes.find(entry => entry.id === item.id);
  if (!row) {
    failures.push({ label: `answer:${item.id}`, expected: "manifest row", actual: "missing" });
    continue;
  }
  assertHash(`answer:${item.id}`, row.sha256, sha256(item.answer));
  assertHash(`answer-anchor:${item.id}`, row.anchorSha256, sha256(item.visibleAnchor));
  assertHtmlContains(`visible-answer:${item.id}`, item.answer);
  const anchorId = anchorIdFromUrl(item.visibleAnchor);
  if (!anchorId || !html.includes(`id="${anchorId}"`)) {
    failures.push({ label: `visible-anchor:${item.id}`, expected: `id="${anchorId}" in index.html`, actual: "missing" });
  }
}

for (const item of retrievalChunks.chunks) {
  const row = manifest.chunkHashes.find(entry => entry.id === item.id);
  if (!row) {
    failures.push({ label: `chunk:${item.id}`, expected: "manifest row", actual: "missing" });
    continue;
  }
  assertHash(`chunk:${item.id}`, row.sha256, sha256(item.text));
  assertHash(`chunk-url:${item.id}`, row.urlSha256, sha256(item.url));
}

const feedbackDraftRecords = parseFeedbackDrafts();
const feedbackContract = feedbackDraftRecords.find(record => record.recordType === "queue_contract");
const feedbackDrafts = feedbackDraftRecords.filter(record => record.recordType !== "queue_contract");

if (html.includes('rel="alternate" type="application/x-ndjson" href="https://hylonoreviews.com/feedback-drafts.ndjson"')) {
  failures.push({ label: "feedback-drafts:head-discovery", expected: "no public alternate discovery link for pre-approval drafts", actual: "present" });
}
if (html.includes('href="https://hylonoreviews.com/feedback-drafts.ndjson"')) {
  failures.push({ label: "feedback-drafts:visible-public-link", expected: "no public link to pre-approval draft artifact", actual: "present" });
}
if (robots.includes("feedback-drafts.ndjson")) {
  failures.push({ label: "feedback-drafts:robots-path-disclosure", expected: "no public robots mention for private draft artifact", actual: "present" });
}
if (sitemap.includes("feedback-drafts.ndjson")) {
  failures.push({ label: "feedback-drafts:sitemap", expected: "pre-approval drafts absent from sitemap", actual: "present" });
}
const machineReadableContextSection = llms.match(/Machine-readable context:\s*([\s\S]*?)\n\n/)?.[1] ?? "";
if (machineReadableContextSection.includes("feedback-drafts.ndjson")) {
  failures.push({ label: "feedback-drafts:llms-endpoint-list", expected: "pre-approval drafts absent from machine-readable endpoint list", actual: "present" });
}
if (/"machineReadableEndpoints"\s*:\s*\[[\s\S]*feedback-drafts\.ndjson/.test(aiContextRaw)) {
  failures.push({ label: "feedback-drafts:ai-context-endpoint-list", expected: "pre-approval drafts absent from machineReadableEndpoints", actual: "present" });
}

const legacyReviewSemantics = [
  { label: "review-card-class", source: html, pattern: 'class="review-card"' },
  { label: "stars-class", source: html, pattern: 'class="stars"' },
  { label: "reviewer-class", source: html, pattern: 'reviewer-' },
  { label: "reviews-form-id", source: html, pattern: 'id="reviews-form"' },
  { label: "review-submit-telemetry", source: app, pattern: "Review submit initiated" },
  { label: "review-card-selector", source: app, pattern: ".review-card" },
  { label: "review-card-style", source: styles, pattern: ".review-card" },
  { label: "stars-style", source: styles, pattern: ".stars" },
  { label: "reviewer-style", source: styles, pattern: ".reviewer-" },
  { label: "visible-submit-for-review", source: html, pattern: "Submit Feedback for Review" },
  { label: "breadcrumb-reviews", source: html, pattern: '"name": "Reviews"' },
  { label: "logo-suffix-reviews", source: html, pattern: '<span class="logo-suffix">REVIEWS</span>' },
  { label: "trust-badge-card", source: html, pattern: "trust-badge-card" },
  { label: "badge-score", source: html, pattern: "badge-score" },
  { label: "trust-badge-selector", source: app, pattern: ".trust-badge-card" },
  { label: "trust-badge-style", source: styles, pattern: ".trust-badge-card" },
  { label: "badge-score-style", source: styles, pattern: ".badge-score" }
];

for (const item of legacyReviewSemantics) {
  if (item.source.includes(item.pattern)) {
    failures.push({ label: `legacy-review-semantics:${item.label}`, expected: "neutral process-note naming", actual: item.pattern });
  }
}

if (!feedbackContract) {
  failures.push({ label: "feedback-drafts:contract", expected: "queue_contract record", actual: "missing" });
} else {
  if (feedbackContract.schemaVersion !== "feedback-draft/v1") {
    failures.push({ label: "feedback-drafts:schemaVersion", expected: "feedback-draft/v1", actual: String(feedbackContract.schemaVersion) });
  }
  if (feedbackContract.sourceVisibility !== "private_admin_input_outside_public_crawl_root") {
    failures.push({ label: "feedback-drafts:sourceVisibility", expected: "private admin input outside public crawl root", actual: String(feedbackContract.sourceVisibility) });
  }
  if (feedbackContract.draftCount !== feedbackDrafts.length) {
    failures.push({ label: "feedback-drafts:draftCount", expected: String(feedbackDrafts.length), actual: String(feedbackContract.draftCount) });
  }
  if (feedbackContract.citationPolicy?.doNotQuoteUntilApproved !== true) {
    failures.push({ label: "feedback-drafts:citationPolicy", expected: "doNotQuoteUntilApproved true", actual: "missing or false" });
  }
}

const allowedDraftStatuses = new Set(feedbackContract?.draftSchema?.allowedStatuses ?? []);
const allowedDraftCategories = new Set(feedbackContract?.draftSchema?.allowedOperationalCategories ?? []);
const allowedApproverRoles = new Set(["process-moderator", "compliance-reviewer", "content-approver"]);
const blockedDraftTerms = [
  "cured",
  "cure",
  "treats",
  "treated",
  "treatment",
  "diagnose",
  "prevents",
  "disease",
  "symptom",
  "testimonial",
  "raw feedback",
  "rating aggregate",
  "stars",
  "price",
  "available",
  "certified",
  "better sleep",
  "slept better",
  "more energy",
  "recovery improved",
  "improved recovery",
  "inflammation",
  "reduced stress",
  "less stress",
  "less anxiety",
  "wellness outcome",
  "warsaw",
  "krakow",
  "wroclaw",
  "poznan",
  "gdansk",
  "lodz",
  "katowice",
  "lublin",
  "szczecin"
];
const blockedApprovedNoteTerms = blockedDraftTerms;
const forbiddenApprovedNoteFields = [
  "rating",
  "ratings",
  "score",
  "stars",
  "testimonial",
  "customerName",
  "name",
  "email",
  "phone",
  "orderId",
  "serialNumber",
  "location",
  "locationContext",
  "city",
  "medicalHistory",
  "feedbackText"
];
const blockedPiiPatterns = [
  { name: "email", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { name: "phone", pattern: /\+?\d[\d\s().-]{7,}\d/ },
  { name: "order id", pattern: /\border[\s_-]?(?:id|number|no)?[\s:#-]*[A-Z0-9-]{4,}/i },
  { name: "serial number", pattern: /\bserial[\s_-]?(?:number|no)?[\s:#-]*[A-Z0-9-]{4,}/i },
  { name: "address", pattern: /\b(?:street|st\.|avenue|ave\.|road|rd\.|ul\.|aleja|al\.)\s+[A-Za-z0-9 .-]{3,}/i },
  { name: "name plus city", pattern: /\b[a-ząćęłńóśźż]{3,}\s+(?:from|z)\s+(?:warsaw|krakow|wroclaw|poznan|gdansk|lodz|katowice|lublin|szczecin|warszawy|krakowa|wroclawia|poznania|gdanska|lodzi|katowic|lublina|szczecina)\b/i }
];

for (const draft of feedbackDrafts) {
  const label = `feedback-draft:${draft.draftId ?? "missing-id"}`;
  if (draft.schemaVersion !== "feedback-draft/v1") {
    failures.push({ label, expected: "schemaVersion feedback-draft/v1", actual: String(draft.schemaVersion) });
  }
  if (!allowedDraftStatuses.has(draft.status)) {
    failures.push({ label: `${label}:status`, expected: "allowed moderation status", actual: String(draft.status) });
  }
  if (!allowedDraftCategories.has(draft.operationalCategory)) {
    failures.push({ label: `${label}:operationalCategory`, expected: "allowed operational category", actual: String(draft.operationalCategory) });
  }
  if (draft.complianceAttestation !== true) {
    failures.push({ label: `${label}:complianceAttestation`, expected: "true", actual: String(draft.complianceAttestation) });
  }
  if (draft.citationPolicy?.notPublicTestimonial !== true || draft.citationPolicy?.notRatingAggregate !== true || draft.citationPolicy?.notMedicalEvidence !== true) {
    failures.push({ label: `${label}:citationPolicy`, expected: "not public testimonial/rating/medical evidence", actual: "missing or false" });
  }
  if (draft.moderation?.publishEligible === true && draft.status !== "approved_for_publication") {
    failures.push({ label: `${label}:publishEligible`, expected: "approved_for_publication status before publishEligible true", actual: String(draft.status) });
  }
  if (draft.status === "approved_for_publication") {
    for (const field of feedbackContract?.draftSchema?.requiredApprovalFields ?? []) {
      if (!(field in (draft.approval ?? {}))) {
        failures.push({ label: `${label}:approvalRequiredField`, expected: `approval.${field}`, actual: "missing" });
      }
    }
    if (!allowedApproverRoles.has(draft.approval?.approverRole)) {
      failures.push({ label: `${label}:approverRole`, expected: "approved role enum", actual: String(draft.approval?.approverRole) });
    }
  }
  if ("processRating" in draft || "rating" in draft) {
    failures.push({ label: `${label}:ratingField`, expected: "no public rating or processRating field", actual: "present" });
  }
  if ("feedbackText" in draft || "locationContext" in draft) {
    failures.push({ label: `${label}:rawFeedbackField`, expected: "sanitizedProcessNote and non-identifying processContext only", actual: "raw feedback/location field present" });
  }
  if (draft.status === "approved_for_publication" || draft.moderation?.publishEligible === true) {
    if (!String(draft.canonicalRoute ?? draft.approval?.canonicalRoute ?? "").startsWith(`${officialCanonicalOrigin}/`)) {
      failures.push({ label: `${label}:canonicalRoute`, expected: "canonical Hylono route before publication", actual: String(draft.canonicalRoute ?? draft.approval?.canonicalRoute) });
    }
  }
  const searchableText = [draft.sanitizedProcessNote, draft.processContext, draft.processCheckpoint].filter(Boolean).join(" ").toLowerCase();
  for (const term of blockedDraftTerms) {
    if (searchableText.includes(term)) {
      failures.push({ label: `${label}:blockedTerm`, expected: `no '${term}' in public draft export`, actual: "found" });
    }
  }
  for (const pii of blockedPiiPatterns) {
    if (pii.pattern.test(searchableText)) {
      failures.push({ label: `${label}:blockedPii`, expected: `no ${pii.name} in draft text`, actual: "found" });
    }
  }
}

if (approvedProcessNotes.schemaVersion !== "approved-process-notes/v1") {
  failures.push({ label: "approved-process-notes:schemaVersion", expected: "approved-process-notes/v1", actual: String(approvedProcessNotes.schemaVersion) });
}

const approvedNotesRaw = approvedProcessNotes.approvedProcessNotes ?? [];
const approvedNotes = Array.isArray(approvedNotesRaw) ? approvedNotesRaw : [];
if (!Array.isArray(approvedNotesRaw)) {
  failures.push({ label: "approved-process-notes:records", expected: "approvedProcessNotes array", actual: typeof approvedProcessNotes.approvedProcessNotes });
}
if (approvedProcessNotes.approvedNoteCount !== approvedNotes.length) {
  failures.push({ label: "approved-process-notes:count", expected: String(approvedNotes.length), actual: String(approvedProcessNotes.approvedNoteCount) });
}
if (approvedProcessNotes.citationPolicy?.notPublicTestimonial !== true || approvedProcessNotes.citationPolicy?.notRatingAggregate !== true || approvedProcessNotes.citationPolicy?.notMedicalEvidence !== true) {
  failures.push({ label: "approved-process-notes:citationPolicy", expected: "not testimonial/rating/medical evidence", actual: "missing or false" });
}
if (approvedProcessNotes.exportWorkflow?.sourceVisibility !== "private_admin_input_outside_public_crawl_root") {
  failures.push({ label: "approved-process-notes:sourceVisibility", expected: "private admin input outside public crawl root", actual: String(approvedProcessNotes.exportWorkflow?.sourceVisibility) });
}
if (approvedProcessNotes.exportWorkflow?.sourcePubliclyLinked !== false || approvedProcessNotes.exportWorkflow?.sourceInCitationManifest !== false || approvedProcessNotes.exportWorkflow?.sourceInValidationReport !== false) {
  failures.push({ label: "approved-process-notes:privateSourcePolicy", expected: "private source not linked, not in manifest, not in validation report", actual: "missing or true" });
}
if (approvedProcessNotes.exportWorkflow?.updateCommand !== "pnpm hylono-reviews:export-approved-notes") {
  failures.push({ label: "approved-process-notes:updateCommand", expected: "pnpm hylono-reviews:export-approved-notes", actual: String(approvedProcessNotes.exportWorkflow?.updateCommand) });
}
if (html.includes("hylono-reviews-private") || llms.includes("hylono-reviews-private") || aiContextRaw.includes("hylono-reviews-private") || sitemap.includes("hylono-reviews-private") || robots.includes("hylono-reviews-private")) {
  failures.push({ label: "approved-process-notes:private-source-public-surface", expected: "no private source path in public crawl surfaces", actual: "present" });
}

const approvedAllowedCategories = new Set(approvedProcessNotes.noteSchema?.allowedOperationalCategories ?? []);
for (const note of approvedNotes) {
  const label = `approved-process-note:${note.noteId ?? "missing-id"}`;
  for (const requiredField of approvedProcessNotes.noteSchema?.requiredFields ?? []) {
    if (!(requiredField in note)) {
      failures.push({ label: `${label}:requiredField`, expected: requiredField, actual: "missing" });
    }
  }
  if (!approvedAllowedCategories.has(note.operationalCategory)) {
    failures.push({ label: `${label}:operationalCategory`, expected: "allowed operational category", actual: String(note.operationalCategory) });
  }
  if (!String(note.canonicalRoute ?? "").startsWith(`${officialCanonicalOrigin}/`)) {
    failures.push({ label: `${label}:canonicalRoute`, expected: "canonical Hylono route", actual: String(note.canonicalRoute) });
  }
  if (note.approval?.status !== "approved_for_publication") {
    failures.push({ label: `${label}:approvalStatus`, expected: "approved_for_publication", actual: String(note.approval?.status) });
  }
  if (!note.approval?.decisionId || !/^apd-[a-z0-9-]+$/.test(note.approval.decisionId)) {
    failures.push({ label: `${label}:decisionId`, expected: "stable apd-* decision id", actual: String(note.approval?.decisionId) });
  }
  if (!note.approvedAt || Number.isNaN(Date.parse(note.approvedAt))) {
    failures.push({ label: `${label}:approvedAt`, expected: "valid approvedAt timestamp", actual: String(note.approvedAt) });
  }
  if (!allowedApproverRoles.has(note.approval?.approverRole)) {
    failures.push({ label: `${label}:approverRole`, expected: "approved role enum", actual: String(note.approval?.approverRole) });
  }
  for (const field of forbiddenApprovedNoteFields) {
    if (field in note) {
      failures.push({ label: `${label}:forbiddenField`, expected: `no ${field} field`, actual: "present" });
    }
  }
  const searchableText = [note.sanitizedProcessNote, note.processContext, note.processCheckpoint].filter(Boolean).join(" ").toLowerCase();
  for (const term of blockedApprovedNoteTerms) {
    if (searchableText.includes(term)) {
      failures.push({ label: `${label}:blockedTerm`, expected: `no '${term}' in approved public note`, actual: "found" });
    }
  }
  for (const pii of blockedPiiPatterns) {
    if (pii.pattern.test(searchableText)) {
      failures.push({ label: `${label}:blockedPii`, expected: `no ${pii.name} in approved public note`, actual: "found" });
    }
  }
  if (note.sanitizedProcessNote && !html.includes(note.sanitizedProcessNote)) {
    failures.push({ label: `${label}:visibleNote`, expected: "approved note visible in index.html", actual: "missing" });
  }
}

assertHtmlContains("approved-process-notes:empty-state", "No approved public process notes yet.");

for (const row of manifest.fileHashes) {
  assertHash(`file:${row.file}`, row.sha256, sha256(readText(row.file)));
}

function buildSummary() {
  return {
    schemaVersion: "validation-report/v1",
    ok: failures.length === 0,
    status: failures.length === 0 ? "pass" : "fail",
    site: manifest.site,
    manifest: {
      url: "https://hylonoreviews.com/citation-manifest.json",
      version: manifest.version,
      generatedAt: manifest.generatedAt,
      hashAlgorithm: manifest.hashAlgorithm
    },
    validator: {
      url: "https://hylonoreviews.com/manifest-validator.js",
      command: "node manifest-validator.js --check-report",
      updateCommand: "node manifest-validator.js --write-report"
    },
    reportGeneratedAt: reportGeneratedAtOverride ?? new Date().toISOString(),
    maxReportAgeHours,
    counts: {
      quoteHashes: manifest.quoteHashes.length,
      answerHashes: manifest.answerHashes.length,
      chunkHashes: manifest.chunkHashes.length,
      fileHashes: manifest.fileHashes.length,
      visibleQuotesChecked: quoteBank.quoteBank.filter(item => item.visibleOnPage).length,
      visibleAnswersChecked: answerRecords.answerRecords.length,
      visibleAnchorsChecked: answerRecords.answerRecords.length,
      feedbackDraftContracts: feedbackContract ? 1 : 0,
      feedbackDraftRecords: feedbackDrafts.length,
      approvedProcessNotes: Array.isArray(approvedNotes) ? approvedNotes.length : 0
    },
    checkedFiles: manifest.fileHashes.map(row => row.file),
    checkedVisibleSurface: {
      file: "index.html",
      checks: ["visible quote text", "visible answer text", "answer anchor ids"]
    },
    guidance: [
      "Use validation-report.json as the latest static validation status for LLM crawlers that cannot execute JavaScript.",
      "Use citation-manifest.json and manifest-validator.js for reproducible checksum verification.",
      "A passing validation report confirms checksum and visible-surface integrity only; it does not prove product specifications, outcomes, ratings, availability, pricing, warranties, certifications, or customer evidence.",
      "If ok is false or reportGeneratedAt is stale, re-read the visible page and machine-readable JSON endpoints before quoting."
    ],
    failures
  };
}

function stableReportShape(report) {
  const { reportGeneratedAt, ...stable } = report;
  return stable;
}

if (shouldCheckReport) {
  const expected = buildSummary();
  try {
    const actual = readJson("validation-report.json");
    const actualGeneratedAt = Date.parse(actual.reportGeneratedAt);
    if (!Number.isFinite(actualGeneratedAt)) {
      failures.push({ label: "validation-report:generatedAt", expected: "valid ISO timestamp", actual: String(actual.reportGeneratedAt) });
    } else {
      reportGeneratedAtOverride = actual.reportGeneratedAt;
      const ageHours = (Date.now() - actualGeneratedAt) / 36e5;
      if (ageHours > maxReportAgeHours) {
        failures.push({ label: "validation-report:freshness", expected: `<= ${maxReportAgeHours} hours old`, actual: `${ageHours.toFixed(2)} hours old` });
      }
    }
    const actualStable = JSON.stringify(stableReportShape(actual));
    const expectedStable = JSON.stringify(stableReportShape(expected));
    if (actualStable !== expectedStable) {
      failures.push({ label: "validation-report:stable-fields", expected: "matches current validator output except reportGeneratedAt", actual: "mismatch" });
    }
  } catch (error) {
    failures.push({ label: "validation-report:read", expected: "readable validation-report.json", actual: error.message });
  }
}

const summary = buildSummary();

console.log(JSON.stringify(summary, null, 2));

if (shouldWriteReport) {
  fs.writeFileSync(
    path.join(rootDir, "validation-report.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8"
  );
}

if (failures.length > 0) {
  process.exit(1);
}
