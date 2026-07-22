-- Sample comments linked to seed tickets
-- Requires users and tickets from prior seed scripts

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
    'Reset your mailbox sync settings and try again. I will escalate if needed.',
    agent.id
FROM tickets ticket
CROSS JOIN users agent
WHERE ticket.title = 'Cannot access email'
  AND agent.email = 'carol.davis@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM comments
      WHERE ticket_id = ticket.id
        AND message = 'Reset your mailbox sync settings and try again. I will escalate if needed.'
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

INSERT INTO comments (ticket_id, message, created_by)
SELECT
    ticket.id,
    'New laptop has been ordered. Tracking number will be shared once shipped.',
    agent.id
FROM tickets ticket
CROSS JOIN users agent
WHERE ticket.title = 'Request new laptop'
  AND agent.email = 'carol.davis@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM comments
      WHERE ticket_id = ticket.id
        AND message = 'New laptop has been ordered. Tracking number will be shared once shipped.'
  );
