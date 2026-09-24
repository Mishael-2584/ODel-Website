#!/usr/bin/env php
<?php
/** Standalone pre-flight checks for the UEAB Course Builder package. */

$root = __DIR__;
$passes = 0;
$failures = 0;

function pass(string $message): void {
    global $passes;
    $passes++;
    echo "[PASS] {$message}\n";
}

function failure(string $message): void {
    global $failures;
    $failures++;
    echo "[FAIL] {$message}\n";
}

function expect(bool $condition, string $message): void {
    $condition ? pass($message) : failure($message);
}

echo "UEAB Course Builder pre-flight\n";
echo str_repeat('=', 34) . "\n";

$required = [
    'version.php', 'block_ueabbuilder.php', 'generate.php', 'reset.php', 'lib.php',
    'db/access.php', 'db/install.xml', 'db/upgrade.php',
    'classes/local/schema.php', 'classes/local/renderer.php',
    'classes/local/publisher.php', 'classes/local/publisher_exception.php',
    'classes/local/form_renderer.php', 'lang/en/block_ueabbuilder.php',
];
foreach ($required as $file) {
    expect(file_exists($root . '/' . $file), "Required file exists: {$file}");
}

foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root)) as $file) {
    if (!$file->isFile() || $file->getExtension() !== 'php') {
        continue;
    }
    $command = escapeshellarg(PHP_BINARY) . ' -l ' . escapeshellarg($file->getPathname()) . ' 2>&1';
    $output = shell_exec($command) ?: '';
    expect(str_contains($output, 'No syntax errors'), 'PHP syntax: ' . str_replace($root . DIRECTORY_SEPARATOR, '', $file->getPathname()));
}

define('MOODLE_INTERNAL', true);
if (!class_exists('context_course')) {
    class context_course {
        public int $id;
        public static function instance(int $courseid): self {
            $context = new self();
            $context->id = 1000 + $courseid;
            return $context;
        }
    }
}
if (!class_exists('moodle_url')) {
    class moodle_url {
        public static function make_pluginfile_url(
            int $contextid,
            string $component,
            string $filearea,
            int $itemid,
            string $filepath,
            string $filename,
            bool $forcedownload,
        ): self {
            return new self("https://moodle.test/pluginfile.php/{$contextid}/{$component}/{$filearea}/{$itemid}/{$filename}");
        }
        public function __construct(private string $url) {}
        public function out(bool $escaped = true): string { return $this->url; }
    }
}
require_once($root . '/classes/local/schema.php');
require_once($root . '/classes/local/renderer.php');
require_once($root . '/classes/local/form_renderer.php');

use block_ueabbuilder\local\renderer;
use block_ueabbuilder\local\schema;
use block_ueabbuilder\local\form_renderer;

$schools = schema::schools();
expect(schema::MAX_TOPICS === 30, 'Course Builder supports up to 30 Topics');
expect(schema::normalise(['topics' => 15])['topics'] === 15,
    'A fifteen-Topic module is not truncated during normalisation');
expect(count($schools) === 5, 'Exactly five UEAB schools are configured');
expect(in_array('School of Education, Humanities and Social Sciences', $schools, true),
    'Education, Humanities and Social Sciences is one school');
expect(count(schema::school_colours()) === 5, 'Each UEAB school has a published colour');

$form = form_renderer::render([
    'saved' => [], 'course_id' => 4, 'course_title' => 'TEST 003',
    'course_shortname' => 'TEST003', 'course_category' => 'Management',
    'can_edit_course_identity' => false,
    'instructor' => 'Test Teacher', 'email' => 'teacher@ueab.ac.ke',
    'generate_url' => '/blocks/ueabbuilder/generate.php',
    'reset_url' => '/blocks/ueabbuilder/reset.php', 'sesskey' => 'test',
]);
foreach (schema::module_fields() as $field) {
    expect(str_contains($form, 'ubb-' . $field), "Form exposes module field: {$field}");
}
expect(str_contains($form, 'School colour key'), 'Course Builder form labels the school colour key');
expect(strpos($form, '5. Course outline and delivery') < strpos($form, '6. Assessment and grading'),
    'Form follows the official Course Outline then assessment sequence');
expect(strpos($form, '6. Assessment and grading') < strpos($form, '8. Significant features'),
    'Significant features follow assessment in the module flow');
