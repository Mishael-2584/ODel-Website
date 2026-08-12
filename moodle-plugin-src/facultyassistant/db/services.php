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
    'local_facultyassistant_get_user_by_email' => [
        'classname' => 'local_facultyassistant\external\get_user_by_email',
        'description' => 'Resolves one active Moodle user for an administrator-approved licence grant.',
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
    'local_facultyassistant_get_course_grades' => [
        'classname' => 'local_facultyassistant\external\get_course_grades',
        'description' => 'Returns gradebook rows for a course the requested lecturer can grade.',
        'type' => 'read',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:useservice',
    ],
    'local_facultyassistant_create_question_category' => [
        'classname' => 'local_facultyassistant\external\create_question_category',
        'description' => 'Creates or reuses a lecturer question-bank category in one course.',
        'type' => 'write',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:publishquestions',
    ],
    'local_facultyassistant_import_gift_questions' => [
        'classname' => 'local_facultyassistant\external\import_gift_questions',
        'description' => 'Imports reviewed GIFT questions into an existing lecturer course category.',
        'type' => 'write',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:publishquestions',
    ],
    'local_facultyassistant_import_questions' => [
        'classname' => 'local_facultyassistant\external\import_questions',
        'description' => 'Imports reviewed GIFT or Moodle XML questions into an existing lecturer course category.',
        'type' => 'write',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:publishquestions',
    ],
    'local_facultyassistant_get_course_builder' => [
        'classname' => 'local_facultyassistant\external\get_course_builder',
        'description' => 'Returns a revisioned UEAB Course Builder payload for a lecturer course.',
        'type' => 'read',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:publishcoursebuilder',
    ],
    'local_facultyassistant_publish_course_builder' => [
        'classname' => 'local_facultyassistant\external\publish_course_builder',
        'description' => 'Publishes a reviewed UEAB Course Builder payload for a lecturer course.',
        'type' => 'write',
        'ajax' => false,
        'capabilities' => 'local/facultyassistant:publishcoursebuilder',
    ],
];

$services = [
    'Faculty Assistant Connector' => [
        'functions' => [
            'local_facultyassistant_get_teaching_courses',
            'local_facultyassistant_get_user_by_email',
            'local_facultyassistant_get_course_grades',
            'local_facultyassistant_get_question_categories',
            'local_facultyassistant_create_question_category',
            'local_facultyassistant_import_gift_questions',
            'local_facultyassistant_import_questions',
            'local_facultyassistant_get_course_builder',
            'local_facultyassistant_publish_course_builder',
        ],
        'restrictedusers' => 1,
        'enabled' => 0,
        'shortname' => 'faculty_assistant_connector',
        'downloadfiles' => 0,
        'uploadfiles' => 0,
    ],
];
