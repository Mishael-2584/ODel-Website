# Faculty Assistant Premium Moodle Deployment

Deploy in this order so the desktop never exposes Moodle publishing or grade
sync before the server and Moodle connector are ready.

## Private Manual Invoice Settings

Configure these only in the production server environment. They are used in
private Professional invoice emails and are never rendered on the public plans
page or returned by the upgrade API:

```bash
FACULTY_ASSISTANT_MPESA_PHONE="<private M-Pesa number>"
FACULTY_ASSISTANT_MPESA_RECIPIENT="<verified recipient name>"
FACULTY_ASSISTANT_EMAIL_FROM_NAME="Faculty Assistant"
FACULTY_ASSISTANT_EMAIL_FROM="support@facultyassistant.org"
FACULTY_ASSISTANT_SUPPORT_EMAIL="support@facultyassistant.org"
```

The request remains pending after invoice delivery. Only a Licence Desk
administrator can activate it after independently verifying the payment.
The support address is also used as the reply-to address for Faculty Assistant
licence emails. General product and institution enquiries use
`hello@facultyassistant.org`.

## 1. Apply the Additive Supabase Migration

Apply the existing commercial migrations first, then run
`supabase/migrations/20260722000100_faculty_assistant_invoices_domains.sql` in
the linked project's SQL editor. The new migration adds private invoice-delivery
state, approved institution email domains, and the atomic activation RPC.

The earlier commercial migration creates:

- `faculty_assistant_publish_jobs`
- `faculty_assistant_upgrade_requests`

Do not change existing RLS policies. The local Supabase migration history has
legacy remote entries that are missing from the repository, so do not use
`supabase db push` until that history is reconciled.

## 2. Upgrade the Moodle Connector

Install `artifacts/moodle/facultyassistant-0.5.0-moodle.zip` through Moodle's
plugin installer. The expected component is `local_facultyassistant`, release
`0.5.0`. Moodle should detect the package as a Local plugin automatically. This
package upgrades any earlier Faculty Assistant connector directly; installing
`0.4.0` first is not required.

After the upgrade:

1. Edit the dedicated `facultyassistantservice` system role.
2. Allow `local/facultyassistant:publishquestions` on that role only.
3. Do not grant the capability to Manager, Teacher, Authenticated user, or any
   general integration role.
4. Confirm the Faculty Assistant external service contains the category and
   GIFT import functions and `local_facultyassistant_get_course_grades`.
5. Keep the existing dedicated service token; no desktop token changes are
   required.
6. Keep `local/facultyassistant:useservice` on the dedicated service role. The
   grade endpoint separately verifies that the signed-in lecturer has
   `moodle/grade:viewall` in the requested course and respects separate groups.

Package SHA-256:

`24FC2B5828E3C091299FB1D4B0042DD7DB090DFABB0338D0715B3C5CE22AFDAB`

## 3. Deploy ODeL

Set the private invoice environment variables shown above, then build and
restart the existing PM2 application after merging the branch. Keep the values
in the server environment only; do not prefix them with `NEXT_PUBLIC_`.

## 4. Enable a Pilot Lecturer

Only after the first three steps succeed, add `questions:write` and
`grades:read` to the pilot entitlement's `features` array. The desktop asks the
lecturer to explicitly reauthorize each new scope before using it.

Do not add Moodle scopes to Essential licences. Essential remains local/offline,
while Professional and Institution licences receive these features after
activation.

## 5. Validate

1. Open a synced course in Assessment Studio.
2. Enable publishing through the browser authorization screen.
3. Load Moodle question categories.
4. Publish one clearly named test question to a test course.
5. Confirm its Moodle creator, category, content, and audit entries.
6. Retry the same request ID and confirm no duplicate question is created.
7. Open the same course in Grade Studio and approve read-only grade access.
8. Synchronize students and grades, confirm Moodle assessment maxima are shown,
   and export the completed iCampus workbook.

Local Moodle validation completed against lecturer `4`, course `4`, category
`10`: Moodle imported one GIFT question and returned question ID `1`.
