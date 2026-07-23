# Faculty Assistant Moderation Desk

## URLs

- Institution review desk: `/faculty-assistant/moderation`
- Institution administration: `/faculty-assistant/admin/moderation`
- Existing commercial Licence Desk: `/faculty-assistant/admin`

The review desk is intentionally separate from the ODeL content administration
and Faculty Assistant Licence Desk.

## Deployment

1. Apply
   `supabase/migrations/20260723000200_faculty_assistant_moderation_desk.sql`.
2. Deploy the ODeL build.
3. Sign in to `/faculty-assistant/admin/moderation` with an existing Faculty
   Assistant administrator account.
4. Select a registered institution, set `disabled`, `optional`, or `required`,
   and save the retention target.
5. Create each moderator with an individual institution email, temporary
   password, and institution, school, or course scope.
6. The moderator signs in at `/faculty-assistant/moderation` and must replace
   the temporary password before any submissions are shown.

For stronger secret separation, configure this server-only variable:

```env
FACULTY_ASSISTANT_MODERATION_JWT_SECRET=<random-secret-at-least-32-bytes>
```

If it is absent, the desk falls back to `FACULTY_ASSISTANT_JWT_SECRET`, then
`JWT_SECRET`. Never expose any of these as `NEXT_PUBLIC_*`.

## Security boundaries

- The desktop derives institution access from its active entitlement.
- Student-grade snapshots are stored in RLS-enabled tables with no browser
  policy. Only ODeL service-role APIs read or write them.
- Lecturer submission re-checks Moodle teaching-course access.
- Moderator API requests re-check the active moderator assignment and active
  institution licence.
- PostgreSQL checks moderator scope again inside the decision transaction.
- A required desktop export re-fetches the live approval receipt and matches
  both local version ID and SHA-256 checksum.
- Moderator decisions are append-only and also enter the Faculty Assistant audit
  log.

Do not create shared committee credentials. Suspend individual moderator
assignments when membership changes.

The beta records a retention target but does not automatically delete grade
records. Add an institution-approved archival and deletion job only after legal
and academic-record retention requirements are signed off.
