import os
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Configure logging to see output clearly
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()

def test_connection():
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:odoo@127.0.0.1:5432/postgres")
    logger.info(f"Attempting to connect to: {db_url}")
    
    try:
        # 1. Connect to Database
        engine = create_engine(db_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            row = result.fetchone()
            logger.info("✅ SUCCESS: Connected to PostgreSQL!")
            logger.info(f"🐘 Postgres version: {row[0]}")

        # 2. Check for tables
        from database import init_db
        from curated_data import seed_db
        
        logger.info("🔨 Creating tables (if not exists)...")
        init_db()
        logger.info("🌱 Seeding initial data...")
        seed_db()
        logger.info("🚀 ALL DONE! Refresh pgAdmin and check Databases > postgres > Schemas > public > Tables.")

    except Exception as e:
        logger.error("❌ FAILED: Could not connect to the database.")
        logger.error(f"Error details: {e}")
        logger.info("\nQuick check tips:")
        logger.info("1. Is PostgreSQL running on your machine?")
        logger.info("2. Is the password 'odoo' correct?")
        logger.info("3. Are you using pgAdmin to refresh the 'postgres' database view?")

if __name__ == "__main__":
    test_connection()
