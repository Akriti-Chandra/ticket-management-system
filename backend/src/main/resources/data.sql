INSERT INTO users (name, email, role) VALUES
    ('Alice Johnson', 'alice.johnson@example.com', 'EMPLOYEE'),
    ('Bob Smith', 'bob.smith@example.com', 'EMPLOYEE'),
    ('Carol Davis', 'carol.davis@example.com', 'SUPPORT_AGENT'),
    ('David Wilson', 'david.wilson@example.com', 'SUPPORT_AGENT'),
    ('Eve Admin', 'eve.admin@example.com', 'ADMIN'),
    ('Frank Miller', 'frank.miller@example.com', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tickets (title, description, priority, status, assigned_to, created_by)
SELECT
    'Cannot access email',
    'Outlook shows authentication error since this morning.',
    'HIGH',
    'OPEN',
    agent.id,
    employee.id
FROM users agent
CROSS JOIN users employee
WHERE agent.email = 'carol.davis@example.com'
  AND employee.email = 'alice.johnson@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM tickets WHERE title = 'Cannot access email'
  );

INSERT INTO tickets (title, description, priority, status, assigned_to, created_by)
SELECT
    'VPN connection drops frequently',
    'VPN disconnects every 15-20 minutes while working remotely.',
    'MEDIUM',
    'IN_PROGRESS',
    agent.id,
    employee.id
FROM users agent
CROSS JOIN users employee
WHERE agent.email = 'david.wilson@example.com'
  AND employee.email = 'bob.smith@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM tickets WHERE title = 'VPN connection drops frequently'
  );

INSERT INTO comments (ticket_id, message, created_by)
SELECT
    ticket.id,
    'I have tried restarting Outlook but the issue persists.',
    employee.id
FROM tickets ticket
CROSS JOIN users employee
WHERE ticket.title = 'Cannot access email'
  AND employee.email = 'alice.johnson@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM comments
      WHERE ticket_id = ticket.id
        AND message = 'I have tried restarting Outlook but the issue persists.'
  );

INSERT INTO comments (ticket_id, message, created_by)
SELECT
    ticket.id,
    'Checking VPN server logs for intermittent disconnects.',
    agent.id
FROM tickets ticket
CROSS JOIN users agent
WHERE ticket.title = 'VPN connection drops frequently'
  AND agent.email = 'david.wilson@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM comments
      WHERE ticket_id = ticket.id
        AND message = 'Checking VPN server logs for intermittent disconnects.'
  );
