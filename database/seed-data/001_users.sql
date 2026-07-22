-- Seed users (6 users: employees, support agents, admin)
-- Idempotent: safe to re-run via ON CONFLICT

INSERT INTO users (name, email, role) VALUES
    ('Alice Johnson', 'alice.johnson@example.com', 'EMPLOYEE'),
    ('Bob Smith', 'bob.smith@example.com', 'EMPLOYEE'),
    ('Carol Davis', 'carol.davis@example.com', 'SUPPORT_AGENT'),
    ('David Wilson', 'david.wilson@example.com', 'SUPPORT_AGENT'),
    ('Eve Admin', 'eve.admin@example.com', 'ADMIN'),
    ('Frank Miller', 'frank.miller@example.com', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;
