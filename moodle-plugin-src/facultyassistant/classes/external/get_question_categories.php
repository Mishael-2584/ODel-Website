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
 * Lists course question categories the target lecturer can write to.
 */
class get_question_categories extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle lecturer user ID'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
        ]);
    }

    public static function execute(int $userid, int $courseid): array {
        global $CFG, $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'userid' => $userid,
            'courseid' => $courseid,
        ]);
        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:useservice', $systemcontext);

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

        require_once($CFG->libdir . '/questionlib.php');
        $serviceuser = $USER;
        try {
            $USER = $lecturer;
            question_make_default_categories([$coursecontext]);
        } finally {
            $USER = $serviceuser;
        }

        $sql = "SELECT qc.id, qc.name, COUNT(qbe.id) AS questioncount
                  FROM {question_categories} qc
             LEFT JOIN {question_bank_entries} qbe ON qbe.questioncategoryid = qc.id
                 WHERE qc.contextid = :contextid
                   AND qc.parent <> 0
              GROUP BY qc.id, qc.name, qc.sortorder
              ORDER BY qc.sortorder ASC, qc.name ASC";
        $categories = $DB->get_records_sql($sql, ['contextid' => $coursecontext->id]);

        return array_values(array_map(static function($category): array {
            return [
                'id' => (int) $category->id,
                'name' => format_string($category->name),
                'questioncount' => (int) $category->questioncount,
            ];
        }, $categories));
    }

    public static function execute_returns(): external_multiple_structure {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Question category ID'),
                'name' => new external_value(PARAM_TEXT, 'Question category name'),
                'questioncount' => new external_value(PARAM_INT, 'Number of question-bank entries'),
            ])
        );
    }
}
