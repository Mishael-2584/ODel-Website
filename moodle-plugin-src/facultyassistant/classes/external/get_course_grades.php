<?php
// This file is part of Moodle - http://moodle.org/

namespace local_facultyassistant\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Read-only gradebook rows for a course the requested lecturer can grade.
 */
class get_course_grades extends external_api {
    private const MAX_GRADE_ITEMS = 500;
    private const MAX_STUDENTS = 5000;

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'Moodle lecturer user ID'),
            'courseid' => new external_value(PARAM_INT, 'Moodle course ID'),
        ]);
    }

    public static function execute(int $userid, int $courseid): array {
        global $CFG, $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'userid' => $userid,
            'courseid' => $courseid,
        ]);
        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/facultyassistant:useservice', $systemcontext);

        $lecturer = \core_user::get_user($params['userid'], '*', MUST_EXIST);
        \core_user::require_active_user($lecturer);
        $course = get_course($params['courseid']);
        $coursecontext = \context_course::instance($course->id);
        if (!has_capability('moodle/grade:viewall', $coursecontext, $lecturer->id, false)) {
            throw new \required_capability_exception(
                $coursecontext,
                'moodle/grade:viewall',
                'nopermissions',
                ''
            );
        }

        require_once($CFG->dirroot . '/grade/lib.php');
        require_once($CFG->libdir . '/gradelib.php');
        require_once($CFG->libdir . '/grouplib.php');

        grade_regrade_final_grades($course->id);
        $gradeitems = \grade_item::fetch_all(['courseid' => $course->id]) ?: [];
        $gradeitems = array_filter($gradeitems, static function(\grade_item $item): bool {
            return (int) $item->gradetype === GRADE_TYPE_VALUE;
        });
        uasort($gradeitems, static function(\grade_item $left, \grade_item $right): int {
            return ((int) $left->sortorder) <=> ((int) $right->sortorder);
        });
        if (count($gradeitems) > self::MAX_GRADE_ITEMS) {
            throw new \moodle_exception('toomanygradeitems', 'error');
        }

        $alloweduserids = self::allowed_group_user_ids($course, $coursecontext, $lecturer->id);
        $onlyactive = !empty($CFG->grade_report_showonlyactiveenrol) ||
            !has_capability('moodle/course:viewsuspendedusers', $coursecontext, $lecturer->id, false);
        $iterator = new \graded_users_iterator($course, $gradeitems);
        $iterator->require_active_enrolment($onlyactive);
        if (!$iterator->init()) {
            throw new \moodle_exception('cannotcalculatedgrades', 'error');
        }

        $students = [];
        try {
            while ($userdata = $iterator->next_user()) {
                $user = $userdata->user;
                if ($alloweduserids !== null && !isset($alloweduserids[(int) $user->id])) {
                    continue;
                }
                if (count($students) >= self::MAX_STUDENTS) {
                    throw new \moodle_exception('toomanyusers', 'error');
                }

                $grades = [];
                foreach ($gradeitems as $itemid => $gradeitem) {
                    $grade = $userdata->grades[$itemid] ?? null;
                    $grades[] = [
                        'itemid' => (int) $itemid,
                        'finalgrade' => $grade && $grade->finalgrade !== null && !$grade->is_excluded()
                            ? (float) $grade->finalgrade
                            : null,
                        'excluded' => $grade ? $grade->is_excluded() : false,
                        'overridden' => $grade ? $grade->is_overridden() : false,
                    ];
                }

                $students[] = [
                    'moodleuserid' => (int) $user->id,
                    'idnumber' => trim((string) $user->idnumber),
                    'firstname' => (string) $user->firstname,
                    'lastname' => (string) $user->lastname,
                    'fullname' => fullname($user),
                    'email' => (string) $user->email,
                    'grades' => $grades,
                ];
            }
        } finally {
            $iterator->close();
        }

        $items = [];
        foreach ($gradeitems as $gradeitem) {
            $items[] = [
                'id' => (int) $gradeitem->id,
                'name' => format_string(
                    $gradeitem->get_name(false, false),
                    true,
                    ['context' => $coursecontext]
                ),
                'itemtype' => (string) $gradeitem->itemtype,
                'itemmodule' => (string) ($gradeitem->itemmodule ?? ''),
                'minimum' => (float) $gradeitem->grademin,
                'maximum' => (float) $gradeitem->grademax,
                'hidden' => (bool) $gradeitem->is_hidden(),
            ];
        }

        $payload = [
            'courseid' => (int) $course->id,
            'syncedat' => time(),
            'items' => $items,
            'students' => $students,
        ];
        return [
            'payloadjson' => json_encode(
                $payload,
                JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
            ),
        ];
    }

    /**
     * Returns null for unrestricted access, or a user-ID lookup for separate groups.
     */
    private static function allowed_group_user_ids(
        \stdClass $course,
        \context_course $context,
        int $lecturerid
    ): ?array {
        global $DB;

        if (
            groups_get_course_groupmode($course) !== SEPARATEGROUPS ||
            has_capability('moodle/site:accessallgroups', $context, $lecturerid, false)
        ) {
            return null;
        }
        $groups = groups_get_all_groups($course->id, $lecturerid, 0, 'g.id');
        if (!$groups) {
            return [];
        }
        [$groupsql, $params] = $DB->get_in_or_equal(
            array_map('intval', array_keys($groups)),
            SQL_PARAMS_NAMED,
            'facultyassistantgroup'
        );
        $userids = $DB->get_fieldset_sql(
            "SELECT DISTINCT userid FROM {groups_members} WHERE groupid {$groupsql}",
            $params
        );
        return array_fill_keys(array_map('intval', $userids), true);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'payloadjson' => new external_value(PARAM_RAW, 'Course gradebook payload as JSON'),
        ]);
    }
}
