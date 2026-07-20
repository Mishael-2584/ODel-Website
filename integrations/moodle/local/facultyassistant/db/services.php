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
    'local_facultyassistant_get_question_categories' => [
        'classname' => 'local_facultyassistant\external\get_question_categories',
        'description' => 'Returns writable question-bank categories for a lecturer course.',
        'type' => 'read',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:useservice',
    ],
    'local_facultyassistant_import_gift_questions' => [
        'classname' => 'local_facultyassistant\external\import_gift_questions',
        'description' => 'Imports reviewed GIFT questions into an existing lecturer course category.',
        'type' => 'write',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:publishquestions',
    ],
];

$services = [
    'Faculty Assistant Connector' => [
        'functions' => [
            'local_facultyassistant_get_teaching_courses',
            'local_facultyassistant_get_question_categories',
            'local_facultyassistant_import_gift_questions',
        ],
        'restrictedusers' => 1,
        'enabled' => 0,
        'shortname' => 'faculty_assistant_connector',
        'downloadfiles' => 0,
        'uploadfiles' => 0,
    ],
];
