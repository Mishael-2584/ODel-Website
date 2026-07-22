<?php
// This file is part of Moodle - http://moodle.org/

namespace local_facultyassistant\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Imports reviewed GIFT into one existing course question category.
 */
class import_gift_questions extends external_api {
    private const MAX_GIFT_BYTES = 1000000;

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle lecturer user ID'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
            'categoryid' => new external_value(PARAM_INT, 'Existing question category ID'),
            'gift' => new external_value(PARAM_RAW, 'UTF-8 GIFT question content'),
        ]);
    }

    public static function execute(int $userid, int $courseid, int $categoryid, string $gift): array {
        global $CFG, $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'userid' => $userid,
            'courseid' => $courseid,
            'categoryid' => $categoryid,
            'gift' => $gift,
        ]);
        if ($params['gift'] === '' || strlen($params['gift']) > self::MAX_GIFT_BYTES) {
            throw new \invalid_parameter_exception('GIFT content is empty or exceeds the 1 MB limit.');
        }
        if (!mb_check_encoding($params['gift'], 'UTF-8')) {
            throw new \invalid_parameter_exception('GIFT content must be valid UTF-8.');
        }

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:publishquestions', $systemcontext);

        $lecturer = \core_user::get_user($params['userid'], '*', MUST_EXIST);
        $course = get_course($params['courseid']);
        $coursecontext = \context_course::instance($course->id);
        if (!has_capability('moodle/question:add', $coursecontext, $lecturer->id, false)) {
            throw new \required_capability_exception(
                $coursecontext,
                'moodle/question:add',
                'nopermissions',
                ''
            );
        }
        $category = $DB->get_record('question_categories', [
            'id' => $params['categoryid'],
            'contextid' => $coursecontext->id,
        ], '*', MUST_EXIST);
        if ((int) $category->parent === 0) {
            throw new \invalid_parameter_exception('Questions cannot be imported into the top category.');
        }

        require_once($CFG->libdir . '/questionlib.php');
        require_once($CFG->dirroot . '/question/format.php');
        require_once($CFG->dirroot . '/question/format/gift/format.php');
        $filename = make_request_directory() . '/faculty-assistant-' . bin2hex(random_bytes(8)) . '.txt';
        if (file_put_contents($filename, $params['gift']) === false) {
            throw new \moodle_exception('cannotwritetempfile');
        }

        $serviceuser = $USER;
        $output = '';
        $outputlevel = ob_get_level();
        try {
            $USER = $lecturer;
            $format = new \qformat_gift();
            $format->setCategory($category);
            $format->setContexts([$coursecontext]);
            $format->setCourse($course);
            $format->setFilename($filename);
            $format->setRealfilename('faculty-assistant.txt');
            $format->setMatchgrades('error');
            $format->setCatfromfile(false);
            $format->setContextfromfile(false);
            $format->setStoponerror(true);
            $format->set_display_progress(false);

            ob_start();
            $success = $format->importpreprocess()
                && $format->importprocess()
                && $format->importpostprocess();
            $output = (string) ob_get_clean();
            if (!$success || $format->importerrors > 0) {
                throw new \invalid_parameter_exception(
                    trim(strip_tags($output)) ?: 'Moodle could not import the supplied GIFT questions.'
                );
            }

            $event = \core\event\questions_imported::create([
                'contextid' => $coursecontext->id,
                'other' => ['format' => 'gift', 'categoryid' => (int) $category->id],
            ]);
            $event->trigger();
        } finally {
            while (ob_get_level() > $outputlevel) {
                ob_end_clean();
            }
            $USER = $serviceuser;
            @unlink($filename);
        }

        return [
            'imported' => count($format->questionids),
            'questionids' => array_map('intval', $format->questionids),
            'categoryid' => (int) $category->id,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'imported' => new external_value(PARAM_INT, 'Number of questions imported'),
            'questionids' => new external_multiple_structure(
                new external_value(PARAM_INT, 'Created Moodle question ID')
            ),
            'categoryid' => new external_value(PARAM_INT, 'Target question category ID'),
        ]);
    }
}
