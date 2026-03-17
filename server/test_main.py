from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to nu_Tree API System"}

def test_get_trees_empty():
    response = client.get("/api/v1/trees/")
    assert response.status_code == 200
    assert response.json() == []
