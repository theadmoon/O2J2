"""E2E tests for Demo Videos feature (admin CRUD + public list + streaming)."""
import io
import json
import os
import struct
import zlib

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://project-studio-17.preview.emergentagent.com").rstrip("/")

ADMIN_EMAIL = "admin@ocean2joy.com"
ADMIN_PASS = "admin123"
CLIENT_EMAIL = "client@test.com"
CLIENT_PASS = "client123"


def _make_png(size_kb: int = 2) -> bytes:
    """Tiny valid PNG padded with filler bytes to reach approx size_kb."""
    # minimal 1x1 PNG
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    idat = chunk(b"IDAT", zlib.compress(b"\x00\xff\xff\xff"))
    iend = chunk(b"IEND", b"")
    base = sig + ihdr + idat + iend
    # pad with trailing bytes in a tEXt-like chunk to hit size
    pad_len = max(0, size_kb * 1024 - len(base))
    if pad_len > 0:
        text_chunk = chunk(b"tEXt", b"pad\x00" + b"A" * max(0, pad_len - 16))
        base = base + text_chunk
    return base


def _make_mp4(size_kb: int = 4) -> bytes:
    """Minimal MP4 ftyp box with padding. Enough to pass ext-based validation."""
    # ftyp box: size(4) + 'ftyp' + major_brand 'isom' + minor 0 + compat brands
    brands = b"isomiso2mp41"
    body = b"isom" + struct.pack(">I", 512) + brands
    size = 8 + len(body)
    ftyp = struct.pack(">I", size) + b"ftyp" + body
    free_payload = b"\x00" * max(0, size_kb * 1024 - len(ftyp) - 8)
    free = struct.pack(">I", 8 + len(free_payload)) + b"free" + free_payload
    return ftyp + free


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def client_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": CLIENT_EMAIL, "password": CLIENT_PASS})
    assert r.status_code == 200, f"Client login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def created_demo_id(admin_session):
    """Create a demo video to exercise uploaded-media endpoints. Cleaned up at end."""
    files = {
        "video": ("test_demo.mp4", _make_mp4(8), "video/mp4"),
        "poster": ("test_demo.png", _make_png(3), "image/png"),
    }
    data = {
        "title": "TEST_Demo Reel",
        "description": "Testing demo video upload",
        "tags": json.dumps(["TEST", "Upload"]),
    }
    r = admin_session.post(f"{BASE_URL}/api/admin/demo-videos", files=files, data=data)
    assert r.status_code == 200, f"Create failed: {r.status_code} {r.text}"
    doc = r.json()
    assert doc["video_storage"] == "uploaded"
    assert doc["poster_storage"] == "uploaded"
    assert doc["id"].startswith("demo-")
    yield doc["id"]
    # cleanup
    admin_session.delete(f"{BASE_URL}/api/admin/demo-videos/{doc['id']}")


# ---- Public endpoints ----

class TestPublicDemoVideos:
    def test_public_list_returns_seeded_sorted(self):
        r = requests.get(f"{BASE_URL}/api/demo-videos")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        # sorted by order
        ids = [d["id"] for d in data]
        assert "demo-1" in ids and "demo-2" in ids
        # seeded ones are static; video_url should point to /videos/...
        for d in data:
            if d["id"] in ("demo-1", "demo-2"):
                assert d["video_url"].startswith("/videos/")

    def test_streaming_404_for_static_seeded(self):
        r = requests.get(f"{BASE_URL}/api/public/demo-media/demo-1/video")
        assert r.status_code == 404
        r = requests.get(f"{BASE_URL}/api/public/demo-media/demo-1/poster")
        assert r.status_code == 404


# ---- Auth guard ----

