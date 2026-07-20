# Faculty Assistant Connector Pilot

This rollout is additive. It does not alter existing Supabase tables or policies, and the Moodle plugin is read-only and disabled after installation until an administrator enables its service.

## Architecture

1. Faculty Assistant opens the system browser at ODeL using OAuth-style Authorization Code with PKCE.
2. The lecturer signs in with the existing ODeL email-code flow.
3. ODeL verifies the lecturer's active Faculty Assistant entitlement and returns a two-minute, single-use code to `facultyassistant://auth/callback`.
4. The desktop app exchanges that code for a 15-minute access token and rotating 30-day refresh token.
5. ODeL calls Moodle server-to-server with a restricted Moodle service token. That token is never sent to the desktop app.
6. Windows encrypts the refresh token through Electron `safeStorage`; ODeL stores only SHA-256 token hashes.

## Safe rollout order

### 1. Rotate exposed credentials

The repository currently tracks `.env.local.backup` and `netlify-env-vars.txt`. Treat every credential in those files as exposed. Rotate the Supabase service role key, Moodle web-service token, JWT secrets and any other listed credentials before the connector goes live. Remove both files from Git tracking and repository history after rotation; never reuse the old values.

The updated `.gitignore` prevents similarly named files from being added again after they are untracked.

### 2. Install the Moodle plugin

Use `artifacts/moodle/facultyassistant-0.1.2.zip` at **Site administration > Plugins > Install plugins**. Complete the upgrade, but leave the service disabled while configuring it.

Create a dedicated non-administrator account such as `svc_facultyassistant`. Create a system role containing `local/facultyassistant:useservice` plus Moodle's required `webservice/rest:use` transport capability. Assign it to that account at system context, add the account as an authorised user of **Faculty Assistant Connector**, then generate a token specifically for this service. Do not grant course-management or administrator capabilities to the service account.

Enable the service and test `local_facultyassistant_get_teaching_courses` using Moodle's web-service test client. Confirm that a lecturer returns only courses where they can update the course or manage activities.

### 3. Apply the Supabase migration

Back up the database, then apply:

```text
supabase/migrations/20260717000100_faculty_assistant_connector.sql
supabase/migrations/20260720000200_faculty_assistant_instances.sql
```

The four new tables have RLS enabled and no browser-client policies. Existing policies are unchanged. Only ODeL's server-side service-role client can access connector licences and credentials.

Create one pilot entitlement after replacing the sample values:

```sql
INSERT INTO faculty_assistant_entitlements
  (moodle_instance, moodle_user_id, email, plan, features, expires_at)
VALUES
  ('ueab-production', 123, 'lecturer@ueab.ac.ke', 'pilot',
   ARRAY['profile:read', 'courses:read'], NOW() + INTERVAL '30 days')
ON CONFLICT (moodle_instance, moodle_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  plan = EXCLUDED.plan,
  features = EXCLUDED.features,
  expires_at = EXCLUDED.expires_at,
  is_active = true,
  updated_at = NOW();
```

### 4. Configure Ubuntu

Add these server-only values to the environment used by PM2. Do not prefix either secret with `NEXT_PUBLIC_`.

```bash
FACULTY_ASSISTANT_JWT_SECRET=<new-random-secret-of-at-least-32-bytes>
FACULTY_ASSISTANT_MOODLE_TOKEN=<dedicated-faculty-assistant-service-token>
FACULTY_ASSISTANT_MOODLE_INSTANCE=ueab-production
MOODLE_API_TOKEN=<existing-odel-website-service-token>
NEXT_PUBLIC_APP_URL=https://odel.ueab.ac.ke
NEXT_PUBLIC_MOODLE_URL=https://ielearning.ueab.ac.ke
```

Keep the existing `SUPABASE_SERVICE_ROLE_KEY` and `MOODLE_API_TOKEN` available to the server. The new connector token is intentionally separate so its restricted service does not gain the website token's existing functions. Generate the new JWT secret with a cryptographically secure utility such as `openssl rand -base64 48`.

### 5. Deploy ODeL

Use the existing deployment process on a staging hostname first:

```bash
git pull
npm ci
npm run build
pm2 restart ueab-odel --update-env
pm2 logs ueab-odel --lines 100
```

Confirm public course browsing, ODeL login, the student dashboard, and Moodle SSO before testing Faculty Assistant. The connector API paths are under `/api/faculty-assistant/` and do not replace existing routes.

### 6. Package and pilot the Windows app

Build the signed installer with `npm run build:win` in the Faculty Assistant project. The installer registers the `facultyassistant://` protocol. Test sign-in, browser return, course sync, app restart/token refresh, disconnect, expired licence, and a revoked Moodle token on a pilot Windows account.

## Rollback

1. Disable **Faculty Assistant Connector** in Moodle external services or revoke its service token.
2. Set pilot entitlements to `is_active = false`.
3. Roll ODeL back to the previous Git revision and restart PM2.
4. Do not drop the additive tables during an incident; retain their audit records until the review is complete.

## Next permission increments

Add grade reads, quiz reads, quiz writes and grade writes as separate scopes and separate Moodle external functions. Each write capability should require explicit lecturer confirmation, idempotency keys, an audit record, and a pilot period before general release.
