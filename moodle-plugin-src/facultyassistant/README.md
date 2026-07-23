# Faculty Assistant Connector for Moodle 4.4

This local plugin exposes the courses and gradebook rows a lecturer can manage and, when separately enabled, imports reviewed GIFT or Moodle XML questions into that lecturer's course question bank. ODeL calls it server-to-server; the desktop application never receives the Moodle web-service token.

## Install

1. Zip the `facultyassistant` folder so `version.php` is at `facultyassistant/version.php` inside the archive.
2. In Moodle, open **Site administration > Plugins > Install plugins**, upload the ZIP, and complete the upgrade.
3. Open **Site administration > Server > Web services > External services** and enable **Faculty Assistant Connector**.
4. Create a dedicated Moodle account such as `svc_facultyassistant`. Do not use an administrator account.
5. Create a system role containing `local/facultyassistant:useservice` and Moodle's required `webservice/rest:use` transport capability. Assign it to the service account at system context, and add that user as an authorised user of the service.
6. Create a token for that user and service. Store it only as `FACULTY_ASSISTANT_MOODLE_TOKEN` on the ODeL Ubuntu server. Keep the website's existing `MOODLE_API_TOKEN` separate.
7. Test `local_facultyassistant_get_teaching_courses` from Moodle's web-service test client before enabling desktop licences.
8. Test `local_facultyassistant_get_course_grades` with a test lecturer and course. It checks the lecturer's own `moodle/grade:viewall` permission and separate-group access before returning numeric grade items.
9. For Professional direct publishing, add `local/facultyassistant:publishquestions` only to the dedicated Faculty Assistant service role. Do not add it to Authenticated user, Teacher, Manager, or the general web-service role.
10. Test `local_facultyassistant_get_question_categories`, `local_facultyassistant_create_question_category`, and `local_facultyassistant_import_questions` before granting any desktop entitlement the `questions:write` feature.

The category function checks the lecturer's `moodle/question:add` and `moodle/question:managecategory` permissions, creates categories only inside the requested course, and reuses an existing same-name category. The generic import function checks the lecturer's `moodle/question:add` permission, accepts at most 2 MB of UTF-8 GIFT or Moodle XML, targets an existing course category, and returns the created question IDs and format for audit. The original GIFT-only function remains available for older clients.

The service starts disabled intentionally. Version `0.6.0` adds Moodle XML publishing so marks, rich question metadata, and private essay grader information can be preserved without exposing Moodle service tokens.
