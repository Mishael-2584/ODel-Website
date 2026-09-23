<?php
defined('MOODLE_INTERNAL') || die();

/** Serves Course Builder media only to users who can access the owning course. */
function block_ueabbuilder_pluginfile(
    stdClass $course,
    ?stdClass $cm,
    context $context,
    string $filearea,
    array $args,
    bool $forcedownload,
    array $options = [],
): bool {
    if ($context->contextlevel !== CONTEXT_COURSE || $filearea !== 'media' || count($args) < 2) {
        return false;
    }
    require_login($course);
    if (!has_capability('moodle/course:view', $context)) {
        return false;
    }
    $itemid = (int)array_shift($args);
    $filename = array_pop($args);
    $filepath = '/' . ($args ? implode('/', $args) . '/' : '');
    $file = get_file_storage()->get_file(
        $context->id,
        'block_ueabbuilder',
        $filearea,
        $itemid,
        $filepath,
        $filename,
    );
    if (!$file || $file->is_directory()) {
        return false;
    }
    send_stored_file($file, 0, 0, false, ['forcedownload' => false]);
    return true;
}
