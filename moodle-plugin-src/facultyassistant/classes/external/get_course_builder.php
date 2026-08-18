<?php
// This file is part of Moodle - http://moodle.org/

namespace local_facultyassistant\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/** Returns the canonical UEAB Course Builder payload for one lecturer course. */
class get_course_builder extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle lecturer user ID'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
        ]);
    }

    public static function execute(int $userid, int $courseid): array {
        global $DB;
        $params = self::validate_parameters(self::execute_parameters(), compact('userid', 'courseid'));
        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:publishcoursebuilder', $systemcontext);
        self::require_builder();

        $lecturer = \core_user::get_user($params['userid'], '*', MUST_EXIST);
        $course = get_course($params['courseid']);
        $coursecontext = \context_course::instance($course->id);
        self::require_lecturer_permissions($coursecontext, (int)$lecturer->id);

        $savedrow = $DB->get_record('block_ueabbuilder_data', ['courseid' => $course->id]);
        $payload = [];
        if ($savedrow && $savedrow->datajson !== '') {
            $decoded = json_decode($savedrow->datajson, true);
            if (is_array($decoded)) {
                $payload = $decoded;
            }
        }
        if (!$payload) {
            $category = $course->category
                ? (string)$DB->get_field('course_categories', 'name', ['id' => $course->category])
                : '';
            $payload = [
                'title' => $course->fullname,
                'shortname' => $course->shortname,
                'dept' => $category,
                'deptname' => $category,
                'instructor' => fullname($lecturer),
                'email' => $lecturer->email,
            ];
        }
        // Moodle administrators own course identity; a saved builder revision
        // must never make a teacher's older title or short name authoritative.
        $payload['title'] = (string)$course->fullname;
        $payload['shortname'] = (string)$course->shortname;
        $payload = \block_ueabbuilder\local\schema::normalise($payload);
        $payload['revision'] = $savedrow ? (int)$savedrow->revision : 0;

        return [
            'courseid' => (int)$course->id,
            'revision' => (int)$payload['revision'],
            'source' => $savedrow ? (string)$savedrow->source : 'new',
            'contenthash' => $savedrow ? (string)$savedrow->contenthash : '',
            'payloadjson' => json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
            'revision' => new external_value(PARAM_INT, 'Current Course Builder revision'),
            'source' => new external_value(PARAM_ALPHANUMEXT, 'Last publishing source'),
            'contenthash' => new external_value(PARAM_RAW, 'Current content SHA-256 hash'),
            'payloadjson' => new external_value(PARAM_RAW, 'Canonical Course Builder payload as JSON'),
        ]);
    }

    private static function require_builder(): void {
        if (!class_exists(\block_ueabbuilder\local\schema::class)
                || !class_exists(\block_ueabbuilder\local\publisher::class)) {
            throw new \moodle_exception('coursebuildermissing', 'local_facultyassistant');
        }
    }

    private static function require_lecturer_permissions(\context_course $context, int $userid): void {
        foreach (['block/ueabbuilder:generate', 'moodle/course:update', 'moodle/course:manageactivities'] as $capability) {
            if (!has_capability($capability, $context, $userid, false)) {
                throw new \required_capability_exception($context, $capability, 'nopermissions', '');
            }
        }
    }
}
