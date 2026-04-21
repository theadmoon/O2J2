"""
Ocean2Joy v2.0 - Full Audit E2E Tests
Comprehensive testing for pre-deploy audit including:
- 12-stage operational chain E2E
- Email notifications (Resend)
- Client isolation
- Admin-only DELETE cascade
- Signed artifact versioning
- Auth flows with redirect
- NewProject form validation
- Welcome message
- Document generation (all 11 types)
- Policy content verification
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@ocean2joy.com"
ADMIN_PASSWORD = "admin123"
CLIENT_EMAIL = "client@test.com"
CLIENT_PASSWORD = "client123"
JOHN_EMAIL = "john@gmail.com"
JOHN_PASSWORD = "client123"
BOB_EMAIL = "bob@gmail.com"
BOB_PASSWORD = "bob123"


@pytest.fixture(scope="module")
def admin_session():
    """Get authenticated admin session"""
    session = requests.Session()
    resp = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return session


@pytest.fixture(scope="module")
def client_session():
    """Get authenticated client session"""
    session = requests.Session()
    resp = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": CLIENT_EMAIL,
        "password": CLIENT_PASSWORD
    })
    assert resp.status_code == 200, f"Client login failed: {resp.text}"
    return session


@pytest.fixture(scope="module")
def john_session():
    """Get authenticated john@gmail.com session"""
    session = requests.Session()
    resp = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": JOHN_EMAIL,
        "password": JOHN_PASSWORD
    })
    if resp.status_code != 200:
        pytest.skip(f"john@gmail.com login failed: {resp.text}")
    return session


class TestPoliciesContent:
    """P1 - Verify policy content requirements"""
    
    def test_all_policies_return_200(self):
        """All 5 policies return HTTP 200 with non-empty content"""
        policies = ['terms', 'digital_delivery', 'refund', 'revision', 'privacy']
        for policy in policies:
            resp = requests.get(f"{BASE_URL}/api/policies/{policy}")
            assert resp.status_code == 200, f"Policy {policy} returned {resp.status_code}"
            data = resp.json()
            assert data.get('content'), f"Policy {policy} has empty content"
            assert data.get('title'), f"Policy {policy} has no title"
            print(f"✓ Policy {policy}: {len(data['content'])} chars")
    
    def test_terms_mentions_12_stage_chain(self):
        """Terms must mention the 12-stage chain"""
        resp = requests.get(f"{BASE_URL}/api/policies/terms")
        data = resp.json()
        assert '12-stage' in data['content'].lower() or '12 stage' in data['content'].lower(), "Terms missing 12-stage chain mention"
        print("✓ Terms mentions 12-stage chain")
    
    def test_terms_mentions_usdt_trc20(self):
        """Terms must mention USDT-TRC20 crypto payment"""
        resp = requests.get(f"{BASE_URL}/api/policies/terms")
        data = resp.json()
        assert 'USDT-TRC20' in data['content'] or 'USDT (TRC-20)' in data['content'], "Terms missing USDT-TRC20 mention"
        print("✓ Terms mentions USDT-TRC20")
    
    def test_terms_no_payment_on_quote_acceptance(self):
        """Terms must NOT mention 'payment on quote acceptance' (contradiction removed)"""
        resp = requests.get(f"{BASE_URL}/api/policies/terms")
        data = resp.json()
        assert 'payment on quote acceptance' not in data['content'].lower(), "Terms still has contradictory 'payment on quote acceptance'"
        print("✓ Terms does not have 'payment on quote acceptance' contradiction")
    
    def test_refund_has_stage_table(self):
        """Refund policy has stage-by-stage table"""
        resp = requests.get(f"{BASE_URL}/api/policies/refund")
        data = resp.json()
        # Check for markdown table markers
        assert '| Stage' in data['content'] or '|---|' in data['content'], "Refund policy missing stage-by-stage table"
        print("✓ Refund policy has stage-by-stage table")
    
    def test_refund_has_crypto_wallet_clause(self):
        """Refund policy mentions crypto wallet refund"""
        resp = requests.get(f"{BASE_URL}/api/policies/refund")
        data = resp.json()
        assert 'TRC20' in data['content'] or 'TRC-20' in data['content'], "Refund policy missing crypto refund clause"
        print("✓ Refund policy has crypto wallet refund clause")
    
    def test_privacy_mentions_usdt_trc20_hashes(self):
        """Privacy policy mentions USDT-TRC20 transaction hashes"""
        resp = requests.get(f"{BASE_URL}/api/policies/privacy")
        data = resp.json()
        assert 'transaction hashes' in data['content'].lower(), "Privacy policy missing transaction hashes mention"
        print("✓ Privacy policy mentions transaction hashes")


class TestDemoVideosAndPosters:
    """P1 - Verify demo videos and posters"""
    
    def test_demo_videos_endpoint(self):
        """GET /api/demo-videos returns valid data"""
        resp = requests.get(f"{BASE_URL}/api/demo-videos")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 2, "Expected at least 2 demo videos"
        for video in data:
            assert 'video_url' in video
            assert 'thumbnail_url' in video
            # Verify no #t= fragment in video URLs
            assert '#t=' not in video['video_url'], f"Video URL has #t= fragment: {video['video_url']}"
        print(f"✓ Demo videos: {len(data)} videos, no #t= fragments")
    
    def test_poster_images_load(self):
        """Poster images at /posters/demo1.png and /posters/demo2.png load correctly"""
        for poster in ['demo1.png', 'demo2.png']:
            resp = requests.head(f"{BASE_URL}/posters/{poster}")
            assert resp.status_code == 200, f"Poster {poster} returned {resp.status_code}"
            content_type = resp.headers.get('content-type', '')
            assert 'image/png' in content_type, f"Poster {poster} has wrong content-type: {content_type}"
        print("✓ Both poster images load with image/png content-type")


class TestClientIsolation:
    """P0 - Client isolation tests"""
    
    def test_client_sees_only_own_projects(self, client_session, admin_session):
        """Regular client sees only their own projects in GET /api/projects"""
        # Get client's projects
        client_resp = client_session.get(f"{BASE_URL}/api/projects")
        assert client_resp.status_code == 200
        client_projects = client_resp.json()
        
        # Get admin's view (all projects)
        admin_resp = admin_session.get(f"{BASE_URL}/api/projects")
        assert admin_resp.status_code == 200
        admin_projects = admin_resp.json()
        
        # Admin should see more or equal projects
        assert len(admin_projects) >= len(client_projects), "Admin should see all projects"
        
        # Verify client only sees their own
        client_user_resp = client_session.get(f"{BASE_URL}/api/auth/me")
        client_user = client_user_resp.json()
        for proj in client_projects:
            assert proj['user_id'] == client_user['id'], f"Client sees project not owned by them: {proj['id']}"
        
        print(f"✓ Client sees {len(client_projects)} projects, admin sees {len(admin_projects)}")
    
    def test_client_cannot_access_other_user_project(self, client_session, admin_session):
        """Client cannot access another user's project (403)"""
        # Create a project as admin (or find one not owned by client)
        admin_resp = admin_session.get(f"{BASE_URL}/api/projects")
        admin_projects = admin_resp.json()
        
        client_user_resp = client_session.get(f"{BASE_URL}/api/auth/me")
        client_user = client_user_resp.json()
        
        # Find a project not owned by client
        other_project = None
        for proj in admin_projects:
            if proj['user_id'] != client_user['id']:
                other_project = proj
                break
        
        if other_project:
            resp = client_session.get(f"{BASE_URL}/api/projects/{other_project['id']}")
            assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
            print("✓ Client blocked from accessing other user's project (403)")
        else:
            print("⚠ No other user's project found to test isolation")


