<?php
namespace block_ueabbuilder\local;

defined('MOODLE_INTERNAL') || die();

/** Publishes the canonical module payload into builder-owned Moodle content. */
final class publisher {
    public static function publish(
        \stdClass $course,
        int $actorid,
        array $rawpayload,
        int $expectedrevision = -1,
        string $source = 'block',
    ): array {
        global $CFG, $DB;

        require_once($CFG->dirroot . '/course/lib.php');
        require_once($CFG->dirroot . '/course/modlib.php');
        require_once($CFG->dirroot . '/mod/page/lib.php');
        require_once($CFG->libdir . '/resourcelib.php');

        $payload = schema::normalise($rawpayload);
        $caneditcourseidentity = is_siteadmin($actorid);
        if (!$caneditcourseidentity) {
            $payload['title'] = (string)$course->fullname;
            $payload['shortname'] = (string)$course->shortname;
        }
        $payload['source'] = in_array($source, ['block', 'facultyassistant'], true) ? $source : 'block';
        self::validate($payload);

        $courseid = (int)$course->id;
        $existing = $DB->get_record('block_ueabbuilder_data', ['courseid' => $courseid]);
        $currentrevision = $existing ? (int)($existing->revision ?? 0) : 0;
        if ($expectedrevision >= 0 && $expectedrevision !== $currentrevision) {
            throw new publisher_exception(
                'revision_conflict',
                'This module was updated elsewhere. Reload the course before publishing your changes.',
                $currentrevision,
                409,
            );
        }

        $payload['schema_version'] = schema::VERSION;
        $payload['revision'] = $currentrevision + 1;
        $payload['saved_at'] = time();
        $payload['updated_by'] = $actorid;
        if ((float)$payload['total_learning_hours'] <= 0) {
            $payload['total_learning_hours'] = (float)$payload['class_contact_hours']
                + (float)$payload['private_study_hours'];
        }
        if ((int)$payload['units'] <= 0) {
            $payload['units'] = (int)$payload['topics'];
        }

        $contentjson = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($contentjson === false || strlen($contentjson) > schema::MAX_PAYLOAD_BYTES) {
            throw new publisher_exception('payload_too_large', 'The module content is too large to publish safely.', 0, 413);
        }
        $contenthash = hash('sha256', $contentjson);
        $transaction = $DB->start_delegated_transaction();
        try {
            self::update_course_metadata($course, $payload, $caneditcourseidentity);
            $topiccount = (int)$payload['topics'];
            if (function_exists('course_create_sections_if_missing')) {
                course_create_sections_if_missing($course, range(0, $topiccount));
            }

            $topiclinks = [];
            for ($number = 1; $number <= $topiccount; $number++) {
                $topic = $payload['topicsdata'][$number] ?? schema::normalise_topic([], $number);
                $cmid = self::publish_topic($course, $number, $payload, $topic);
                $topiclinks[$number] = (new \moodle_url('/mod/page/view.php', ['id' => $cmid]))->out(false);
            }
            self::hide_unused_topics($courseid, $topiccount);

            $displaypayload = $payload;
            $displaypayload['topiclinks'] = $topiclinks;
            $sectionzero = $DB->get_record('course_sections', ['course' => $courseid, 'section' => 0], '*', MUST_EXIST);
            $DB->update_record('course_sections', (object)[
                'id' => $sectionzero->id,
                'summary' => renderer::homepage($displaypayload),
                'summaryformat' => FORMAT_HTML,
            ]);

            $now = time();
            $record = (object)[
                'courseid' => $courseid,
                'datajson' => $contentjson,
                'schemaversion' => schema::VERSION,
                'revision' => $payload['revision'],
                'source' => $payload['source'],
                'contenthash' => $contenthash,
                'usermodified' => $actorid,
                'timecreated' => $existing ? (int)($existing->timecreated ?? $now) : $now,
                'timemodified' => $now,
            ];
            if ($existing) {
                $record->id = $existing->id;
                $DB->update_record('block_ueabbuilder_data', $record);
            } else {
                $DB->insert_record('block_ueabbuilder_data', $record);
            }
            $DB->insert_record('block_ueabbuilder_versions', (object)[
                'courseid' => $courseid,
                'revision' => $payload['revision'],
                'source' => $payload['source'],
                'contenthash' => $contenthash,
                'datajson' => $contentjson,
                'usermodified' => $actorid,
                'timecreated' => $now,
            ]);

            rebuild_course_cache($courseid, true);
            $transaction->allow_commit();
            return [
                'success' => true,
                'courseid' => $courseid,
                'revision' => (int)$payload['revision'],
                'contenthash' => $contenthash,
                'url' => (new \moodle_url('/course/view.php', ['id' => $courseid]))->out(false),
            ];
        } catch (\Throwable $error) {
            $transaction->rollback($error);
            throw $error;
        }
    }

    private static function validate(array $payload): void {
        if (trim((string)$payload['title']) === '') {
            throw new publisher_exception('module_title_required', 'Module title is required.');
        }
        $weighttext = trim((string)$payload['assessment_components']);
        if ($weighttext === '') {
            return;
        }
        $weighttotal = schema::assessment_weight_total($weighttext);
        if ($weighttotal === null) {
            throw new publisher_exception(
                'assessment_weights_invalid',
                'Assessment components must use Category | Weight % | Description.',
            );
        }
        if (abs($weighttotal - 100.0) > 0.001) {
            throw new publisher_exception(
                'assessment_weights_invalid',
                "Assessment weights total {$weighttotal}%. They must total 100%.",
            );
        }
    }

