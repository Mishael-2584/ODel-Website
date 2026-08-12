<?php
// This file is part of Moodle - http://moodle.org/

namespace local_facultyassistant\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/** Publishes a reviewed Faculty Assistant module through the UEAB Course Builder. */
class publish_course_builder extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle lecturer user ID'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
            'expectedrevision' => new external_value(PARAM_INT, 'Revision loaded before editing'),
            'payloadjson' => new external_value(PARAM_RAW, 'Canonical Course Builder payload as JSON'),
        ]);
    }

    public static function execute(int $userid, int $courseid, int $expectedrevision, string $payloadjson): array {
        $params = self::validate_parameters(self::execute_parameters(), compact(
            'userid', 'courseid', 'expectedrevision', 'payloadjson'
        ));
        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:publishcoursebuilder', $systemcontext);
        if (!class_exists(\block_ueabbuilder\local\publisher::class)) {
            throw new \moodle_exception('coursebuildermissing', 'local_facultyassistant');
        }
        if (strlen($params['payloadjson']) > \block_ueabbuilder\local\schema::MAX_PAYLOAD_BYTES) {
            throw new \moodle_exception('coursebuilderpayloadlarge', 'local_facultyassistant');
        }
        $payload = json_decode($params['payloadjson'], true);
        if (!is_array($payload)) {
            throw new \invalid_parameter_exception('Course Builder payload must be valid JSON.');
        }

        $lecturer = \core_user::get_user($params['userid'], '*', MUST_EXIST);
        $course = get_course($params['courseid']);
        $coursecontext = \context_course::instance($course->id);
        foreach (['block/ueabbuilder:generate', 'moodle/course:update', 'moodle/course:manageactivities'] as $capability) {
            if (!has_capability($capability, $coursecontext, $lecturer->id, false)) {
                throw new \required_capability_exception($coursecontext, $capability, 'nopermissions', '');
            }
        }

        try {
            $result = \block_ueabbuilder\local\publisher::publish(
                $course,
                (int)$lecturer->id,
                $payload,
                $params['expectedrevision'],
                'facultyassistant',
            );
            return array_merge($result, ['code' => '', 'message' => 'Course Builder published successfully.']);
        } catch (\block_ueabbuilder\local\publisher_exception $error) {
            return [
                'success' => false,
                'courseid' => (int)$course->id,
                'revision' => $error->revision,
                'contenthash' => '',
                'url' => '',
                'code' => $error->errorcode,
                'message' => $error->getMessage(),
            ];
        }
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Whether publishing succeeded'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
            'revision' => new external_value(PARAM_INT, 'Resulting or current revision'),
            'contenthash' => new external_value(PARAM_RAW, 'Published content SHA-256 hash'),
            'url' => new external_value(PARAM_RAW, 'Moodle course URL', VALUE_DEFAULT, ''),
            'code' => new external_value(PARAM_ALPHANUMEXT, 'Machine-readable failure code', VALUE_DEFAULT, ''),
            'message' => new external_value(PARAM_TEXT, 'Human-readable result'),
        ]);
    }
}
