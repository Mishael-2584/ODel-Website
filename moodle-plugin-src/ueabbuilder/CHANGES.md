# Change log

## 1.9.2 - 2026-10-01

- Render self-assessment, review and practice questions as individual learner practice cards.
- Support mixed question formats, including multiple choice, true/false, fill-in-the-blank and open responses.
- Match labelled and detached answer keys to questions, keeping answers hidden until learners choose to reveal them.
- Preserve question emphasis and avoid converting question-like content inside tables into practice controls.

## 1.9.1 - 2026-09-26

- Include the Topic number and expected/rendered image counts when Moodle cannot render every imported image.
- Report unresolved image asset IDs so media upload/persistence failures can be diagnosed without losing the draft.
- Preserve an explicit Topic heading when copied syllabus content contains a stale heading.

## 1.9.0 - 2026-09-25

- Apply the same canonical UEAB grading scale to every course, independent of level or programme metadata.
- Always render the scale section, including when the source module has no grading-scale value.
- Remove embedded duplicate scale sections and retain Other symbols notes in one place.

## 1.8.9 - 2026-09-24

- Strip embedded grading-scale sections from narrative module fields during Moodle rendering.
- Keep the canonical scale to one visible instance and preserve Other symbols notes.

## 1.8.8 - 2026-09-24

- Make matched answer disclosures explicit and explain when an MCQ answer key was not detected.
- Accept a bare `Answers` heading and an unnumbered first key followed by numbered answers.
- Render the canonical UEAB undergraduate grading scale once instead of trusting duplicated imported tables.
- Keep postgraduate grading scales course-specific and preserve `Other symbols` notes.

## 1.8.7 - 2026-09-24

- Detect Word-auto-numbered/bulleted self-assessment headings and case-insensitive variants.
- Render lettered, compact inline and unlabelled multiple-choice options as accessible radio choices.
- Match detached answer keys, including compact `1.B, 2.C` formats, to question numbers; keep answers collapsed.
- Keep open-ended practice prompts as unsaved scratch responses.

## 1.8.6 - 2026-09-24

- Recognise case-insensitive review, revision, self-assessment, self-check and knowledge-check headings, including headings that mention answer keys.
- Turn `Question 1` / `Q1` prompt-and-answer paragraphs into separate practice cards.
- Keep `Answer`, `Answer key`, `Correct answer`, `Suggested answer`, `Model answer`, `Sample answer` and `Solution` content hidden until the learner chooses to compare.

## 1.8.5 - 2026-09-24

- Render imported Topic study material once under `What you will learn` instead of duplicating a plain and illustrated copy.
- Promote legacy rich Word content into the editable Course content field while preserving tables, formatting, symbols and images.
- Raise the supported Topic count from 12 to 30 in the block form, publisher and schema.

## 1.8.4 - 2026-09-23

- Render imported unit activities and self-assessment lists as accessible attempt-first practice cards.
- Provide clearly labelled unsaved response areas without pretending that static Moodle Page content submits or grades work.
- Keep facilitator guidance and supplied model answers collapsed away from the initial learner attempt.

## 1.8.3 - 2026-09-23

- Render Word bold and italic emphasis safely throughout module and Topic content.
- Assign explicit visible colours to imported heading levels so Moodle themes cannot hide them.
- Pair with Faculty Assistant's explicit Topic-number binding and broader grading-table import.

## 1.8.2 - 2026-09-23

- Rebuild protected illustration URLs from persisted Moodle file identities when Topic Pages are rendered.
- Reject a revision if any imported Word image placeholder cannot be resolved, avoiding false-success publications.

## 1.8.1 - 2026-09-23

- Preserved nested Word tables as semantic Moodle tables instead of flattened paragraphs.
- Added clear table headers, alternating rows and responsive horizontal scrolling.
- Refined imported figure framing and spacing across desktop and mobile layouts.

## 1.8.0 - 2026-09-23

- Added secure Course Builder image publishing from Faculty Assistant Word imports.
- Preserved ordered images and Unicode symbols in illustrated Topic material.
- Stored image binaries in Moodle's file API instead of revision JSON or browser storage.
- Added responsive, lazy-loaded figures with accessible alternative text and captions.
- Preserved imported media when a lecturer later edits the module from the Moodle block.

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
