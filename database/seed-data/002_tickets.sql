-- Sample tickets for local development and demos
-- Requires users from 001_users.sql

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

INSERT INTO tickets (title, description, priority, status, assigned_to, created_by)
SELECT
    'Request new laptop',
    'Current laptop battery no longer holds a charge. Need replacement before travel next month.',
    'LOW',
    'RESOLVED',
    agent.id,
    employee.id
FROM users agent
CROSS JOIN users employee
WHERE agent.email = 'carol.davis@example.com'
  AND employee.email = 'frank.miller@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM tickets WHERE title = 'Request new laptop'
  );

INSERT INTO tickets (title, description, priority, status, assigned_to, created_by)
SELECT
    'Printer offline on 3rd floor',
    'Shared printer shows offline status for all users on the east wing.',
    'CRITICAL',
    'CLOSED',
    agent.id,
    employee.id
FROM users agent
CROSS JOIN users employee
WHERE agent.email = 'david.wilson@example.com'
  AND employee.email = 'alice.johnson@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM tickets WHERE title = 'Printer offline on 3rd floor'
  );
