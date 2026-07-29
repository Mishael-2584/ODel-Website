# Faculty Assistant Premium Moodle Deployment

Deploy in this order so the desktop never exposes Moodle publishing or grade
sync before the server and Moodle connector are ready.

## Payment and Email Settings

Configure these only in the production server environment. They are used in
Professional checkout and private licence emails and are never rendered on the
public plans page or returned to browser JavaScript:

```bash
PAYNEXUS_SECRET_KEY="<production sk_ key>"
PAYNEXUS_WEBHOOK_SECRET="<webhook signing secret>"
PAYNEXUS_BASE_URL="https://paynexus.co.ke"
FACULTY_ASSISTANT_PAYMENT_RETURN_ORIGIN="https://facultyassistant.org"
FACULTY_ASSISTANT_PAYMENT_REPORT_SECRET="<shared random secret, at least 32 characters>"
FACULTY_ASSISTANT_EMAIL_FROM_NAME="Faculty Assistant"
FACULTY_ASSISTANT_EMAIL_FROM="support@facultyassistant.org"
FACULTY_ASSISTANT_SUPPORT_EMAIL="support@facultyassistant.org"
```

`PAYNEXUS_PUBLIC_KEY` is not required by the current server-side payment flow.
The API secret creates payment requests, while the separate webhook secret
verifies PayNexus callbacks. The report secret is an internal Faculty Assistant
server-to-server credential and must not reuse either PayNexus secret.

Professional monthly and annual payments activate only after a signed PayNexus
`payment.completed` webhook passes amount, currency and idempotency checks.
No personal M-Pesa number is required when PayNexus is the exclusive payment
channel. The legacy `FACULTY_ASSISTANT_MPESA_PHONE` and
`FACULTY_ASSISTANT_MPESA_RECIPIENT` variables may be configured only if an
approved manual fallback is deliberately required.

Institution requests remain agreement-led, do not expose personal M-Pesa
details, and require manual Licence Desk activation after the institution's
approved invoice, paybill or bank-settlement process.

The support address is also used as the reply-to address for Faculty Assistant
licence emails. General product and institution enquiries use
`hello@facultyassistant.org`.

## 1. Apply the Additive Supabase Migration

Apply the existing commercial migrations first, then run
`supabase/migrations/20260722000100_faculty_assistant_invoices_domains.sql` in
the linked project's SQL editor. The new migration adds private invoice-delivery
state, approved institution email domains, and the atomic activation RPC.

Run `supabase/migrations/20260723000100_faculty_assistant_manual_grants.sql`
after it. This additive function lets an authenticated Licence Desk
administrator grant one audited annual Professional licence after Moodle email
verification. It also makes revoke, restore and extend transactional with their
audit event; revoke invalidates the entitlement's refresh tokens. It does not
delete existing licence history.

Run
`supabase/migrations/20260729000100_faculty_assistant_paynexus_payments.sql`
after the earlier commercial migrations. It adds the private payment-order
ledger and the transaction-safe PayNexus activation RPC. The migration is
additive and does not remove existing requests, entitlements or audit records.

The earlier commercial migration creates:

- `faculty_assistant_publish_jobs`
- `faculty_assistant_upgrade_requests`

Do not change existing RLS policies. The local Supabase migration history has
legacy remote entries that are missing from the repository, so do not use
`supabase db push` until that history is reconciled.

## 2. Upgrade the Moodle Connector

Install `artifacts/moodle/local_facultyassistant-0.7.0.zip` through Moodle's
plugin installer. The expected component is `local_facultyassistant`, release
`0.7.0`. Moodle should detect the package as a Local plugin automatically. This
package upgrades any earlier Faculty Assistant connector directly; installing
`0.4.0` first is not required.

Leave Moodle's advanced **Plugin type** field unselected. After uploading the
ZIP, Moodle should report the detected component as `local_facultyassistant`.
Do not continue if Moodle displays **Unable to detect the plugin type**; rebuild
the package with `.\scripts\build-moodle-plugin.ps1` and upload the generated
`local_facultyassistant` archive.

After the upgrade:

1. Edit the dedicated `facultyassistantservice` system role.
2. Allow `local/facultyassistant:publishquestions` on that role only.
3. Do not grant the capability to Manager, Teacher, Authenticated user, or any
   general integration role.
4. Confirm the Faculty Assistant external service contains exact user email
   lookup, the category functions, legacy GIFT import, generic GIFT/XML import, and
   `local_facultyassistant_get_course_grades` functions.
5. Keep the existing dedicated service token; no desktop token changes are
   required.
6. Keep `local/facultyassistant:useservice` on the dedicated service role. The
   grade endpoint separately verifies that the signed-in lecturer has
   `moodle/grade:viewall` in the requested course and respects separate groups.

Package SHA-256:

`50C88ADA6174FFC7AE6ACCFEBB2241118DE346EDCB3109A0C65585D52D92EE6F`

## 3. Deploy ODeL

Set the payment and email environment variables shown above, then build and
restart the existing PM2 application after merging the branch. Keep the values
in the server environment only; do not prefix them with `NEXT_PUBLIC_`.

In PayNexus, register this webhook for `payment.completed`,
`payment.failed`, and `payment.initiated`:

```text
https://odel.ueab.ac.ke/api/faculty-assistant/payments/paynexus/webhook
```

Keep these browser return URLs allowlisted:

```text
https://facultyassistant.org/payment/return
https://facultyassistant.org/payment/success
https://facultyassistant.org/payment/cancelled
```

Configure the separate Faculty Assistant Netlify site with the same
`FACULTY_ASSISTANT_PAYMENT_REPORT_SECRET` and:

```text
FACULTY_ASSISTANT_ODEL_PAYMENT_REPORT_URL=https://odel.ueab.ac.ke/api/faculty-assistant/integrations/payments
```

The report endpoint is read-only and server-to-server. Never reuse the PayNexus
webhook secret or API key as the report secret.

## 4. Enable a Pilot Lecturer

Only after the first three steps succeed, add `questions:write` and
`grades:read` to the pilot entitlement's `features` array. The desktop asks the
lecturer to explicitly reauthorize each new scope before using it.

Do not add Moodle scopes to Essential licences. Essential remains local/offline,
while Professional and Institution licences receive these features after
activation.

## 5. Validate

1. Open a synced course in Assessment Studio and import or author one simple
   GIFT bank and one XML-recommended bank containing essay grader notes.
2. Enable publishing through the browser authorization screen.
3. Load Moodle question categories.
4. Publish each bank to a test course.
5. Confirm their Moodle creator, category, format, content, marks, private
   grader information, and audit entries.
6. Retry the same request ID and confirm no duplicate question is created.
7. Open the same course in Grade Studio and approve read-only grade access.
8. Synchronize students and grades, confirm Moodle assessment maxima are shown,
   and export the completed iCampus workbook.
9. Submit one Professional monthly request with a test lecturer and confirm the
   STK prompt and private checkout email contain the same Faculty Assistant
   order reference and amount.
10. Complete one payment, confirm only one entitlement extension occurs even if
    the webhook is replayed, and confirm the activation email is sent.
11. Confirm the ODeL licence page and the separate
    `facultyassistant.org/admin` PayNexus report both show the completed payment.
12. Test cancellation and a failed STK prompt; confirm neither activates a
    licence and the hosted checkout link remains available.

Local Moodle validation completed against lecturer `4`, course `4`, category
`10`: Moodle imported one GIFT question and returned question ID `1`.
