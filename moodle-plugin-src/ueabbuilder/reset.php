<?php
/** Clears editable form content while retaining an auditable revision chain. */
define('AJAX_SCRIPT', true);

$cfgpath = __DIR__;
for ($i = 0; $i < 6; $i++) {
    $cfgpath = dirname($cfgpath);
    if (file_exists($cfgpath . '/config.php')) {
        require_once($cfgpath . '/config.php');
        break;
    }
}

header('Content-Type: application/json');
if (!defined('MOODLE_INTERNAL')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Moodle config.php was not found.']);
    exit;
}

$courseid = required_param('courseid', PARAM_INT);
if ($courseid <= 1) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid Moodle course identifier.']);
    exit;
}

try {
    $course = get_course($courseid);
    require_login($course, false);
} catch (Throwable $error) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'You must be able to access this course.']);
    exit;
}

if (!confirm_sesskey()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Session expired. Refresh and try again.']);
    exit;
}

$context = context_course::instance($courseid);
if (!has_capability('block/ueabbuilder:generate', $context)
        || !has_capability('moodle/course:update', $context)
        || !has_capability('moodle/course:manageactivities', $context)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Permission denied.']);
    exit;
}

global $DB, $USER;
$transaction = null;
try {
    $existing = $DB->get_record('block_ueabbuilder_data', ['courseid' => $courseid]);
    $revision = ($existing ? (int)$existing->revision : 0) + 1;
    $payload = [
        'schema_version' => \block_ueabbuilder\local\schema::VERSION,
        'revision' => $revision,
        'source' => 'reset',
        'reset' => true,
        'title' => $course->fullname,
        'shortname' => $course->shortname,
        'saved_at' => time(),
        'updated_by' => (int)$USER->id,
    ];
    $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $hash = hash('sha256', $json);
    $now = time();
    $transaction = $DB->start_delegated_transaction();
    $record = (object)[
        'courseid' => $courseid, 'datajson' => $json,
        'schemaversion' => \block_ueabbuilder\local\schema::VERSION,
        'revision' => $revision, 'source' => 'reset', 'contenthash' => $hash,
        'usermodified' => (int)$USER->id,
        'timecreated' => $existing ? (int)$existing->timecreated : $now,
        'timemodified' => $now,
    ];
    if ($existing) {
        $record->id = $existing->id;
        $DB->update_record('block_ueabbuilder_data', $record);
    } else {
        $DB->insert_record('block_ueabbuilder_data', $record);
    }
    $DB->insert_record('block_ueabbuilder_versions', (object)[
        'courseid' => $courseid, 'revision' => $revision, 'source' => 'reset',
        'contenthash' => $hash, 'datajson' => $json,
        'usermodified' => (int)$USER->id, 'timecreated' => $now,
    ]);
    $transaction->allow_commit();
    echo json_encode(['success' => true, 'revision' => $revision]);
} catch (Throwable $error) {
    if ($transaction) {
        try {
            $transaction->rollback($error);
        } catch (Throwable $rollbackerror) {
            $error = $rollbackerror;
        }
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $error->getMessage()]);
}