expect(str_contains($form, 'What should students do?'),
    'Authoring form retains its familiar administrative student label');
expect(str_contains($form, 'id="ubb-title" class="ubb-input ubb-readonly"'),
    'Teacher form renders the Moodle course full name as read-only');
expect(str_contains($form, 'id="ubb-shortname" class="ubb-input ubb-readonly"'),
    'Teacher form renders the Moodle course short name as read-only');
expect(substr_count($form, 'readonly aria-readonly="true"') === 2,
    'Only the two administrator-owned course identity fields are read-only');
foreach (schema::school_colours() as $colour) {
    expect(str_contains($form, $colour), 'Course Builder form renders school colour ' . $colour);
}
foreach (['pretopic_activity', 'engagement_plan', 'tutor_role', 'assessment_activity',
    'topic_links', 'resource_access', 'inclusive_approach', 'formative_feedback'] as $field) {
    expect(str_contains($form, '"' . $field . '"'), "Topic schema exposes field: {$field}");
}

$legacy = schema::normalise([
    'title' => 'Legacy module', 'lessons' => 2, 'readings' => 'Legacy core text',
    'lessonsdata' => [1 => ['title' => 'Old lesson', 'syllabus' => 'Old content']],
]);
expect($legacy['topics'] === 2, 'Legacy lesson count migrates to topics');
expect($legacy['topicsdata'][1]['course_content'] === 'Old content', 'Legacy lesson content is retained');
expect($legacy['core_texts'] === 'Legacy core text', 'Legacy readings migrate to core texts');
expect(schema::canonical_school('Nursing &amp; Health Sciences') === 'School of Nursing and Health Sciences',
    'Legacy school names map to the canonical five-school list');
$linked = schema::normalise(['topics' => 2, 'topiclinks' => [1 => 'https://moodle.test/mod/page/view.php?id=701']]);
expect($linked['topiclinks'][1] === 'https://moodle.test/mod/page/view.php?id=701',
    'Generated Topic links survive schema normalization');
expect($legacy['credits'] === 3 && $legacy['weeks'] === 15, 'UEAB course defaults are applied');

expect(schema::assessment_weight_total("Coursework | 40 | Work\nFinal exam | 60 | Exam") === 100.0,
    'Structured assessment weights are calculated');
expect(schema::assessment_weight_total("Coursework | invalid | Work") === null,
    'Invalid assessment weights are rejected');

$module = [
    'courseid' => 4,
    'title' => '<script>alert(1)</script>', 'shortname' => 'TEST101',
    'school' => 'School of Business', 'deptname' => 'Management',
    'welcome_message' => 'Welcome to the module.', 'aim' => 'Build practical skills.',
    'course_overview' => "## Topic map\n- Topic one\n- Topic two",
    'grading_scale' => "| Score | Grade |\n| --- | --- |\n| 80-100 | A |",
    'learner_support' => 'Virtual office hours and peer groups.',
    'assessment_components' => "Coursework | 40 | Continuous assessment\nFinal exam | 60 | Examination",
    'topics' => 1,
    'topicsdata' => [1 => ['title' => 'Foundations', 'description' => 'Topic description']],
    'topiclinks' => [1 => 'https://moodle.test/mod/page/view.php?id=701'],
    'assets' => [[
        'id' => '0123456789abcdef', 'filename' => '0123456789abcdef.png',
        'mimeType' => 'image/png', 'byteLength' => 1200, 'fileItemId' => 4,
        'altText' => 'Input and output diagram', 'caption' => 'The information-processing cycle',
        'url' => '',
    ]],
];
$homepage = renderer::homepage($module);
expect(str_contains($homepage, 'Virtual office hours'), 'Learner support is rendered');
expect(str_contains($homepage, 'Frequently asked questions'), 'General course FAQ is rendered');
expect(str_contains($homepage, '1 sequential, self-paced Topic'), 'FAQ uses the configured Topic count');
expect(!str_contains($homepage, '>Lessons<'), 'Learner-facing module navigation uses Topics');
expect(str_contains($homepage, 'elearningsupport@ueab.ac.ke'), 'ODeL support email is rendered');
expect(str_contains($homepage, 'elearningdirector@ueab.ac.ke'), 'eLearning Director email is rendered');
expect(str_contains($homepage, 'Accessibility statement'), 'Accessibility guidance is rendered');
expect(str_contains($homepage, 'href="https://moodle.test/mod/page/view.php?id=701"'),
    'Course Topic card links to its generated Moodle Page');