    private static function update_course_metadata(
        \stdClass $course,
        array $payload,
        bool $caneditcourseidentity,
    ): void {
        global $DB;
        if ($caneditcourseidentity) {
            if ($payload['shortname'] !== '' && $payload['shortname'] !== $course->shortname) {
                if ($DB->record_exists_select('course', 'shortname = ? AND id <> ?', [$payload['shortname'], $course->id])) {
                    throw new publisher_exception('shortname_taken', 'The requested course short name is already in use.');
                }
                $course->shortname = $payload['shortname'];
            }
            $course->fullname = $payload['title'];
        }
        $summary = trim((string)preg_replace('/\s+/', ' ', strip_tags(
            (string)($payload['module_description'] ?: $payload['aim'])
        )));
        if ($summary === '') {
            $summary = 'UEAB module prepared in the UEAB Course Builder.';
        }
        if (mb_strlen($summary) > 220) {
            $summary = mb_substr($summary, 0, 217) . '...';
        }
        $course->summary = '<p>' . htmlspecialchars($summary, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>';
        $course->summaryformat = FORMAT_HTML;
        update_course($course);
    }

    private static function publish_topic(\stdClass $course, int $number, array $module, array $topic): int {
        global $DB;
        $section = $DB->get_record('course_sections', ['course' => $course->id, 'section' => $number], '*', MUST_EXIST);
        $title = trim((string)$topic['title']) ?: "Topic {$number}";
        $DB->update_record('course_sections', (object)[
            'id' => $section->id,
            'name' => "Topic {$number}: {$title}",
            'visible' => 1,
        ]);
        $mapping = $DB->get_record('block_ueabbuilder_pages', ['courseid' => $course->id, 'sectionnum' => $number]);
        $cm = $mapping ? get_coursemodule_from_id('page', $mapping->cmid, $course->id, false, IGNORE_MISSING) : false;
        if (!$cm) {
            $cm = self::adopt_legacy_page((int)$course->id, (int)$section->id);
        }
        $name = "Topic {$number}: {$title}";
        $content = renderer::topic($number, $module, $topic);
        if ($cm) {
            $page = $DB->get_record('page', ['id' => $cm->instance], '*', MUST_EXIST);
            $page->coursemodule = $cm->id;
            $page->instance = $page->id;
            $page->name = $name;
            $page->page = ['text' => $content, 'format' => FORMAT_HTML, 'itemid' => 0];
            page_update_instance($page, null);
            set_coursemodule_visible($cm->id, 1);
            $cmid = (int)$cm->id;
        } else {
            $moduleid = $DB->get_field('modules', 'id', ['name' => 'page'], MUST_EXIST);
            $moduleinfo = (object)[
                'modulename' => 'page', 'module' => $moduleid, 'name' => $name,
                'section' => $number, 'visible' => 1, 'visibleoncoursepage' => 1,
                'groupmode' => 0, 'groupingid' => 0, 'completion' => 0,
                'completionpassgrade' => 0, 'completiongradeitemnumber' => '',
                'completionview' => 0, 'completionexpected' => 0,
                'intro' => '', 'introformat' => FORMAT_HTML,
                'content' => $content, 'contentformat' => FORMAT_HTML,
                'page' => ['text' => $content, 'format' => FORMAT_HTML, 'itemid' => 0],
                'display' => RESOURCELIB_DISPLAY_OPEN, 'printintro' => 0,
                'printlastmodified' => 0, 'popupwidth' => 620, 'popupheight' => 450,
            ];
            $created = add_moduleinfo($moduleinfo, $course);
            $cmid = (int)$created->coursemodule;
        }
        $row = (object)[
            'courseid' => $course->id,
            'sectionnum' => $number,
            'cmid' => $cmid,
            'timemodified' => time(),
        ];
        if ($mapping) {
            $row->id = $mapping->id;
            $DB->update_record('block_ueabbuilder_pages', $row);
        } else {
            $DB->insert_record('block_ueabbuilder_pages', $row);
        }
        return $cmid;
    }

    private static function adopt_legacy_page(int $courseid, int $sectionid): \stdClass|false {
        global $DB;
        $records = $DB->get_records_sql(
            "SELECT cm.id, cm.instance, cm.course, cm.module, cm.section, p.content
               FROM {course_modules} cm
               JOIN {modules} m ON m.id = cm.module AND m.name = 'page'
               JOIN {page} p ON p.id = cm.instance
              WHERE cm.course = ? AND cm.section = ? AND cm.deletioninprogress = 0
              ORDER BY cm.id",
            [$courseid, $sectionid]
        );
        foreach ($records as $record) {
            if (str_contains((string)$record->content, 'data-ueab-builder="topic"')
                    || str_contains((string)$record->content, "class='ueab-lesson'")) {
                return get_coursemodule_from_id('page', $record->id, $courseid, false, MUST_EXIST);
            }
        }
        return false;
    }

    private static function hide_unused_topics(int $courseid, int $topiccount): void {
        global $DB;
        $mappings = $DB->get_records_select(
            'block_ueabbuilder_pages',
            'courseid = ? AND sectionnum > ?',
            [$courseid, $topiccount]
        );
        foreach ($mappings as $mapping) {
            if ($DB->record_exists('course_modules', ['id' => $mapping->cmid, 'course' => $courseid])) {
                set_coursemodule_visible($mapping->cmid, 0);
            }
        }
    }
}
