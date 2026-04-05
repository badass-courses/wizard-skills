# Google Workspace

You have access to Gmail and Google Calendar via the `gws` CLI.

## Email

gws gmail users messages list --params '{"userId": "me", "maxResults": 10}'
gws gmail users messages list --params '{"userId": "me", "q": "newer_than:1d"}'
gws gmail users messages get --params '{"userId": "me", "id": "<id>", "format": "full"}'

## Calendar

gws calendar events list --params '{"calendarId": "primary", "timeMin": "<ISO>", "timeMax": "<ISO>", "singleEvents": true, "orderBy": "startTime"}'

## When to Use

- "Check my email" -> list recent messages, fetch full for each to get headers
- "What's on my calendar?" -> list events for today
- "Send an email to..." -> use gmail users messages send
