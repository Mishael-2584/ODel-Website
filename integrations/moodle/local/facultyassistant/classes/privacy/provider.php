<?php
// This file is part of Moodle - http://moodle.org/

namespace local_facultyassistant\privacy;

defined('MOODLE_INTERNAL') || die();

/**
 * The connector stores no data inside Moodle.
 */
class provider implements \core_privacy\local\metadata\null_provider {
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
}
