# UEAB Course Builder

UEAB Course Builder is a Moodle block for creating and maintaining a structured,
learner-facing module home page and topic Pages inside an existing course.

## Release 1.7.1

Version 1.7.1 keeps Moodle course identity under administrator control. Course
full name and short name are read-only for teachers, and the publisher replaces
any teacher-submitted values with the current Moodle course values before it
saves a revision. Site administrators retain course-identity control.

Version 1.7.0 aligned the block form and published layout with the official UEAB
module sequence. Large Course Outline content now has its own learner-facing
section, while assessment tables, texts, policies and significant features remain
separate and easy to review. Published guidance uses direct learner-facing `you`
and `your` language, while field identifiers remain compatible with schema 2.

The five configured schools are:

1. School of Business
2. School of Education, Humanities and Social Sciences
3. School of Nursing and Health Sciences
4. School of Science and Technology
5. School of Graduate Studies and Research

## Structured content

Large text fields accept structured plain text:

- Blank lines create paragraphs.
- `- Item` creates a bullet list.
- `1. Item` creates a numbered list.
- `## Heading` creates a heading.
- Markdown-style rows such as `| Score | Grade |` create tables.

Input is escaped before rendering. Executable HTML is not accepted.

Assessment components use this repeatable line format:

```text
Continuous assessment | 40 | Quizzes, assignments and project
Final examination | 60 | Summative examination
```

When assessment components are supplied, their weights must total exactly 100%.

## Synchronization contract

The current module is stored in `block_ueabbuilder_data` using schema version 2.
Every successful block save creates an immutable record in
`block_ueabbuilder_versions`. Updates include an expected revision and stale
updates are rejected with `revision_conflict`.

`source` identifies whether a revision originated from `block`, `reset`, or the
future `facultyassistant` connector. This is the foundation for safe two-way
editing without silent last-write-wins data loss.

Generated topic Pages are tracked in `block_ueabbuilder_pages`. The publisher
updates only tracked Pages. It can adopt legacy version 1.x Pages carrying the
old UEAB-generated marker, but it does not overwrite unrelated lecturer Pages.
Reducing the topic count hides unused builder Pages rather than deleting them.

## Automatically generated learner information

Every module homepage includes a Topic-aware FAQ, UEAB ODeL support contacts,
printing guidance and an accessibility statement. These sections are maintained
by the plugin and are not additional teacher form fields.

The module homepage and generated Topic Pages use one of five school-specific
palettes. Course map cards link directly to their tracked Moodle Page resources.

## Upgrade behavior

- Existing version 1.x JSON remains readable.
- `readings` migrates to `core_texts` when no separate core text exists.
- Existing `lessonsdata` migrates to `topicsdata`.
- Legacy `syllabus` topic content migrates to `course_content`.
- Legacy generated Pages are adopted on the next successful publish.
- Published Moodle content is not deleted when saved form data is reset.

## Installation

Upload the Moodle-safe ZIP without manually selecting a plugin type. Moodle
must detect it as `block_ueabbuilder`. The ZIP contains exactly one top-level
`ueabbuilder` folder, uses forward-slash archive paths and has `version.php`
directly inside that folder.

After installation or upgrade, visit **Site administration > Notifications** and
complete the database upgrade. Purge Moodle caches, then open a managed course
and add the **UEAB Course Builder** block.

## Verification

Run the standalone pre-flight suite before packaging or installation:

```text
php test_plugin.php
```

The suite validates PHP syntax, schema coverage, legacy migration, school data,
rich rendering, assessment weights, XSS escaping, ownership markers and database
XML structure.
