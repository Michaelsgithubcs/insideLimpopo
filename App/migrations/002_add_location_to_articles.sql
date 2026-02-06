-- Migration: Add location field to articles table
ALTER TABLE articles ADD COLUMN location VARCHAR(255) DEFAULT NULL;