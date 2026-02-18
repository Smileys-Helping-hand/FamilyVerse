-- Migration for API keys table
CREATE TABLE IF NOT EXISTS apiKeys (
    id SERIAL PRIMARY KEY,
    key VARCHAR(128) NOT NULL UNIQUE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    createdBy VARCHAR(128) NOT NULL
);
