-- Create table for Instagram accounts to be scraped
CREATE TABLE "public"."instagram_accounts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "username" text NOT NULL,
    "profile_id" text,
    "scrape_frequency" text NOT NULL DEFAULT 'daily',
    "is_active" boolean NOT NULL DEFAULT true,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    UNIQUE ("username")
);
COMMENT ON TABLE "public"."instagram_accounts" IS 'Instagram accounts to be scraped';

-- Create table for scraping logs
CREATE TABLE "public"."scraping_logs" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "instagram_account_id" uuid NOT NULL,
    "status" text NOT NULL,
    "started_at" timestamptz NOT NULL DEFAULT now(),
    "finished_at" timestamptz,
    "items_scraped" integer,
    "error_message" text,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("instagram_account_id") REFERENCES "public"."instagram_accounts"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
COMMENT ON TABLE "public"."scraping_logs" IS 'Logs of Instagram scraping attempts';

-- Create table for scraped data
CREATE TABLE "public"."scraped_data" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "instagram_account_id" uuid NOT NULL,
    "post_id" text NOT NULL,
    "caption" text,
    "image_url" text,
    "likes_count" integer,
    "comments_count" integer,
    "posted_at" timestamptz,
    "scraped_at" timestamptz NOT NULL DEFAULT now(),
    "metadata" jsonb,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("instagram_account_id") REFERENCES "public"."instagram_accounts"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("instagram_account_id", "post_id")
);
COMMENT ON TABLE "public"."scraped_data" IS 'Data scraped from Instagram posts';

-- Create trigger to update the "updated_at" field on instagram_accounts table
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_public_instagram_accounts_updated_at"
BEFORE UPDATE ON "public"."instagram_accounts"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_current_timestamp_updated_at"(); 