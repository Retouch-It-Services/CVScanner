from models.database import engine
from sqlalchemy import text

print("⏳ Connecting to PostgreSQL and checking for 'profile_pic' column...")

sql = """
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'profile_pic'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_pic VARCHAR;
    END IF;
END $$;
"""

with engine.connect() as conn:
    conn.execute(text(sql))
    conn.commit()

print("✅ Column 'profile_pic' added successfully (if not already present).")
