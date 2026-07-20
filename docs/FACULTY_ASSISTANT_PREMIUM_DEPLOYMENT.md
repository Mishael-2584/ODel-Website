# Faculty Assistant Premium Publishing Deployment

Deploy in this order so the desktop never exposes a write action before the
server and Moodle capability are ready.

## 1. Apply the Additive Supabase Migration

Run `supabase/migrations/20260720000300_faculty_assistant_commercial.sql` in
the linked project's SQL editor. It only adds these service-role-only tables:

- `faculty_assistant_publish_jobs`
- `faculty_assistant_upgrade_requests`

Do not change existing RLS policies. The local Supabase migration history has
legacy remote entries that are missing from the repository, so do not use
`supabase db push` until that history is reconciled.

## 2. Upgrade the Moodle Connector

Install `artifacts/moodle/facultyassistant-0.2.0-moodle.zip` through Moodle's
plugin installer. The expected component is `local_facultyassistant`, release
`0.2.0`.

After the upgrade:

1. Edit the dedicated `facultyassistantservice` system role.
2. Allow `local/facultyassistant:publishquestions` on that role only.
3. Do not grant the capability to Manager, Teacher, Authenticated user, or any
   general integration role.
4. Confirm the Faculty Assistant external service contains the category and
   GIFT import functions.
5. Keep the existing dedicated service token; no desktop token changes are
   required.

Package SHA-256:

`9EEDF255056EE7D8447B282B97C138496F6B29F0A5CD0A5C7AD2AC55DDFC52A5`

## 3. Deploy ODeL

Build and restart the existing PM2 application after merging the branch. No
new environment variables are required.

## 4. Enable a Pilot Lecturer

Only after the first three steps succeed, add `questions:write` to the pilot
entitlement's `features` array. The desktop asks the lecturer to explicitly
reauthorize the new scope before publishing.

Do not add `questions:write` to all licences by default. Essential licences
remain local/offline, while Professional and Institution licences receive the
feature after activation.

## 5. Validate

1. Open a synced course in Assessment Studio.
2. Enable publishing through the browser authorization screen.
3. Load Moodle question categories.
4. Publish one clearly named test question to a test course.
5. Confirm its Moodle creator, category, content, and audit entries.
6. Retry the same request ID and confirm no duplicate question is created.

Local Moodle validation completed against lecturer `4`, course `4`, category
`10`: Moodle imported one GIFT question and returned question ID `1`.
