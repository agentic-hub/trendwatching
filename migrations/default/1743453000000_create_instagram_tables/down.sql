-- Drop tables in reverse order of creation (to respect foreign key constraints)
DROP TABLE IF EXISTS "public"."scraped_data";
DROP TABLE IF EXISTS "public"."scraping_logs";
DROP TABLE IF EXISTS "public"."instagram_accounts";

-- Drop the trigger function if it's not used elsewhere
DROP FUNCTION IF EXISTS "public"."set_current_timestamp_updated_at"(); 