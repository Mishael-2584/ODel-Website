<?php
/** Publishes a versioned UEAB module into an existing Moodle course. */
define('AJAX_SCRIPT', true);

$cfgpath = __DIR__;
for ($i = 0; $i < 6; $i++) {
    $cfgpath = dirname($cfgpath);
    if (file_exists($cfgpath . '/config.php')) {
        require_once($cfgpath . '/config.php');
        break;
    }
}

if (!defined('MOODLE_INTERNAL')) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Moodle config.php was not found.']);
    exit;
}

use block_ueabbuilder\local\publisher;
use block_ueabbuilder\local\publisher_exception;
use block_ueabbuilder\local\schema;

function ueabbuilder_response(array $payload, int $status = 200): void {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$courseid = optional_param('courseid', 0, PARAM_INT);
if ($courseid <= 1) {
    ueabbuilder_response(['success' => false, 'error' => 'Invalid Moodle course identifier.'], 400);
}

try {
    $course = get_course($courseid);
    require_login($course, false);
} catch (Throwable $error) {
    ueabbuilder_response(['success' => false, 'error' => 'You must be able to access this course.'], 401);
}

if (!confirm_sesskey()) {
    ueabbuilder_response(['success' => false, 'error' => 'Session expired. Refresh the course and try again.'], 403);
}

$context = context_course::instance($courseid);
if (!has_capability('block/ueabbuilder:generate', $context)
        || !has_capability('moodle/course:update', $context)
        || !has_capability('moodle/course:manageactivities', $context)) {
    ueabbuilder_response(['success' => false, 'error' => 'You do not have permission to publish this course.'], 403);
}

$numericfields = [
    'credits', 'class_contact_hours', 'private_study_hours', 'weeks',
    'total_learning_hours', 'units',
];
$emailfields = ['dept_contact_email', 'original_author_email', 'lead_author_email', 'email'];
$plainfields = [
    'title', 'shortname', 'dept', 'university', 'school', 'deptname', 'dept_contact',
    'original_author_name', 'lead_author_name', 'level', 'instructor', 'mode', 'qa_certificate',
];

$input = [];
foreach (schema::module_fields() as $field) {
    if (in_array($field, $numericfields, true)) {
        $input[$field] = optional_param($field, 0, PARAM_FLOAT);
    } else if (in_array($field, $emailfields, true)) {
        $input[$field] = trim(optional_param($field, '', PARAM_EMAIL));
    } else if (in_array($field, $plainfields, true)) {
        $input[$field] = trim(optional_param($field, '', PARAM_TEXT));
    } else {
        $input[$field] = trim(optional_param($field, '', PARAM_RAW_TRIMMED));
    }
}

$topiccount = max(1, min(
    schema::MAX_TOPICS,
    optional_param('topics', optional_param('lessons', 9, PARAM_INT), PARAM_INT),
));
$topicsjson = optional_param(
    'topicsjson',
    optional_param('lessonsjson', '[]', PARAM_RAW_TRIMMED),
    PARAM_RAW_TRIMMED,
);
$decodedtopics = json_decode($topicsjson, true);
if (!is_array($decodedtopics)) {
    ueabbuilder_response(['success' => false, 'error' => 'Topic data is not valid JSON.'], 400);
}

$topics = [];
foreach ($decodedtopics as $index => $rawtopic) {
    if (!is_array($rawtopic)) {
        continue;
    }
    $number = (int)($rawtopic['num'] ?? ($index + 1));
    if ($number < 1 || $number > $topiccount) {
        continue;
    }
    $sanitised = [];
    foreach (schema::topic_fields() as $field) {
        if (in_array($field, ['pretopic_hours', 'f2f_hours', 'online_hours', 'assessment_hours'], true)) {
            $sanitised[$field] = max(0, (float)($rawtopic[$field] ?? 0));
        } else if ($field === 'title') {
            $sanitised[$field] = clean_param(trim((string)($rawtopic[$field] ?? '')), PARAM_TEXT);
        } else {
            $sanitised[$field] = trim((string)($rawtopic[$field] ?? ''));
        }
    }
    $topics[$number] = schema::normalise_topic($sanitised, $number);
}

$input['topics'] = $topiccount;
$input['lessons'] = $topiccount;
$input['topicsdata'] = $topics;

global $USER;
try {
    $result = publisher::publish(
        $course,
        (int)$USER->id,
        $input,
        optional_param('expectedrevision', -1, PARAM_INT),
        'block',
    );
    ueabbuilder_response($result);
} catch (publisher_exception $error) {
    ueabbuilder_response([
        'success' => false,
        'error' => $error->getMessage(),
        'code' => $error->errorcode,
        'revision' => $error->revision,
    ], max(400, min(599, $error->getCode())));
} catch (Throwable $error) {
    ueabbuilder_response(['success' => false, 'error' => $error->getMessage()], 500);
}
