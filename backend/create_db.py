import os
import sqlalchemy
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Connect to the default 'postgres' database first to create the new one
BASE_URL = "postgresql://postgres:odoo@127.0.0.1:5432/postgres"

def create_vedaverse_db():
    engine = create_engine(BASE_URL)
    
    # We need to set isolation_level to AUTOCOMMIT to create a database
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        try:
            # Check if it exists
            result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='vedaverse_db'"))
            if not result.fetchone():
                conn.execute(text("CREATE DATABASE vedaverse_db"))
                print("✅ SUCCESS: 'vedaverse_db' created successfully!")
            else:
                print("ℹ️ INFO: 'vedaverse_db' already exists.")
        except Exception as e:
            print(f"❌ ERROR: Could not create database: {e}")

if __name__ == "__main__":
    create_vedaverse_db()