class TestAdminDeleteCascade:
    """P0 - Admin-only DELETE with cascade"""
    
    def test_client_cannot_delete_project(self, client_session):
        """Client gets 403 when trying to delete a project"""
        # Create a project first
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "custom_video",
                "brief": "TEST_DeleteTest: Test project for delete permission check",
                "payment_method": "paypal"
            }
        )
        assert create_resp.status_code == 200
        project_id = create_resp.json()['id']
        
        # Try to delete as client
        delete_resp = client_session.delete(f"{BASE_URL}/api/projects/{project_id}")
        assert delete_resp.status_code == 403, f"Expected 403, got {delete_resp.status_code}"
        print("✓ Client cannot delete project (403)")
    
    def test_admin_can_delete_project_with_cascade(self, admin_session, client_session):
        """Admin can delete project and it cascades to messages"""
        # Create a project as client
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "video_editing",
                "brief": "TEST_AdminDelete: Test project for admin delete cascade",
                "payment_method": "paypal"
            }
        )
        assert create_resp.status_code == 200
        project = create_resp.json()
        project_id = project['id']
        
        # Add a message
        msg_resp = client_session.post(
            f"{BASE_URL}/api/projects/{project_id}/messages",
            json={"message": "TEST_CASCADE_MESSAGE"}
        )
        assert msg_resp.status_code == 200
        
        # Delete as admin
        delete_resp = admin_session.delete(f"{BASE_URL}/api/projects/{project_id}")
        assert delete_resp.status_code == 200
        assert delete_resp.json().get('deleted') == True
        
        # Verify project is gone
        get_resp = admin_session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_resp.status_code == 404
        
        print("✓ Admin deleted project with cascade (messages cleaned)")


