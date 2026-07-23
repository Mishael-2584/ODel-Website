<?php
// This file is part of Moodle - http://moodle.org/

namespace local_facultyassistant\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Resolves one active Moodle user for an administrator-approved licence grant.
 */
class get_user_by_email extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'email' => new external_value(PARAM_EMAIL, 'Exact Moodle account email address'),
        ]);
    }

    public static function execute(string $email): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'email' => $email,
        ]);
        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:useservice', $systemcontext);

        $users = $DB->get_records_sql(
            'SELECT id, username, firstname, lastname, email, suspended
               FROM {user}
              WHERE ' . $DB->sql_equal('email', ':email', false) . '
                AND deleted = 0',
            ['email' => trim($params['email'])],
            0,
            2
        );
        if (count($users) !== 1) {
            throw new \invalid_parameter_exception(
                count($users) === 0
                    ? 'No Moodle user matches that email address.'
                    : 'More than one Moodle user matches that email address.'
            );
        }

        $user = reset($users);
        if ((int) $user->suspended === 1) {
            throw new \invalid_parameter_exception('The Moodle user account is suspended.');
        }

        return [
            'id' => (int) $user->id,
            'email' => (string) $user->email,
            'username' => (string) $user->username,
            'fullname' => fullname($user),
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Moodle user ID'),
            'email' => new external_value(PARAM_EMAIL, 'Moodle email address'),
            'username' => new external_value(PARAM_RAW_TRIMMED, 'Moodle username'),
            'fullname' => new external_value(PARAM_TEXT, 'Moodle full name'),
        ]);
    }
}