class TestAdminAuth:
    def test_admin_list_unauth(self):
        r = requests.get(f"{BASE_URL}/api/admin/demo-videos")
        assert r.status_code in (401, 403)

    def test_admin_list_client_forbidden(self, client_session):
        r = client_session.get(f"{BASE_URL}/api/admin/demo-videos")
        assert r.status_code == 403

    def test_admin_list_ok(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/admin/demo-videos")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---- CRUD + upload flow ----

class TestDemoVideoCRUD:
    def test_created_record_appears_in_public_list_with_stream_urls(self, created_demo_id):
        r = requests.get(f"{BASE_URL}/api/demo-videos")
        assert r.status_code == 200
        match = [d for d in r.json() if d["id"] == created_demo_id]
        assert match, "Newly created demo not returned by public list"
        d = match[0]
        assert d["video_url"] == f"/api/public/demo-media/{created_demo_id}/video"
        assert d["thumbnail_url"] == f"/api/public/demo-media/{created_demo_id}/poster"

    def test_stream_video_200_mp4(self, created_demo_id):
        r = requests.get(f"{BASE_URL}/api/public/demo-media/{created_demo_id}/video")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("video/mp4")
        assert len(r.content) > 0

    def test_stream_poster_200_image(self, created_demo_id):
        r = requests.get(f"{BASE_URL}/api/public/demo-media/{created_demo_id}/poster")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/")
        assert len(r.content) > 0

    def test_update_metadata(self, admin_session, created_demo_id):
        payload = {"title": "TEST_Updated Title", "description": "upd", "tags": ["a", "b"]}
        r = admin_session.put(f"{BASE_URL}/api/admin/demo-videos/{created_demo_id}", json=payload)
        assert r.status_code == 200
        doc = r.json()
        assert doc["title"] == "TEST_Updated Title"
        assert doc["tags"] == ["a", "b"]
        # verify persisted via GET list
        r2 = admin_session.get(f"{BASE_URL}/api/admin/demo-videos")
        found = [d for d in r2.json() if d["id"] == created_demo_id][0]
        assert found["title"] == "TEST_Updated Title"

    def test_replace_video_file(self, admin_session, created_demo_id):
        new_bytes = _make_mp4(12)
        files = {"file": ("replaced.mp4", new_bytes, "video/mp4")}
        r = admin_session.post(f"{BASE_URL}/api/admin/demo-videos/{created_demo_id}/video", files=files)
        assert r.status_code == 200, r.text
        # stream should now serve new bytes (size check)
        s = requests.get(f"{BASE_URL}/api/public/demo-media/{created_demo_id}/video")
        assert s.status_code == 200
        assert len(s.content) == len(new_bytes)

    def test_replace_poster(self, admin_session, created_demo_id):
        new_bytes = _make_png(5)
        files = {"file": ("replaced.png", new_bytes, "image/png")}
        r = admin_session.post(f"{BASE_URL}/api/admin/demo-videos/{created_demo_id}/poster", files=files)
        assert r.status_code == 200, r.text
        s = requests.get(f"{BASE_URL}/api/public/demo-media/{created_demo_id}/poster")
        assert s.status_code == 200
        assert len(s.content) == len(new_bytes)

    def test_reorder(self, admin_session, created_demo_id):
        # get current order, reverse it
        r = admin_session.get(f"{BASE_URL}/api/admin/demo-videos")
        ids = [d["id"] for d in r.json()]
        reversed_ids = list(reversed(ids))
        r2 = admin_session.post(
            f"{BASE_URL}/api/admin/demo-videos/reorder",
            json={"order": reversed_ids},
        )
        assert r2.status_code == 200
        returned_ids = [d["id"] for d in r2.json()]
        assert returned_ids == reversed_ids
        # restore original order
        admin_session.post(f"{BASE_URL}/api/admin/demo-videos/reorder", json={"order": ids})


# ---- Validation ----

class TestValidation:
    def test_poster_size_cap_returns_413(self, admin_session):
        big_poster = b"\x89PNG\r\n\x1a\n" + b"A" * (11 * 1024 * 1024)  # 11MB (>10MB cap)
        files = {
            "video": ("v.mp4", _make_mp4(4), "video/mp4"),
            "poster": ("p.png", big_poster, "image/png"),
        }
        data = {"title": "TEST_Oversize", "description": "", "tags": "[]"}
        r = admin_session.post(f"{BASE_URL}/api/admin/demo-videos", files=files, data=data)
        assert r.status_code == 413, f"Expected 413, got {r.status_code}: {r.text}"

    def test_bad_video_extension_returns_400(self, admin_session):
        files = {
            "video": ("bad.txt", b"not a video", "text/plain"),
            "poster": ("p.png", _make_png(2), "image/png"),
        }
        data = {"title": "TEST_BadExt", "description": "", "tags": "[]"}
        r = admin_session.post(f"{BASE_URL}/api/admin/demo-videos", files=files, data=data)
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"

    def test_delete_nonexistent_returns_404(self, admin_session):
        r = admin_session.delete(f"{BASE_URL}/api/admin/demo-videos/demo-doesnotexist")
        assert r.status_code == 404


# ---- Delete flow ----

class TestDelete:
    def test_create_then_delete_removes_from_list(self, admin_session):
        files = {
            "video": ("d.mp4", _make_mp4(4), "video/mp4"),
            "poster": ("d.png", _make_png(2), "image/png"),
        }
        data = {"title": "TEST_ToDelete", "description": "", "tags": "[]"}
        r = admin_session.post(f"{BASE_URL}/api/admin/demo-videos", files=files, data=data)
        assert r.status_code == 200
        new_id = r.json()["id"]

        d = admin_session.delete(f"{BASE_URL}/api/admin/demo-videos/{new_id}")
        assert d.status_code == 200

        # verify gone from public list
        r2 = requests.get(f"{BASE_URL}/api/demo-videos")
        ids = [x["id"] for x in r2.json()]
        assert new_id not in ids

        # stream should 404
        s = requests.get(f"{BASE_URL}/api/public/demo-media/{new_id}/video")
        assert s.status_code == 404
