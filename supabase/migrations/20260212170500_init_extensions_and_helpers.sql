-- Migration 1: Extensions and Helper Functions
-- Description: Initialize required PostgreSQL extensions and base helper functions

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- UUID generation (v7 recommended for better indexing, fallback to v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigram extension for fuzzy text search (business name search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Case-insensitive text extension (for email comparisons)
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: update_updated_at_column()
-- Purpose: Automatically updates updated_at timestamp on row modifications
-- Usage: Attached as BEFORE UPDATE trigger on tables with updated_at column

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to auto-update updated_at timestamp';
