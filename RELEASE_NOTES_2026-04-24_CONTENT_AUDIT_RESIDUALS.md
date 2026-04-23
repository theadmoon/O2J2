# Ocean2Joy — Release Notes

**Release tag**: `v2.0.24-content-audit-residuals`
**Date**: 2026-04-24
**Scope**: Content / legal copy alignment only. **No schema, no API, no data migration changes.**

---

## 1. Context

Following the 23 April 2026 full-site content snapshot (`OCEAN2JOY_SITE_CONTENT.md`), the business owner flagged four residual inconsistencies between the public-facing copy and the actual 12-stage operational chain. This release closes them out.

All changes are pure text edits in:

- `backend/routes/public.py` (the `POLICIES` dictionary served by `GET /api/policies/{type}`)
- `frontend/src/pages/HowItWorks.jsx`
- `frontend/src/pages/ServiceDetails.jsx`
- `frontend/src/pages/Policies.jsx` (dropped `updated_at` fallback in the "Substantive version" header)
- `OCEAN2JOY_SITE_CONTENT.md` (regenerated snapshot — revision 2)

No backend routes, models, constants, or data-test-ids were touched.

---

## 2. Changes

### 2.1 Stage-2 label: `Quote activated` → `Order Activated`

The internal operational-chain constant has always been `display_name: "Order Activated"` (see `backend/utils/constants.py`, stage 2). The public copy used the legacy wording `Quote activated`, creating a mismatch between what the client sees on the timeline and what the Terms describe.

**Aligned occurrences**:

- `backend/routes/public.py` → Terms of Service, §3 (the 12-stage list):
  - before: `2. **Quote activated** by our team inside the portal.`
  - after: `2. **Order Activated** by our team inside the portal.`
- `backend/routes/public.py` → Refund & Cancellation Policy, §2 (the cancellation fee table):
  - before: `| 2 — Quote activated | **0 — no charge** |`
  - after: `| 2 — Order Activated | **0 — no charge** |`
- `OCEAN2JOY_SITE_CONTENT.md` — snapshots of both strings above regenerated.

### 2.2 Digital Delivery Policy §9 — portal-first, email-as-fallback

Section 9 used to be a plain "Contact" line pointing at `ocean2joy@gmail.com`. This contradicted the portal-first directive already enforced everywhere else. Rewritten so the section explicitly routes delivery questions into the project chat, with email called out as an emergency fallback only.

**New §9 in `backend/routes/public.py` → `digital_delivery`**:

```
## 9. Delivery Questions & Escalation — Portal-First
All delivery-related questions, file-access issues, and revision requests are handled inside the project chat in the client portal. The portal keeps a full audit trail of every delivery message, file-access event, and revision turn, which is what the Certificate of Delivery is ultimately built from.

Email (ocean2joy@gmail.com) is used only as an emergency fallback when portal communication is temporarily unavailable — for example, if you cannot sign in, the portal is under maintenance, or a technical issue prevents you from posting a delivery message. We do not deliver files by email and we do not answer substantive delivery questions by email.
```

### 2.3 Certificate of Delivery explicit in step descriptions

`HowItWorks.jsx` Step 5 and `ServiceDetails.jsx` Step 4 previously mentioned only the *Acceptance Act*, skipping the *Certificate of Delivery* signature that comes before it in stages 8 → 9 of the chain.

- **`frontend/src/pages/HowItWorks.jsx` — Step 5 paragraph (line 254-256)**:
  > Once the work is complete, our team issues a **Delivery Certificate** in the portal and provides secure access to the final files. The client reviews the work, requests any included revisions, then signs the **Certificate of Delivery** inside the portal to confirm the files were received, and finally signs the **Acceptance Act** to confirm the work meets the brief.

  The third bullet in Step 5 was also updated:
  > The client first signs the **Certificate of Delivery**, then the **Acceptance Act** — the final confirmation before the payment stage.

- **`frontend/src/pages/ServiceDetails.jsx` — Step 4 paragraph (line 198)**:
  > Our team issues a Delivery Certificate, provides file access inside the portal, processes included revisions if requested, and the client signs the **Certificate of Delivery** (to confirm the files were received) and then the **Acceptance Act** (to confirm the work meets the brief) inside the portal.

