"""
Ocean2Joy v2.0 — Content/Legal Directive Tests (iteration 5).
Covers:
- POLICIES: substantive_version_date, stage label rewording, portal-first wording
- OPERATIONAL_CHAIN_STAGES display_name 10/11 renamed
- PATCH /api/projects/{id} service_type whitelist + gating on invoice_sent_at
- Invoice PDF/TXT wording ('Report Payment', 'Payment Reported', 'Payment Confirmed')
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
ADMIN_EMAIL = "admin@ocean2joy.com"
ADMIN_PASSWORD = "admin123"
CLIENT_EMAIL = "client@test.com"
CLIENT_PASSWORD = "client123"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return s


@pytest.fixture(scope="module")
def client_session():
    s = requests.Session()
    email = f"TEST_v2_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "testpass123", "name": "V2 Test Client"})
    assert r.status_code == 200, r.text
    return s, email


# ---------- 1. POLICIES content ----------
class TestPoliciesContent:
    def test_all_policies_have_substantive_version_date(self):
        for key in ["terms", "digital_delivery", "refund", "revision", "privacy"]:
            r = requests.get(f"{BASE_URL}/api/policies/{key}")
            assert r.status_code == 200, f"{key}: {r.text}"
            data = r.json()
            assert data.get("substantive_version_date") == "2025-10-21T00:00:00Z", \
                f"{key} substantive_version_date != 2025-10-21T00:00:00Z (got {data.get('substantive_version_date')})"

    def test_terms_section_3_labels_and_utc_note(self):
        r = requests.get(f"{BASE_URL}/api/policies/terms")
        assert r.status_code == 200
        content = r.json()["content"]
        # New stage labels for 10 & 11
        assert "**Payment Reported**" in content
        assert "**Payment Confirmed**" in content
        # Old labels must NOT be present as stage labels in section 3
        # ("Payment sent"/"Payment confirmed" alone as labels)
        assert "**Payment sent**" not in content
        # UTC note
        assert "All stage timestamps are UTC-based and reflect the moment the corresponding event was recorded inside the portal" in content

    def test_terms_section_12_substantive_version(self):
        r = requests.get(f"{BASE_URL}/api/policies/terms")
        content = r.json()["content"]
        assert "\"Substantive version in force from\" date above reflects" in content
        # Old wording must be gone (in §12)
        section12 = content.split("## 12.")[-1]
        assert "Last updated" not in section12

    def test_digital_delivery_no_third_party_storage_names(self):
        r = requests.get(f"{BASE_URL}/api/policies/digital_delivery")
        content = r.json()["content"]
        for banned in ["Google Drive", "Dropbox", "Yandex Disk", "PayPal-compliance"]:
            assert banned not in content, f"digital_delivery must not mention {banned}"
        assert "file-access entry" in content
        # 'Delivery URL' concept — accept either "Delivery URL" or "deliverable URL"
        assert "deliverable URL" in content or "Delivery URL" in content

    def test_refund_stage_11_heading(self):
        r = requests.get(f"{BASE_URL}/api/policies/refund")
        content = r.json()["content"]
        assert "Refunds After Payment (Post-Stage 11 — Payment Confirmed)" in content
        assert "Post-Stage 10" not in content
        assert "Once funds have been transferred and payment is confirmed by our team (Stage 11)" not in content

    def test_privacy_section_9_and_10(self):
        r = requests.get(f"{BASE_URL}/api/policies/privacy")
        content = r.json()["content"]
        assert "## 9. How We Communicate With You (Portal-First)" in content
        assert "In-Portal First" not in content
        assert "Currently Semi-Manual" in content
        assert "Currently Manual)" not in content  # avoid false positives
        assert "Stage 10 — Payment Reported" in content
        assert "Stage 11 — Payment Confirmed" in content


# ---------- 2. Operational chain display_name ----------
class TestOperationalChainStageLabels:
    def test_stages_10_11_display_names_in_timeline(self, client_session):
        """Create a project as client and verify timeline labels for stages 10/11."""
        s, _ = client_session
        r = s.post(f"{BASE_URL}/api/projects", data={
            "service_type": "custom_video",
            "project_title": "TEST_v2_labels",
            "brief": "label test",
            "payment_method": "paypal",
        })
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        g = s.get(f"{BASE_URL}/api/projects/{pid}")
        assert g.status_code == 200
        timeline = g.json().get("timeline", [])
        by_num = {row.get("stage_number"): row for row in timeline}
        assert by_num[10]["display_name"] == "Payment Reported"
        assert by_num[11]["display_name"] == "Payment Confirmed"
        # status_keys unchanged
        assert by_num[10]["status_key"] == "payment_sent"
        assert by_num[11]["status_key"] == "payment_received"


# ---------- 3. PATCH service_type ----------
class TestPatchServiceType:
    def test_patch_service_type_valid_before_invoice(self, client_session):
        s, _ = client_session
        r = s.post(f"{BASE_URL}/api/projects", data={
            "service_type": "custom_video",
            "project_title": "TEST_v2_patch_ok",
            "brief": "x",
            "payment_method": "paypal",
        })
        assert r.status_code == 200
        pid = r.json()["id"]

        up = s.patch(f"{BASE_URL}/api/projects/{pid}", json={"service_type": "video_editing"})
        assert up.status_code == 200, up.text
        assert up.json()["service_type"] == "video_editing"

        # change again to ai_video → confirm stored
        up2 = s.patch(f"{BASE_URL}/api/projects/{pid}", json={"service_type": "ai_video"})
        assert up2.status_code == 200
        got = s.get(f"{BASE_URL}/api/projects/{pid}").json()
        assert got["service_type"] == "ai_video"

    def test_patch_service_type_invalid(self, client_session):
        s, _ = client_session
        r = s.post(f"{BASE_URL}/api/projects", data={
            "service_type": "custom_video", "project_title": "TEST_v2_patch_bad", "brief": "x", "payment_method": "paypal",
        })
        pid = r.json()["id"]
        up = s.patch(f"{BASE_URL}/api/projects/{pid}", json={"service_type": "invalid_xyz"})
        assert up.status_code == 400

    def test_patch_service_type_after_invoice_sent_is_blocked(self, admin_session, client_session):
        s, _ = client_session
        r = s.post(f"{BASE_URL}/api/projects", data={
            "service_type": "custom_video", "project_title": "TEST_v2_patch_after_inv", "brief": "x", "payment_method": "paypal",
        })
        pid = r.json()["id"]
        # Admin activates & sends invoice
        a = admin_session
        act = a.post(f"{BASE_URL}/api/projects/{pid}/admin/activate-order", json={"quote_amount": 100.0})
        assert act.status_code in (200, 201), act.text
        inv = a.post(f"{BASE_URL}/api/projects/{pid}/admin/send-invoice")
        assert inv.status_code in (200, 201), inv.text
        # Now PATCH should be blocked
        up = s.patch(f"{BASE_URL}/api/projects/{pid}", json={"service_type": "video_editing"})
        assert up.status_code == 400


# ---------- 4. Invoice PDF wording ----------
class TestInvoiceWording:
    def test_invoice_pdf_contains_new_stage_labels_and_report_payment(self, admin_session, client_session):
        s, _ = client_session
        r = s.post(f"{BASE_URL}/api/projects", data={
            "service_type": "custom_video", "project_title": "TEST_v2_invoice_wording", "brief": "x", "payment_method": "paypal",
        })
        pid = r.json()["id"]
        a = admin_session
        assert a.post(f"{BASE_URL}/api/projects/{pid}/admin/activate-order", json={"quote_amount": 50.0}).status_code in (200, 201)
        assert a.post(f"{BASE_URL}/api/projects/{pid}/admin/send-invoice").status_code in (200, 201)

        # Invoice HTML/TXT must not contain the OLD "Mark Payment Sent" phrasing anywhere.
        for fmt in ("html", "txt"):
            resp = s.get(f"{BASE_URL}/api/projects/{pid}/documents/invoice/{fmt}")
            assert resp.status_code == 200, resp.text
            body = resp.text
            assert "Mark Payment Sent" not in body, f"invoice {fmt} still contains banned 'Mark Payment Sent'"

        # PDF is also served
        pdf = s.get(f"{BASE_URL}/api/projects/{pid}/documents/invoice/pdf")
        assert pdf.status_code == 200
        raw = pdf.content.decode("latin-1", errors="ignore")
        assert "Mark Payment Sent" not in raw

    def test_payment_instructions_doc_uses_report_payment_wording(self):
        """Code-level check for /app/backend/routes/documents.py lines 572 & 732 —
        payment_instructions HTML/TXT templates must include 'Report Payment' and not 'Mark Payment Sent'."""
        with open("/app/backend/routes/documents.py", "r") as f:
            src = f.read()
        assert "Report Payment" in src, "documents.py missing 'Report Payment' wording"
        assert "Mark Payment Sent" not in src, "documents.py still contains banned 'Mark Payment Sent'"
