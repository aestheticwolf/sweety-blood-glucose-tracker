
-- ============================================
-- Sweety: Blood Glucose Tracker
-- Database schema
-- PostgreSQL 18
-- ============================================

-- --------------------------------------------
-- 1. USERS TABLE
-- --------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL
        CHECK (LENGTH(TRIM(name)) > 0),

    email VARCHAR(255) NOT NULL,

    password_hash VARCHAR(255) NOT NULL
        CHECK (LENGTH(password_hash) > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email addresses must be unique regardless of case.
CREATE UNIQUE INDEX users_email_unique_idx
ON users (LOWER(email));


-- --------------------------------------------
-- 2. READINGS TABLE
-- --------------------------------------------

CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    reading_date DATE NOT NULL,

    slot VARCHAR(20) NOT NULL
        CHECK (
            slot IN (
                'morning',
                'after_breakfast',
                'after_lunch',
                'after_dinner'
            )
        ),

    value INTEGER NOT NULL
        CHECK (value BETWEEN 40 AND 600),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT readings_user_id_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT readings_user_date_slot_unique
        UNIQUE (user_id, reading_date, slot)
);


-- --------------------------------------------
-- 3. INDEX FOR READING HISTORY
-- --------------------------------------------

CREATE INDEX readings_user_date_idx
ON readings (user_id, reading_date DESC);