### 2.4 `Content version last refreshed` removed everywhere

Only the substantive version date is kept in the policy page header.

- `backend/routes/public.py` — the `updated_at` field has been dropped from all five entries (`terms`, `digital_delivery`, `refund`, `revision`, `privacy`). The response shape is therefore now:
  ```json
  {
    "title": "...",
    "substantive_version_date": "2025-10-21T00:00:00Z",
    "content": "..."
  }
  ```
  i.e. the former `updated_at` key is no longer present in `GET /api/policies/{type}`.

- `frontend/src/pages/Policies.jsx` — the header rendering used to fall back to `updated_at` if `substantive_version_date` was missing; that fallback is gone:
  ```jsx
  Substantive version in force from:
    {policy.substantive_version_date
      ? new Date(policy.substantive_version_date).toLocaleDateString('en-GB')
      : ''}
  ```

- `OCEAN2JOY_SITE_CONTENT.md` — the `Content version last refreshed` bullet has been removed from the five policy sections (9.1 – 9.5).

---

## 3. QA / Regression Checklist

### 3.1 Automated backend checks (curl)

Run from any shell with `$API` set to the deployment base URL:

```bash
API=https://<host>

# Terms: Order Activated present, Quote activated absent, updated_at dropped
curl -s $API/api/policies/terms | python3 -c "
import sys, json
d = json.load(sys.stdin)
c = d['content']
assert 'Order Activated' in c, 'Order Activated missing'
assert 'Quote activated' not in c, 'legacy Quote activated still present'
assert 'updated_at' not in d, 'updated_at should be removed from response'
assert d.get('substantive_version_date') == '2025-10-21T00:00:00Z'
print('terms OK')
"

# Digital Delivery: new §9 heading, emergency-fallback wording, no old 'Contact' §9
curl -s $API/api/policies/digital_delivery | python3 -c "
import sys, json
c = json.load(sys.stdin)['content']
assert '## 9. Delivery Questions & Escalation — Portal-First' in c
assert 'emergency fallback' in c
assert '## 9. Contact' not in c
print('digital_delivery OK')
"

# Refund: table row is Order Activated
curl -s $API/api/policies/refund | python3 -c "
import sys, json
c = json.load(sys.stdin)['content']
assert '| 2 — Order Activated | **0 — no charge** |' in c
assert 'Quote activated' not in c
print('refund OK')
"

# Revision & Privacy: updated_at removed
for k in revision privacy; do
  curl -s $API/api/policies/$k | python3 -c "
import sys, json
d = json.load(sys.stdin)
assert 'updated_at' not in d
print('$k OK')
"
done
```

### 3.2 Manual UI checks

1. `/policies/terms` — header shows only **Substantive version in force from: 21/10/2025**, no second date line. §3 item 2 reads `Order Activated`.
2. `/policies/digital_delivery` — same header rule. §9 now titled **Delivery Questions & Escalation — Portal-First**.
3. `/policies/refund` — table row 2 reads `2 — Order Activated | 0 — no charge`.
4. `/how-it-works` — Step 5 paragraph and third bullet mention the **Certificate of Delivery** *before* the **Acceptance Act**.
5. `/services/custom-video` (or any service) — Step 4 of the "How It Works" card lists **Certificate of Delivery** → **Acceptance Act**.

### 3.3 Existing test suite

- `/app/backend/tests/test_v2_content_directive.py` still passes. The suite asserted on `substantive_version_date`, portal-first wording in `privacy §9/§10`, stage 10/11 labels and refund stage-11 heading — none of those assertions are affected by this release.
- `testing_agent_v3_fork` iteration 5 baseline (37/39 backend, 100% frontend) stays valid; this release only edits text content.

---

## 4. Impact

- **API contract**: `GET /api/policies/{type}` no longer returns the `updated_at` key. Any external consumer relying on that field must switch to `substantive_version_date`. No internal code references the removed key.
- **SEO / JSON-LD**: no change — policy pages do not emit structured data referencing the removed line.
- **Database / migrations**: none.
- **Environment / secrets**: none.

---

## 5. Deploy

Standard deploy of the `frontend/` and `backend/` services. No MongoDB migration, no env var change. Hot reload picks up the edits automatically in the preview environment; production deploy requires only a rebuild of both containers.
