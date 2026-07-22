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
 * Read-only course discovery for the Faculty Assistant server connector.
 */
class get_teaching_courses extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle user ID'),
        ]);
    }

    public static function execute(int $userid): array {
        $params = self::validate_parameters(self::execute_parameters(), ['userid' => $userid]);
        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:useservice', $systemcontext);

        \core_user::get_user($params['userid'], '*', MUST_EXIST);
        $fields = ['id', 'shortname', 'fullname', 'idnumber', 'category', 'visible', 'startdate', 'enddate'];
        $enrolledcourses = enrol_get_users_courses($params['userid'], true, $fields, 'sortorder ASC');
        $result = [];
        $customfieldhandler = \core_course\customfield\course_handler::create();

        foreach ($enrolledcourses as $course) {
            $coursecontext = \context_course::instance($course->id);
            $canmanageactivities = has_capability(
                'moodle/course:manageactivities',
                $coursecontext,
                $params['userid'],
                false
            );
            $canupdate = has_capability('moodle/course:update', $coursecontext, $params['userid'], false);
            if (!$canmanageactivities && !$canupdate) {
                continue;
            }

            $customfields = [];
            foreach ($customfieldhandler->get_instance_data($course->id, true) as $data) {
                $field = $data->get_field();
                $value = $data->export_value();
                $customfields[] = [
                    'shortname' => (string) $field->get('shortname'),
                    'name' => format_string((string) $field->get('name'), true, ['context' => $coursecontext]),
                    'value' => is_scalar($value) || $value === null
                        ? (string) ($value ?? '')
                        : json_encode($value),
                ];
            }

            $result[] = [
                'id' => (int) $course->id,
                'shortname' => format_string($course->shortname, true, ['context' => $coursecontext]),
                'fullname' => format_string($course->fullname, true, ['context' => $coursecontext]),
                'idnumber' => (string) $course->idnumber,
                'categoryid' => (int) $course->category,
                'visible' => (bool) $course->visible,
                'startdate' => (int) $course->startdate,
                'enddate' => (int) $course->enddate,
                'canmanageactivities' => $canmanageactivities,
                'canviewgrades' => has_capability(
                    'moodle/grade:viewall',
                    $coursecontext,
                    $params['userid'],
                    false
                ),
                'customfieldsjson' => json_encode($customfields),
            ];
        }

        return $result;
    }

    public static function execute_returns(): external_multiple_structure {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Course ID'),
                'shortname' => new external_value(PARAM_TEXT, 'Course short name'),
                'fullname' => new external_value(PARAM_TEXT, 'Course full name'),
                'idnumber' => new external_value(PARAM_RAW, 'Institution course ID'),
                'categoryid' => new external_value(PARAM_INT, 'Category ID'),
                'visible' => new external_value(PARAM_BOOL, 'Course visibility'),
                'startdate' => new external_value(PARAM_INT, 'Start timestamp'),
                'enddate' => new external_value(PARAM_INT, 'End timestamp'),
                'canmanageactivities' => new external_value(PARAM_BOOL, 'Can manage activities'),
                'canviewgrades' => new external_value(PARAM_BOOL, 'Can view all grades'),
                'customfieldsjson' => new external_value(PARAM_RAW, 'Course custom fields as JSON'),
            ])
        );
    }
}
