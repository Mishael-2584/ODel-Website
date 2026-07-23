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
 * Imports reviewed GIFT or Moodle XML into one existing course question category.
 */
class import_questions extends external_api {
    private const MAX_CONTENT_BYTES = 2000000;
    private const SUPPORTED_FORMATS = ['gift', 'xml'];

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle lecturer user ID'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
            'categoryid' => new external_value(PARAM_INT, 'Existing question category ID'),
            'format' => new external_value(PARAM_ALPHA, 'Question format: gift or xml'),
            'content' => new external_value(PARAM_RAW, 'UTF-8 question content'),
        ]);
    }

    public static function execute(
        int $userid,
        int $courseid,
        int $categoryid,
        string $format,
        string $content
    ): array {
        global $CFG, $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'userid' => $userid,
            'courseid' => $courseid,
            'categoryid' => $categoryid,
            'format' => $format,
            'content' => $content,
        ]);
        $questionformat = strtolower($params['format']);
        if (!in_array($questionformat, self::SUPPORTED_FORMATS, true)) {
            throw new \invalid_parameter_exception('Question format must be gift or xml.');
        }
        if ($params['content'] === '' || strlen($params['content']) > self::MAX_CONTENT_BYTES) {
            throw new \invalid_parameter_exception('Question content is empty or exceeds the 2 MB limit.');
        }
        if (!mb_check_encoding($params['content'], 'UTF-8')) {
            throw new \invalid_parameter_exception('Question content must be valid UTF-8.');
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
        require_once($CFG->dirroot . '/question/format/' . $questionformat . '/format.php');

        $extension = $questionformat === 'xml' ? 'xml' : 'txt';
        $filename = make_request_directory() . '/faculty-assistant-' . bin2hex(random_bytes(8)) . '.' . $extension;
        if (file_put_contents($filename, $params['content']) === false) {
            throw new \moodle_exception('cannotwritetempfile');
        }

        $serviceuser = $USER;
        $output = '';
        $outputlevel = ob_get_level();
        try {
            $USER = $lecturer;
            $formatclass = '\\qformat_' . $questionformat;
            $importer = new $formatclass();
            $importer->setCategory($category);
            $importer->setContexts([$coursecontext]);
            $importer->setCourse($course);
            $importer->setFilename($filename);
            $importer->setRealfilename('faculty-assistant.' . $extension);
            $importer->setMatchgrades('error');
            $importer->setCatfromfile(false);
            $importer->setContextfromfile(false);
            $importer->setStoponerror(true);
            $importer->set_display_progress(false);

            ob_start();
            $success = $importer->importpreprocess()
                && $importer->importprocess()
                && $importer->importpostprocess();
            $output = (string) ob_get_clean();
            if (!$success || $importer->importerrors > 0) {
                throw new \invalid_parameter_exception(
                    trim(strip_tags($output))
                        ?: 'Moodle could not import the supplied ' . strtoupper($questionformat) . ' questions.'
                );
            }

            $event = \core\event\questions_imported::create([
                'contextid' => $coursecontext->id,
                'other' => ['format' => $questionformat, 'categoryid' => (int) $category->id],
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
            'imported' => count($importer->questionids),
            'questionids' => array_map('intval', $importer->questionids),
            'categoryid' => (int) $category->id,
            'format' => $questionformat,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'imported' => new external_value(PARAM_INT, 'Number of questions imported'),
            'questionids' => new external_multiple_structure(
                new external_value(PARAM_INT, 'Created Moodle question ID')
            ),
            'categoryid' => new external_value(PARAM_INT, 'Target question category ID'),
            'format' => new external_value(PARAM_ALPHA, 'Imported question format'),
        ]);
    }
}