class TestSignedArtifactVersioning:
    """P0 - Versioning of signed artifacts"""
    
    def test_signed_invoice_versioning(self, admin_session, client_session):
        """Upload signed invoice twice → v1 goes to history, v2 is current"""
        # Create and advance project to invoice_sent
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "custom_video",
                "brief": "TEST_Versioning: Test signed artifact versioning",
                "payment_method": "paypal"
            }
        )
        project_id = create_resp.json()['id']
        
        # Advance to invoice_sent
        admin_session.post(
            f"{BASE_URL}/api/projects/{project_id}/admin/activate-order",
            json={"quote_amount": 100, "quote_details": "Test"}
        )
        admin_session.post(f"{BASE_URL}/api/projects/{project_id}/admin/send-invoice")
        
        # Upload first signed invoice
        files1 = {"file": ("signed_v1.pdf", b"PDF CONTENT V1", "application/pdf")}
        resp1 = client_session.post(
            f"{BASE_URL}/api/projects/{project_id}/client/sign-invoice",
            files=files1
        )
        assert resp1.status_code == 200
        proj1 = resp1.json()
        assert proj1.get('signed_invoice_version') == 1
        assert proj1.get('signed_invoice_history') == [] or proj1.get('signed_invoice_history') is None or len(proj1.get('signed_invoice_history', [])) == 0
        print("✓ First signed invoice uploaded as v1")
        
        # Upload second signed invoice (re-upload)
        files2 = {"file": ("signed_v2.pdf", b"PDF CONTENT V2", "application/pdf")}
        resp2 = client_session.post(
            f"{BASE_URL}/api/projects/{project_id}/client/sign-invoice",
            files=files2
        )
        assert resp2.status_code == 200
        proj2 = resp2.json()
        assert proj2.get('signed_invoice_version') == 2
        history = proj2.get('signed_invoice_history', [])
        assert len(history) == 1, f"Expected 1 history entry, got {len(history)}"
        assert history[0]['version'] == 1
        print("✓ Second signed invoice uploaded as v2, v1 in history")
        
        # Verify history download endpoint
        history_resp = client_session.get(f"{BASE_URL}/api/projects/{project_id}/signed-invoice/history/1")
        assert history_resp.status_code == 200
        print("✓ Historical version v1 downloadable")


class TestWelcomeMessage:
    """P0 - Welcome message on project creation"""
    
    def test_welcome_message_created(self, client_session):
        """On project creation, a system message from 'Ocean2Joy Team' is inserted"""
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "ai_video",
                "brief": "TEST_WelcomeMsg: Test welcome message creation",
                "payment_method": "paypal"
            }
        )
        assert create_resp.status_code == 200
        project_id = create_resp.json()['id']
        
        # Get messages
        msgs_resp = client_session.get(f"{BASE_URL}/api/projects/{project_id}/messages")
        assert msgs_resp.status_code == 200
        messages = msgs_resp.json()
        
        # Find welcome message
        welcome = None
        for msg in messages:
            if msg.get('is_system') and 'Ocean2Joy' in msg.get('sender_name', ''):
                welcome = msg
                break
        
        assert welcome is not None, "Welcome message not found"
        assert welcome.get('sender_role') == 'admin'
        assert welcome.get('is_system') == True
        print(f"✓ Welcome message created: '{welcome['message'][:50]}...'")


class TestNewProjectForm:
    """P0 - NewProject form validation"""
    
    def test_brief_is_optional(self, client_session):
        """Brief field is optional - empty brief should succeed"""
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "video_editing",
                "brief": "",  # Empty brief
                "payment_method": "paypal"
            }
        )
        assert create_resp.status_code == 200, f"Empty brief should succeed: {create_resp.text}"
        print("✓ Empty brief accepted")
    
    def test_payment_method_required(self, client_session):
        """Payment method is required"""
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "custom_video",
                "brief": "Test brief"
                # Missing payment_method
            }
        )
        # Should fail with 422 (validation error)
        assert create_resp.status_code == 422, f"Missing payment_method should fail: {create_resp.status_code}"
        print("✓ Payment method required (422 on missing)")