expect(str_contains($homepage, '<table'), 'Structured tables are rendered');
expect(str_contains($homepage, 'id="outline"'), 'Course outline has a dedicated learner-facing section');
expect(str_contains($homepage, 'href="#outline"'), 'Course navigation links directly to the Course outline');
expect(!str_contains($homepage, '<script>alert(1)</script>'), 'Executable HTML is escaped');
expect(str_contains($homepage, 'data-ueab-builder="module"'), 'Module ownership marker is rendered');
$schoolpalettes = [
    'School of Business' => '#003DA5',
    'School of Education, Humanities and Social Sciences' => '#5B2C83',
    'Nursing &amp; Health Sciences' => '#0F6B3E',
    'School of Science and Technology' => '#B04600',
    'School of Graduate Studies and Research' => '#7A1633',
];
foreach ($schoolpalettes as $schoolname => $primarycolour) {
    $schoolpage = renderer::homepage(array_merge($module, ['school' => $schoolname]));
    expect(str_contains($schoolpage, '--ueab-primary:' . $primarycolour),
        'School palette is rendered for ' . html_entity_decode($schoolname));
}

$topic = renderer::topic(1, $module, [
    'title' => 'Foundations', 'welcome_message' => 'Welcome to Topic 1.',
    'course_content' => "Concepts\nUse the OLS estimator carefully.\nEvidence\nDecisions",
    'pretopic_activity' => 'Read the orientation.', 'pretopic_hours' => 1,
    'f2f_activity' => 'Join the seminar.', 'f2f_hours' => 2,
    'online_activity' => 'Post a reflection.', 'online_hours' => 3,
    'assessment_activity' => 'Complete the quiz.', 'assessment_hours' => 1,
    'what' => 'Review the evidence and post your response.',
    'tutor_role' => 'Facilitate and respond.', 'inclusive_approach' => 'Provide captions.',
    'formative_feedback' => 'Immediate quiz feedback.',
    'document_content' => "## Concepts\nUse the **OLS estimator** *carefully*.\n- Evidence\n- Decisions\n"
        . "## Visual explanation\nInput → process → output\n"
        . "> Assets = Liabilities + Equity\n"
        . "| Generation | Period | Technology Used | Examples | Characteristics |\n"
        . "| --- | --- | --- | --- | --- |\n"
        . "| 1st Generation | 1940–1956 | Vacuum tubes | ENIAC, UNIVAC | Large and power hungry |\n"
        . "[[FA_IMAGE:0123456789abcdef]]\n"
        . "## Unit Activity / Case Study\n### Case Study: Farm productivity\n"
        . "Review the scenario, then attempt each prompt.\n### Discussion Tasks\n"
        . "- Explain the likely relationship.\n- Propose an appropriate model.\n"
        . "Suggested answer: A valid response should justify the selected variables.\n"
        . "Facilitation note: Compare the proposed models in a plenary discussion.\n"
        . "## Topic Summary\nThe Topic is complete.",
]);
expect(str_contains($topic, '7h total hours'), 'Topic total includes assessment time');
expect(str_contains($topic, 'How your tutor will support you'), 'Tutor support uses direct learner-facing language');
expect(str_contains($topic, 'Accessibility and support available to you'),
    'Inclusive approach uses direct learner-facing language');
expect(str_contains($topic, 'What you should do'), 'Topic instructions address the learner directly');
expect(str_contains($topic, '<strong>OLS estimator</strong>'), 'Imported Word bold emphasis is rendered safely');
expect(str_contains($topic, '<em>carefully</em>'), 'Imported Word italic emphasis is rendered safely');
expect(str_contains($topic, '.ueab-card h3,.ueab-card h4,.ueab-card h5'),
    'All imported heading levels receive an explicit visible card colour');
expect(!str_contains($topic, 'What students should do'), 'Published Topic omits third-person student instructions');
expect(str_contains($topic, 'data-ueab-builder="topic"'), 'Topic ownership marker is rendered');
expect(str_contains($topic, 'class="ueab-hero ueab-topic-hero"'), 'Topic uses the balanced Topic hero');
expect(str_contains($topic, 'class="ueab-hero-body"'), 'Topic hero content has an aligned inner container');
expect(substr_count($topic, 'What you will learn') === 1,
    'Topic content contains one canonical What you will learn section');
