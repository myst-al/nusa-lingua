#!/usr/bin/env bash
# NusaLingua — Regenerate DOCX exports dari sumber MD
# Usage: cd nusalingua-mvp && bash docs/exports-docx/build.sh

set -e
cd "$(dirname "$0")/../.."  # ke root nusalingua-mvp

declare -A FILES=(
  ["TEST-REPORT.md"]="01-Test-Report.docx"
  ["docs/qa/README.md"]="02-QA-Index.docx"
  ["docs/qa/QA-MASTER-PLAN.md"]="03-QA-Master-Plan.docx"
  ["docs/qa/TEST-STRATEGY.md"]="04-Test-Strategy.docx"
  ["docs/qa/QC-CHECKLIST.md"]="05-QC-Checklist.docx"
  ["docs/qa/DEFINITION-OF-DONE.md"]="06-Definition-of-Done.docx"
  ["docs/qa/BUG-TRIAGE.md"]="07-Bug-Triage.docx"
  ["docs/strategy/README.md"]="08-Strategy-Index.docx"
  ["docs/strategy/PERSONAS.md"]="09-User-Personas.docx"
  ["docs/strategy/CUSTOMER-JOURNEY.md"]="10-Customer-Journey.docx"
  ["docs/strategy/TRUST-COMPLIANCE.md"]="11-Trust-Compliance.docx"
  ["docs/strategy/PRICING.md"]="12-Pricing-Matrix.docx"
)

mkdir -p docs/exports-docx
for src in "${!FILES[@]}"; do
  dst="docs/exports-docx/${FILES[$src]}"
  pandoc "$src" -o "$dst" --from=gfm --to=docx --toc --toc-depth=3 \
    --variable=papersize:a4 --variable=geometry:margin=2.5cm
  echo "  ✓ $src → $(basename "$dst")"
done
echo "Done. ${#FILES[@]} DOCX files in docs/exports-docx/"
