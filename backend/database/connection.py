from motor.motor_asyncio import AsyncIOMotorClient
import os

_client = None
_db = None


def get_client():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    return _client


def get_db():
    global _db
    if _db is None:
        _db = get_client()[os.environ['DB_NAME']]
    return _db


def close_client():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
