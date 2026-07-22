<?php
// This file is part of Moodle - http://moodle.org/

namespace local_facultyassistant\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Creates or reuses a lecturer-owned category in one course question bank.
 */
class create_question_category extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle lecturer user ID'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
            'name' => new external_value(PARAM_TEXT, 'Question category name'),
        ]);
    }

    public static function execute(int $userid, int $courseid, string $name): array {
        global $CFG, $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'userid' => $userid,
            'courseid' => $courseid,
            'name' => $name,
        ]);
        $name = trim($params['name']);
        if ($name === '' || \core_text::strlen($name) > 120) {
            throw new \invalid_parameter_exception('Category name must contain 1 to 120 characters.');
        }

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:publishquestions', $systemcontext);

        $lecturer = \core_user::get_user($params['userid'], '*', MUST_EXIST);
        $course = get_course($params['courseid']);
        $coursecontext = \context_course::instance($course->id);
        foreach (['moodle/question:add', 'moodle/question:managecategory'] as $capability) {
            if (!has_capability($capability, $coursecontext, $lecturer->id, false)) {
                throw new \required_capability_exception($coursecontext, $capability, 'nopermissions', '');
            }
        }

        require_once($CFG->libdir . '/questionlib.php');
        $serviceuser = $USER;
        try {
            $USER = $lecturer;
            question_make_default_categories([$coursecontext]);
        } finally {
            $USER = $serviceuser;
        }

        $topcategory = $DB->get_record('question_categories', [
            'contextid' => $coursecontext->id,
            'parent' => 0,
        ], '*', MUST_EXIST);
        $categories = $DB->get_records('question_categories', [
            'contextid' => $coursecontext->id,
            'parent' => $topcategory->id,
        ]);
        foreach ($categories as $category) {
            if (\core_text::strtolower(trim($category->name)) === \core_text::strtolower($name)) {
                return self::category_result($category, false);
            }
        }

        $category = (object) [
            'parent' => $topcategory->id,
            'contextid' => $coursecontext->id,
            'name' => $name,
            'info' => 'Created by Faculty Assistant for ' . format_string($course->shortname),
            'infoformat' => FORMAT_PLAIN,
            'sortorder' => 999,
            'stamp' => make_unique_id_code(),
            'idnumber' => null,
        ];
        $category->id = $DB->insert_record('question_categories', $category);
        $event = \core\event\question_category_created::create_from_question_category_instance($category);
        $event->trigger();

        return self::category_result($category, true);
    }

    private static function category_result(object $category, bool $created): array {
        return [
            'id' => (int) $category->id,
            'name' => format_string($category->name),
            'questioncount' => 0,
            'created' => $created,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Question category ID'),
            'name' => new external_value(PARAM_TEXT, 'Question category name'),
            'questioncount' => new external_value(PARAM_INT, 'Number of question-bank entries'),
            'created' => new external_value(PARAM_BOOL, 'Whether a new category was created'),
        ]);
    }
}
