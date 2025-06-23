# backend/auth.py
from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from db import users_collection
import datetime

auth = Blueprint("auth", __name__)
bcrypt = Bcrypt()

@auth.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    users_collection.insert_one({
        "email": email,
        "password": hashed_pw
    })
    return jsonify({"message": "User created successfully"}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user['_id']), expires_delta=datetime.timedelta(days=1))
    return jsonify({"token": access_token}), 200