expect(!str_contains($topic, 'Illustrated study material'),
    'Rich imported study material is not repeated under a second heading');
expect(str_contains($topic, 'loading="lazy"'), 'Imported Word images use responsive lazy loading');
expect(str_contains($topic, 'https://moodle.test/pluginfile.php/1004/block_ueabbuilder/media/4/0123456789abcdef.png'),
    'Persisted file identities rebuild protected Moodle media URLs during Topic rendering');
expect(str_contains($topic, 'alt="Input and output diagram"'), 'Imported Word image alternative text is rendered');
expect(str_contains($topic, 'Input → process → output'), 'Unicode symbols survive Topic rendering');
expect(str_contains($topic,
    '<figure class="ueab-word-figure"><figcaption>Figure or equation</figcaption><blockquote><p>Assets = Liabilities + Equity</p></blockquote></figure>'),
    'Native Word text drawings render as visually distinct accessible figure blocks');
expect(str_contains($topic, '<thead><tr><th scope="col">Generation</th>'),
    'Imported Word table headers render as a semantic table head');
expect(str_contains($topic, '<td>Vacuum tubes</td>'), 'Imported Word table cells remain aligned');
expect(!str_contains($topic, '<p>Generation</p>'), 'Imported Word tables are not flattened into paragraphs');
expect(str_contains($topic, 'class="ueab-practice"'), 'Unit activities render as an attempt-first practice panel');
expect(substr_count($topic, 'class="ueab-practice-question"') === 2,
    'Each imported practice prompt renders as a separate question card');
expect(str_contains($topic, '<textarea rows="4"'), 'Practice cards provide an unsaved learner response area');
expect(str_contains($topic, 'This practice response is not saved or submitted.'),
    'Practice response persistence is described accurately');
expect(str_contains($topic, '<summary>Facilitator guidance</summary>'),
    'Facilitator guidance is collapsed instead of mixed into learner prompts');
expect(str_contains($topic, '<summary>Compare your response</summary>'),
    'Supplied answers remain collapsed until the learner chooses to compare');
expect(strpos($topic, '</section><h4>Topic Summary</h4>') !== false,
    'The practice panel closes before subsequent Topic content');

$migratedtopic = schema::normalise_topic([
    'course_content' => 'Plain duplicate',
    'document_content' => "## Rich content\n[[FA_IMAGE:0123456789abcdef]]",
], 1);
expect($migratedtopic['course_content'] === "## Rich content\n[[FA_IMAGE:0123456789abcdef]]",
    'Legacy illustrated content is promoted into the editable Course content field');
expect($migratedtopic['document_content'] === '',
    'Legacy hidden illustrated content is cleared after migration');

$xml = simplexml_load_file($root . '/db/install.xml');
expect($xml !== false, 'install.xml is well-formed XML');
if ($xml !== false) {
    expect(count($xml->TABLES->TABLE) === 3, 'All three plugin tables are installable');
}

$version = file_get_contents($root . '/version.php');
expect(str_contains($version, "release   = '1.8.5'"), 'Release is 1.8.5');
$publisher = file_get_contents($root . '/classes/local/publisher.php');
expect(str_contains($publisher, 'revision_conflict'), 'Publisher protects against stale revisions');
expect(str_contains($publisher, 'is_siteadmin($actorid)'),
    'Publisher reserves Moodle course identity changes for site administrators');
expect(str_contains($publisher, "\$payload['title'] = (string)\$course->fullname"),
    'Publisher replaces a teacher-supplied title with Moodle course identity');
expect(str_contains($publisher, 'block_ueabbuilder_pages'), 'Publisher tracks builder-owned Pages');
expect(str_contains($publisher, 'add_moduleinfo'), 'Publisher uses Moodle module creation API');
expect(str_contains($publisher, 'media_render_incomplete'),
    'Publisher rejects a revision when any Word image placeholder cannot be rendered');
$endpoint = file_get_contents($root . '/generate.php');
expect(str_contains($endpoint, 'publisher::publish'), 'Block and integrations share the canonical publisher');

echo str_repeat('-', 34) . "\n";
echo "{$passes} passed, {$failures} failed\n";
exit($failures === 0 ? 0 : 1);
