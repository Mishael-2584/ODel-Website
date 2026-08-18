# Change log

## 1.7.1 - 2026-08-18

- Made Moodle course full name and short name read-only for teachers.
- Enforced the same boundary in the canonical publisher so modified requests cannot bypass the form.
- Kept site administrators able to update course identity while preserving all other teacher-editable module fields.

## 1.7.0 - 2026-08-17

- Reordered the authoring form and published module to follow the official Course Outline, assessment and significant-features sequence.
- Added a dedicated learner-facing Course Outline section so large syllabi, lists and tables no longer crowd the course hero.
- Kept all schema version 2 field identifiers stable for Faculty Assistant and existing saved courses.

## 1.6.1 - 2026-08-13

- Reworded published module and Topic guidance to speak directly to learners using `you` and `your`.
- Kept Course Builder authoring labels and stored field identifiers unchanged for staff familiarity and compatibility.

## 1.5.2 - 2026-08-12

- Fixed Course map Topic cards so they retain and open their generated Moodle Page URLs.
- Restored the five distinct school palettes and added compatibility for legacy school labels.
- Refined the course homepage with a school-branded masthead, summary metrics, richer cards and clearer Topic navigation.

## 1.5.1 - 2026-08-11

- Added automatically generated FAQs, UEAB ODeL support contacts and an accessibility statement to every module homepage.
- Made general guidance adapt to the configured number of Topics and to Moodle completion-tracking availability.
- Added print-friendly course and Topic styling.
- Standardised learner-facing terminology on Topics while retaining legacy lesson aliases for existing saved courses.

## 1.5.0 - 2026-08-06

- Aligned module and topic forms with the official UEAB template order.
- Corrected the institution list to five schools.
- Added module welcome, learner support and quality-assurance fields.
- Separated author roles, core/reference texts and course-policy fields.
- Added structured delivery and assessment components with 100% validation.
- Added all missing topic activity, tutor, resource, inclusion and feedback fields.
- Added safe paragraph, list, heading and table rendering for large curriculum fields.
- Included assessment time in calculated topic hours.
- Added schema versioning, immutable revisions and stale-update protection.
- Added builder Page ownership tracking and safe legacy Page adoption.
- Switched Page creation to Moodle's supported module creation API.
- Preserved version 1.x saved data through normalization aliases.
