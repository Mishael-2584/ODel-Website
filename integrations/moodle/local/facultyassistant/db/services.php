<?php
// This file is part of Moodle - http://moodle.org/

defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_facultyassistant_get_teaching_courses' => [
        'classname' => 'local_facultyassistant\external\get_teaching_courses',
        'description' => 'Returns courses a specific user can teach or manage.',
        'type' => 'read',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:useservice',
    ],
];

$services = [
    'Faculty Assistant Connector' => [
        'functions' => ['local_facultyassistant_get_teaching_courses'],
        'restrictedusers' => 1,
        'enabled' => 0,
        'shortname' => 'faculty_assistant_connector',
        'downloadfiles' => 0,
        'uploadfiles' => 0,
    ],
];
