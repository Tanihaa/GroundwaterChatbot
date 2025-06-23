# backend/db.py
from pymongo import MongoClient
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client.get_default_database()

users_collection = db.users
history_collection = db.history
