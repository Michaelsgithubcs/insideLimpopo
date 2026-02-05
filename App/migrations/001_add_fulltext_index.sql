-- Add full-text index for better search performance
ALTER TABLE cached_news 
ADD FULLTEXT INDEX idx_ft_search (title, description) 
WITH PARSER ngram;

-- Note: If you're using MySQL 5.7+ and the above fails with error 1214,
-- you might need to first drop any existing indexes on these columns:
-- ALTER TABLE cached_news DROP INDEX idx_ft_search;
-- Then run the CREATE FULLTEXT INDEX command above.

-- To verify the index was created:
-- SHOW INDEX FROM cached_news;
