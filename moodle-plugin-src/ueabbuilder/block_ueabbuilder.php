<?php
defined('MOODLE_INTERNAL') || die();

class block_ueabbuilder extends block_base {
    public function init(): void {
        $this->title = get_string('blocktitle', 'block_ueabbuilder');
    }

    public function applicable_formats(): array {
        return ['site' => false, 'course' => true, 'my' => false];
    }

    public function has_config(): bool {
        return false;
    }

    public function get_content(): stdClass {
        global $COURSE, $DB;

        if ($this->content !== null) {
            return $this->content;
        }

        $this->content = (object)['text' => '', 'footer' => ''];
        if ((int)$COURSE->id <= 1) {
            $this->content->text = '<p class="text-muted">Add this block inside a course to use the UEAB Course Builder.</p>';
            return $this->content;
        }

        $context = context_course::instance($COURSE->id);
        if (!has_capability('block/ueabbuilder:generate', $context)
                || !has_capability('moodle/course:update', $context)
                || !has_capability('moodle/course:manageactivities', $context)) {
            $this->content->text = '<p class="text-muted">Course Builder is available to editing teachers and administrators for courses they can manage.</p>';
            return $this->content;
        }

        $saved = [];
        $savedrow = $DB->get_record('block_ueabbuilder_data', ['courseid' => $COURSE->id]);
        if ($savedrow && !empty($savedrow->datajson)) {
            $decoded = json_decode($savedrow->datajson, true);
            if (is_array($decoded)) {
                $saved = $decoded;
                $saved['revision'] = property_exists($savedrow, 'revision') ? (int)$savedrow->revision : (int)($saved['revision'] ?? 0);
            }
        }

        $category = '';
        if (!empty($COURSE->category)) {
            $category = (string)$DB->get_field('course_categories', 'name', ['id' => $COURSE->category]);
        }

        [$instructor, $email] = $this->course_teachers($context->id);
        $this->content->text = \block_ueabbuilder\local\form_renderer::render([
            'saved' => $saved,
            'course_id' => (int)$COURSE->id,
            'course_title' => $COURSE->fullname,
            'course_shortname' => $COURSE->shortname,
            'can_edit_course_identity' => is_siteadmin(),
            'course_category' => $category,
            'instructor' => $instructor,
            'email' => $email,
            'generate_url' => (new moodle_url('/blocks/ueabbuilder/generate.php'))->out(false),
            'reset_url' => (new moodle_url('/blocks/ueabbuilder/reset.php'))->out(false),
            'sesskey' => sesskey(),
        ]);
        return $this->content;
    }

    private function course_teachers(int $contextid): array {
        global $DB;

        $users = $DB->get_records_sql(
            "SELECT DISTINCT u.id, u.firstname, u.lastname, u.email
               FROM {user} u
               JOIN {role_assignments} ra ON ra.userid = u.id
               JOIN {role} r ON r.id = ra.roleid
              WHERE ra.contextid = ?
                AND (r.shortname IN ('editingteacher', 'teacher')
                     OR " . $DB->sql_like('LOWER(r.shortname)', '?', false, false) . ")
              ORDER BY u.lastname, u.firstname",
            [$contextid, '%teacher%']
        );
        $names = [];
        $emails = [];
        foreach ($users as $user) {
            $names[] = fullname($user);
            if (!empty($user->email)) {
                $emails[] = $user->email;
            }
        }
        return [implode(', ', $names), implode(', ', array_unique($emails))];
    }
}
