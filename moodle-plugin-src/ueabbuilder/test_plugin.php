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
    'version.php', 'block_ueabbuilder.php', 'generate.php', 'reset.php',
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
require_once($root . '/classes/local/schema.php');
require_once($root . '/classes/local/renderer.php');
require_once($root . '/classes/local/form_renderer.php');

use block_ueabbuilder\local\renderer;
use block_ueabbuilder\local\schema;
use block_ueabbuilder\local\form_renderer;

$schools = schema::schools();
expect(count($schools) === 5, 'Exactly five UEAB schools are configured');
expect(in_array('School of Education, Humanities and Social Sciences', $schools, true),
    'Education, Humanities and Social Sciences is one school');
expect(count(schema::school_colours()) === 5, 'Each UEAB school has a published colour');

$form = form_renderer::render([
    'saved' => [], 'course_id' => 4, 'course_title' => 'TEST 003',
    'course_shortname' => 'TEST003', 'course_category' => 'Management',
    'instructor' => 'Test Teacher', 'email' => 'teacher@ueab.ac.ke',
    'generate_url' => '/blocks/ueabbuilder/generate.php',
    'reset_url' => '/blocks/ueabbuilder/reset.php', 'sesskey' => 'test',
]);
foreach (schema::module_fields() as $field) {
    expect(str_contains($form, 'ubb-' . $field), "Form exposes module field: {$field}");
}
expect(str_contains($form, 'School colour key'), 'Course Builder form labels the school colour key');
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
    'course_content' => "## Concepts\n- Evidence\n- Decisions",
    'pretopic_activity' => 'Read the orientation.', 'pretopic_hours' => 1,
    'f2f_activity' => 'Join the seminar.', 'f2f_hours' => 2,
    'online_activity' => 'Post a reflection.', 'online_hours' => 3,
    'assessment_activity' => 'Complete the quiz.', 'assessment_hours' => 1,
    'tutor_role' => 'Facilitate and respond.', 'inclusive_approach' => 'Provide captions.',
    'formative_feedback' => 'Immediate quiz feedback.',
]);
expect(str_contains($topic, '7h total hours'), 'Topic total includes assessment time');
expect(str_contains($topic, 'E-moderator / tutor role'), 'Tutor role is rendered');
expect(str_contains($topic, 'Inclusive learning and accessibility'), 'Inclusive approach is rendered');
expect(str_contains($topic, 'data-ueab-builder="topic"'), 'Topic ownership marker is rendered');
expect(str_contains($topic, 'class="ueab-hero ueab-topic-hero"'), 'Topic uses the balanced Topic hero');
expect(str_contains($topic, 'class="ueab-hero-body"'), 'Topic hero content has an aligned inner container');

$xml = simplexml_load_file($root . '/db/install.xml');
expect($xml !== false, 'install.xml is well-formed XML');
if ($xml !== false) {
    expect(count($xml->TABLES->TABLE) === 3, 'All three plugin tables are installable');
}

$version = file_get_contents($root . '/version.php');
expect(str_contains($version, "release   = '1.6.0'"), 'Release is 1.6.0');
$publisher = file_get_contents($root . '/classes/local/publisher.php');
expect(str_contains($publisher, 'revision_conflict'), 'Publisher protects against stale revisions');
expect(str_contains($publisher, 'block_ueabbuilder_pages'), 'Publisher tracks builder-owned Pages');
expect(str_contains($publisher, 'add_moduleinfo'), 'Publisher uses Moodle module creation API');
$endpoint = file_get_contents($root . '/generate.php');
expect(str_contains($endpoint, 'publisher::publish'), 'Block and integrations share the canonical publisher');

echo str_repeat('-', 34) . "\n";
echo "{$passes} passed, {$failures} failed\n";
exit($failures === 0 ? 0 : 1);
