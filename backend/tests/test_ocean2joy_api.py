"""
Ocean2Joy v2.0 API Tests
Tests for: Auth, Projects, Messages, Documents endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@ocean2joy.com"
ADMIN_PASSWORD = "admin123"
CLIENT_EMAIL = "client@test.com"
CLIENT_PASSWORD = "client123"


class TestAPIHealth:
    """Basic API health and status tests"""
    
    def test_api_root_returns_status(self):
        """GET /api returns API status"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "Ocean2Joy" in data["message"]
        print(f"✓ API root returns: {data}")
    
    def test_health_endpoint(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health endpoint: {data}")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_login_admin_success(self):
        """POST /api/auth/login authenticates admin user"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "id" in data
        assert "name" in data
        # Check cookies are set
        assert "access_token" in session.cookies or response.cookies.get("access_token")
        print(f"✓ Admin login successful: {data['email']}, role={data['role']}")
    
    def test_login_client_success(self):
        """POST /api/auth/login authenticates client user"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == CLIENT_EMAIL
        assert data["role"] == "client"
        print(f"✓ Client login successful: {data['email']}, role={data['role']}")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login rejects invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid login rejected: {data['detail']}")
    
    def test_register_new_user(self):
        """POST /api/auth/register creates new user"""
        unique_email = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == unique_email.lower()
        assert data["role"] == "client"
        assert "id" in data
        print(f"✓ User registered: {data['email']}")
    
    def test_register_duplicate_email(self):
        """POST /api/auth/register rejects duplicate email"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": ADMIN_EMAIL,
            "password": "testpass123",
            "name": "Duplicate User"
        })
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower()
        print(f"✓ Duplicate email rejected: {data['detail']}")
    
    def test_me_endpoint_authenticated(self):
        """GET /api/auth/me returns current user when authenticated"""
        session = requests.Session()
        # Login first
        login_resp = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_resp.status_code == 200
        
        # Get current user
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"✓ /auth/me returns: {data['email']}, role={data['role']}")
    
    def test_me_endpoint_unauthenticated(self):
        """GET /api/auth/me returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print(f"✓ /auth/me unauthenticated returns 401")
    
    def test_logout(self):
        """POST /api/auth/logout clears cookies"""
        session = requests.Session()
        # Login first
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        # Logout
        response = session.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert "logged out" in data["message"].lower()
        print(f"✓ Logout successful: {data['message']}")


class TestProjectEndpoints:
    """Project CRUD endpoint tests"""
    
    @pytest.fixture
    def client_session(self):
        """Get authenticated client session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        })
        return session
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_create_project(self, client_session):
        """POST /api/projects creates a new project (multipart form)"""
        response = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "custom_video",
                "brief": "TEST_Project: Test video production brief for automated testing"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "project_number" in data
        assert data["service_type"] == "custom_video"
        assert "TEST_Project" in data["brief"]
        assert data["status"] == "submitted"
        print(f"✓ Project created: {data['project_number']}, id={data['id']}")
        return data
    
    def test_list_projects(self, client_session):
        """GET /api/projects returns user projects"""
        response = client_session.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Projects list returned: {len(data)} projects")
    
    def test_get_project_details(self, client_session):
        """GET /api/projects/{id} returns project with timeline"""
        # First create a project
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "video_editing",
                "brief": "TEST_GetDetails: Test project for details endpoint"
            }
        )
        assert create_resp.status_code == 200
        project_id = create_resp.json()["id"]
        
        # Get project details
        response = client_session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_id
        assert "timeline" in data
        assert "status" in data
        assert data["service_type"] == "video_editing"
        print(f"✓ Project details returned: {data['project_number']}, status={data['status']}")
    
    def test_get_project_not_found(self, client_session):
        """GET /api/projects/{id} returns 404 for non-existent project"""
        fake_id = str(uuid.uuid4())
        response = client_session.get(f"{BASE_URL}/api/projects/{fake_id}")
        assert response.status_code == 404
        print(f"✓ Non-existent project returns 404")
    
    def test_advance_stage_admin_only(self, admin_session, client_session):
        """PUT /api/projects/{id}/advance advances project stage (admin only)"""
        # Create project as client
        create_resp = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "ai_video",
                "brief": "TEST_Advance: Test project for stage advancement"
            }
        )
        assert create_resp.status_code == 200
        project_id = create_resp.json()["id"]
        
        # Try to advance as client (should fail)
        client_advance = client_session.put(f"{BASE_URL}/api/projects/{project_id}/advance")
        assert client_advance.status_code == 403
        print(f"✓ Client cannot advance stage (403)")
        
        # Advance as admin (should succeed)
        admin_advance = admin_session.put(f"{BASE_URL}/api/projects/{project_id}/advance")
        assert admin_advance.status_code == 200
        data = admin_advance.json()
        assert data["status"] == "order_activated"
        assert data["order_activated_at"] is not None
        print(f"✓ Admin advanced stage: {data['status']}")


class TestMessageEndpoints:
    """Chat message endpoint tests"""
    
    @pytest.fixture
    def client_session(self):
        """Get authenticated client session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        })
        return session
    
    @pytest.fixture
    def test_project(self, client_session):
        """Create a test project for message tests"""
        response = client_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "custom_video",
                "brief": "TEST_Messages: Test project for chat messages"
            }
        )
        return response.json()
    
    def test_send_message(self, client_session, test_project):
        """POST /api/projects/{id}/messages sends chat message"""
        project_id = test_project["id"]
        response = client_session.post(
            f"{BASE_URL}/api/projects/{project_id}/messages",
            json={"message": "TEST_Message: Hello, this is a test message"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "TEST_Message: Hello, this is a test message"
        assert data["project_id"] == project_id
        assert "sender_name" in data
        assert "sender_role" in data
        print(f"✓ Message sent: {data['id']}")
    
    def test_get_messages(self, client_session, test_project):
        """GET /api/projects/{id}/messages returns project messages"""
        project_id = test_project["id"]
        
        # Send a message first
        client_session.post(
            f"{BASE_URL}/api/projects/{project_id}/messages",
            json={"message": "TEST_GetMessages: Test message for retrieval"}
        )
        
        # Get messages
        response = client_session.get(f"{BASE_URL}/api/projects/{project_id}/messages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any("TEST_GetMessages" in m["message"] for m in data)
        print(f"✓ Messages retrieved: {len(data)} messages")


class TestDocumentEndpoints:
    """Document generation endpoint tests"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    @pytest.fixture
    def test_project_with_stages(self, admin_session):
        """Create a test project and advance to have documents available"""
        # Create project
        create_resp = admin_session.post(
            f"{BASE_URL}/api/projects",
            data={
                "service_type": "custom_video",
                "brief": "TEST_Documents: Test project for document generation"
            }
        )
        project = create_resp.json()
        project_id = project["id"]
        
        # Advance a few stages to make documents available
        admin_session.put(f"{BASE_URL}/api/projects/{project_id}/advance")  # order_activated
        admin_session.put(f"{BASE_URL}/api/projects/{project_id}/advance")  # invoice_sent
        
        # Get updated project
        response = admin_session.get(f"{BASE_URL}/api/projects/{project_id}")
        return response.json()
    
    def test_list_documents(self, admin_session, test_project_with_stages):
        """GET /api/projects/{id}/documents lists all document types"""
        project_id = test_project_with_stages["id"]
        response = admin_session.get(f"{BASE_URL}/api/projects/{project_id}/documents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 11  # 11 document types
        
        # Check document structure
        doc_types = [d["type"] for d in data]
        assert "invoice" in doc_types
        assert "quote_request" in doc_types
        assert "certificate_completion" in doc_types
        print(f"✓ Documents listed: {len(data)} types")
    
    def test_get_document_txt(self, admin_session, test_project_with_stages):
        """GET /api/projects/{id}/documents/{doc_type}/txt returns TXT document"""
        project_id = test_project_with_stages["id"]
        response = admin_session.get(
            f"{BASE_URL}/api/projects/{project_id}/documents/quote_request/txt"
        )
        assert response.status_code == 200
        assert "text/plain" in response.headers.get("content-type", "")
        content = response.text
        assert "Ocean2Joy" in content
        assert "Quote Request" in content or "QUOTE REQUEST" in content.upper()
        print(f"✓ TXT document retrieved: {len(content)} chars")
    
    def test_get_document_html(self, admin_session, test_project_with_stages):
        """GET /api/projects/{id}/documents/{doc_type}/html returns HTML document"""
        project_id = test_project_with_stages["id"]
        response = admin_session.get(
            f"{BASE_URL}/api/projects/{project_id}/documents/invoice/html"
        )
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        content = response.text
        assert "<html>" in content.lower()
        assert "INVOICE" in content.upper()
        print(f"✓ HTML document retrieved: {len(content)} chars")
    
    def test_get_document_pdf(self, admin_session, test_project_with_stages):
        """GET /api/projects/{id}/documents/{doc_type}/pdf returns PDF document"""
        project_id = test_project_with_stages["id"]
        response = admin_session.get(
            f"{BASE_URL}/api/projects/{project_id}/documents/order_confirmation/pdf"
        )
        assert response.status_code == 200
        assert "application/pdf" in response.headers.get("content-type", "")
        # PDF files start with %PDF
        assert response.content[:4] == b'%PDF'
        print(f"✓ PDF document retrieved: {len(response.content)} bytes")
    
    def test_get_document_invalid_type(self, admin_session, test_project_with_stages):
        """GET /api/projects/{id}/documents/{doc_type}/txt returns 400 for invalid type"""
        project_id = test_project_with_stages["id"]
        response = admin_session.get(
            f"{BASE_URL}/api/projects/{project_id}/documents/invalid_doc_type/txt"
        )
        assert response.status_code == 400
        print(f"✓ Invalid document type returns 400")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
