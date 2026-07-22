# Faculty Assistant Connector for Moodle 4.4

This local plugin exposes the courses a lecturer can manage and, when separately enabled, imports reviewed GIFT questions into that lecturer's course question bank. ODeL calls it server-to-server; the desktop application never receives the Moodle web-service token.

## Install

1. Zip the `facultyassistant` folder so `version.php` is at `facultyassistant/version.php` inside the archive.
2. In Moodle, open **Site administration > Plugins > Install plugins**, upload the ZIP, and complete the upgrade.
3. Open **Site administration > Server > Web services > External services** and enable **Faculty Assistant Connector**.
4. Create a dedicated Moodle account such as `svc_facultyassistant`. Do not use an administrator account.
5. Create a system role containing `local/facultyassistant:useservice` and Moodle's required `webservice/rest:use` transport capability. Assign it to the service account at system context, and add that user as an authorised user of the service.
6. Create a token for that user and service. Store it only as `FACULTY_ASSISTANT_MOODLE_TOKEN` on the ODeL Ubuntu server. Keep the website's existing `MOODLE_API_TOKEN` separate.
7. Test `local_facultyassistant_get_teaching_courses` from Moodle's web-service test client before enabling desktop licences.
8. For Professional direct publishing, add `local/facultyassistant:publishquestions` only to the dedicated Faculty Assistant service role. Do not add it to Authenticated user, Teacher, Manager, or the general web-service role.
9. Test `local_facultyassistant_get_question_categories` and `local_facultyassistant_create_question_category` before granting any desktop entitlement the `questions:write` feature.

The category function checks the lecturer's `moodle/question:add` and `moodle/question:managecategory` permissions, creates categories only inside the requested course, and reuses an existing same-name category. The import function checks the lecturer's `moodle/question:add` permission, accepts at most 1 MB of UTF-8 GIFT, targets an existing course category, and returns the created question IDs for audit.

The service starts disabled intentionally. Version `0.4.0` also returns read-only course custom-field metadata so Faculty Assistant can prefill institution-specific iCampus identifiers without exposing Moodle service tokens.
