-- ============================================
-- Moodle Data Cache Table
-- Persistent server-side caching for all users
-- ============================================

-- Main cache table for all Moodle data
CREATE TABLE moodle_cache (
  id BIGSERIAL PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_stale BOOLEAN DEFAULT false,
  refresh_status TEXT DEFAULT 'ready' CHECK (refresh_status IN ('ready', 'refreshing', 'error')),
  last_error TEXT,
  hit_count INTEGER DEFAULT 0
);

-- Index for cache key lookup (fast retrieval)
CREATE INDEX idx_moodle_cache_key ON moodle_cache(cache_key);
-- Index for expiry cleanup
CREATE INDEX idx_moodle_cache_expires ON moodle_cache(expires_at);
-- Index for finding stale data
CREATE INDEX idx_moodle_cache_stale ON moodle_cache(is_stale, refresh_status);

-- Background refresh tracking table
CREATE TABLE moodle_cache_refresh_queue (
  id BIGSERIAL PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT 'ttl_expired',
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  processing_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  FOREIGN KEY (cache_key) REFERENCES moodle_cache(cache_key) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_queue_status ON moodle_cache_refresh_queue(status);
CREATE INDEX idx_refresh_queue_queued ON moodle_cache_refresh_queue(queued_at DESC);

-- Cache statistics table for monitoring
CREATE TABLE moodle_cache_stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  total_hits INTEGER DEFAULT 0,
  total_misses INTEGER DEFAULT 0,
  avg_response_time_ms FLOAT DEFAULT 0,
  cache_size_mb FLOAT DEFAULT 0,
  entry_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Enable RLS (accessible by app for caching, but can be public read for speed)
ALTER TABLE moodle_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodle_cache_refresh_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodle_cache_stats ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read for cached data (fast access)
CREATE POLICY "Anyone can read moodle cache" ON moodle_cache
  FOR SELECT USING (true);

-- Allow service role to INSERT/UPDATE/DELETE cache
CREATE POLICY "Service role manages moodle cache" ON moodle_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role updates moodle cache" ON moodle_cache
  FOR UPDATE USING (true);

CREATE POLICY "Service role deletes moodle cache" ON moodle_cache
  FOR DELETE USING (true);

-- Refresh queue policies - allow service role full access
CREATE POLICY "Public read refresh queue" ON moodle_cache_refresh_queue
  FOR SELECT USING (true);

CREATE POLICY "Service role insert refresh queue" ON moodle_cache_refresh_queue
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role update refresh queue" ON moodle_cache_refresh_queue
  FOR UPDATE USING (true);

CREATE POLICY "Service role delete refresh queue" ON moodle_cache_refresh_queue
  FOR DELETE USING (true);

-- Stats policies - allow service role to write
CREATE POLICY "Anyone can view cache stats" ON moodle_cache_stats
  FOR SELECT USING (true);

CREATE POLICY "Service role manage cache stats" ON moodle_cache_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role update cache stats" ON moodle_cache_stats
  FOR UPDATE USING (true);

-- ============================================
-- Functions for Cache Management
-- ============================================

-- Function to mark cache as stale (when data is old but still usable)
CREATE OR REPLACE FUNCTION mark_cache_stale(cache_key_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE moodle_cache
  SET is_stale = true
  WHERE cache_key = cache_key_param;
END;
$$ LANGUAGE plpgsql;

-- Function to queue cache refresh
CREATE OR REPLACE FUNCTION queue_cache_refresh(cache_key_param TEXT, reason_param TEXT DEFAULT 'ttl_expired')
RETURNS void AS $$
BEGIN
  INSERT INTO moodle_cache_refresh_queue (cache_key, reason, status)
  VALUES (cache_key_param, reason_param, 'queued')
  ON CONFLICT (cache_key) DO UPDATE
  SET status = 'queued', queued_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get cache with automatic stale marking
CREATE OR REPLACE FUNCTION get_moodle_cache(cache_key_param TEXT)
RETURNS TABLE (
  cache_data JSONB,
  is_expired BOOLEAN,
  is_stale BOOLEAN,
  age_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.data,
    mc.expires_at < NOW(),
    mc.is_stale,
    EXTRACT(EPOCH FROM (NOW() - mc.created_at))::INTEGER / 60
  FROM moodle_cache mc
  WHERE mc.cache_key = cache_key_param;
  
  -- Update hit count
  UPDATE moodle_cache SET hit_count = hit_count + 1
  WHERE cache_key = cache_key_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update cache with refresh tracking
CREATE OR REPLACE FUNCTION update_moodle_cache(
  cache_key_param TEXT,
  data_param JSONB,
  ttl_minutes INTEGER DEFAULT 30
)
RETURNS void AS $$
BEGIN
  INSERT INTO moodle_cache (cache_key, data, expires_at, refresh_status)
  VALUES (
    cache_key_param,
    data_param,
    NOW() + (ttl_minutes || ' minutes')::INTERVAL,
    'ready'
  )
  ON CONFLICT (cache_key) DO UPDATE
  SET 
    data = EXCLUDED.data,
    updated_at = NOW(),
    expires_at = NOW() + (ttl_minutes || ' minutes')::INTERVAL,
    refresh_status = 'ready',
    is_stale = false,
    last_error = NULL;
  
  -- Mark refresh as completed
  UPDATE moodle_cache_refresh_queue
  SET status = 'completed', completed_at = NOW()
  WHERE cache_key = cache_key_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all expired/stale cache keys for refresh
CREATE OR REPLACE FUNCTION get_stale_cache_keys()
RETURNS TABLE (cache_key TEXT, is_expired BOOLEAN, is_stale BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.cache_key,
    mc.expires_at < NOW(),
    mc.is_stale
  FROM moodle_cache mc
  WHERE mc.expires_at < NOW() OR (mc.is_stale AND mc.refresh_status = 'ready')
  ORDER BY mc.expires_at ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old cache entries
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM moodle_cache
  WHERE expires_at < NOW() - INTERVAL '2 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Scheduled Tasks (using pg_cron if available)
-- ============================================

-- Note: Uncomment if pg_cron extension is enabled
-- SELECT cron.schedule('cleanup-moodle-cache', '0 * * * *', 'SELECT cleanup_old_cache()');
-- SELECT cron.schedule('queue-stale-refreshes', '*/5 * * * *', 'INSERT INTO moodle_cache_refresh_queue SELECT cache_key, ''stale_refresh'', ''queued'' FROM moodle_cache WHERE is_stale AND refresh_status = ''ready'' ON CONFLICT DO NOTHING');