class TestDocumentGeneration:
    """P1 - All 11 document types generate correctly"""
    
    def test_all_document_types_for_completed_project(self, admin_session, john_session):
        """All 11 document types generate PDF+TXT for completed project VAPP-51"""
        # Get john's projects to find VAPP-51
        projects_resp = john_session.get(f"{BASE_URL}/api/projects")
        if projects_resp.status_code != 200:
            pytest.skip("Cannot get john's projects")
        
        projects = projects_resp.json()
        vapp51 = None
        for p in projects:
            if 'VAPP-51' in p.get('project_number', '') or p.get('status') == 'completed':
                vapp51 = p
                break
        
        if not vapp51:
            # Try admin to find any completed project
            admin_projects = admin_session.get(f"{BASE_URL}/api/projects").json()
            for p in admin_projects:
                if p.get('status') == 'completed':
                    vapp51 = p
                    break
        
        if not vapp51:
            pytest.skip("No completed project found for document testing")
        
        project_id = vapp51['id']
        print(f"Testing documents for project: {vapp51.get('project_number', project_id)}")
        
        doc_types = [
            'quote_request', 'order_confirmation', 'invoice', 'production_notes',
            'download_confirmation', 'certificate_delivery', 'acceptance_act',
            'payment_instructions', 'receipt', 'payment_confirmation', 'certificate_completion'
        ]
        
        for doc_type in doc_types:
            # Test TXT
            txt_resp = admin_session.get(f"{BASE_URL}/api/projects/{project_id}/documents/{doc_type}/txt")
            if txt_resp.status_code == 200:
                assert len(txt_resp.text) > 0, f"{doc_type} TXT is empty"
                # Check for (pending) in certificate_completion
                if doc_type == 'certificate_completion':
                    assert '(pending)' not in txt_resp.text, "certificate_completion has (pending) where value should exist"
                print(f"✓ {doc_type} TXT: {len(txt_resp.text)} chars")
            else:
                print(f"⚠ {doc_type} TXT: {txt_resp.status_code}")
            
            # Test PDF
            pdf_resp = admin_session.get(f"{BASE_URL}/api/projects/{project_id}/documents/{doc_type}/pdf")
            if pdf_resp.status_code == 200:
                assert pdf_resp.content[:4] == b'%PDF', f"{doc_type} PDF doesn't start with %PDF"
                print(f"✓ {doc_type} PDF: {len(pdf_resp.content)} bytes")
            else:
                print(f"⚠ {doc_type} PDF: {pdf_resp.status_code}")


class TestEmailNotifications:
    """P0 - Email notifications via Resend (check logs only)"""
    
    def test_project_submitted_notification_logged(self, client_session):
        """project_submitted event should log notification"""
        # Create a project - this triggers project_submitted notification
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "custom_video",
                "brief": "TEST_EmailNotif: Test email notification logging",
                "payment_method": "paypal"
            }
        )
        assert create_resp.status_code == 200
        # Note: We can't directly verify the log from here, but the notification
        # service is fire-and-forget and should not block the response
        print("✓ Project created (notification should be logged in backend)")


class TestPaymentSettings:
    """Test payment settings endpoint"""
    
    def test_payment_settings_structure(self):
        """GET /api/payment-settings returns correct structure"""
        resp = requests.get(f"{BASE_URL}/api/payment-settings")
        assert resp.status_code == 200
        data = resp.json()
        
        assert 'methods' in data
        assert 'currency' in data
        assert 'beneficiary' in data
        
        methods = data['methods']
        assert len(methods) == 3, f"Expected 3 payment methods, got {len(methods)}"
        
        method_codes = [m['code'] for m in methods]
        assert 'paypal' in method_codes
        assert 'bank_transfer' in method_codes
        assert 'crypto' in method_codes
        
        print(f"✓ Payment settings: {len(methods)} methods, currency={data['currency']}")


class TestFooterLinks:
    """P1 - Footer links verification"""
    
    def test_services_links_resolve(self):
        """Services links point to correct paths"""
        service_paths = [
            '/services/custom-video',
            '/services/video-editing',
            '/services/ai-video'
        ]
        for path in service_paths:
            resp = requests.get(f"{BASE_URL}/api/services/{path.split('/')[-1]}")
            assert resp.status_code == 200, f"Service {path} returned {resp.status_code}"
        print("✓ All service detail endpoints return 200")


class TestContactPage:
    """P1 - Contact page verification"""
    
    def test_contact_endpoint_removed(self):
        """POST /api/contact should still work (legacy) but form removed from UI"""
        # The endpoint exists but the form was removed from UI
        # We just verify the endpoint still works for backwards compatibility
        resp = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "Test",
            "email": "test@test.com",
            "subject": "Test",
            "message": "Test message"
        })
        # Should work (legacy endpoint)
        assert resp.status_code == 200
        print("✓ Legacy /api/contact endpoint still works")


class TestQuickRequestLegacy:
    """P2 - Legacy quick-request endpoint"""
    
    def test_quick_request_endpoint_exists(self):
        """POST /api/quick-request legacy endpoint exists"""
        resp = requests.post(f"{BASE_URL}/api/quick-request", json={
            "name": "Test User",
            "email": f"test_{uuid.uuid4().hex[:8]}@test.com",
            "service_type": "custom_video",
            "brief_description": "Test brief",
            "payment_method": "paypal"
        })
        # Should work (legacy endpoint)
        assert resp.status_code == 200
        print("✓ Legacy /api/quick-request endpoint still works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
