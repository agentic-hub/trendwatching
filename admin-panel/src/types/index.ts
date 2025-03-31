export interface Account {
  id: string;
  username: string;
  is_active: boolean;
  scrape_frequency: string;
  last_scraped_at?: string;
  status?: string;
  scraping_logs: {
    status: string;
    started_at: string;
    items_scraped?: number;
  }[];
  scraping_logs_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface ScrapingLog {
  id: string;
  instagram_account?: {
    username: string;
    id: string;
  };
  started_at: string;
  finished_at?: string;
  items_scraped?: number;
  status: string;
  error_message?: string;
} 