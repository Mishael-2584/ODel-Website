<?php
namespace block_ueabbuilder\local;

defined('MOODLE_INTERNAL') || die();

/**
 * Canonical UEAB module schema shared by the block UI and future integrations.
 */
final class schema {
    public const VERSION = 2;
    public const MAX_TOPICS = 12;
    public const MAX_PAYLOAD_BYTES = 5000000;

    /** @return string[] */
    public static function schools(): array {
        return [
            'School of Business',
            'School of Education, Humanities and Social Sciences',
            'School of Nursing and Health Sciences',
            'School of Science and Technology',
            'School of Graduate Studies and Research',
        ];
    }

    /** @return array<string, string> */
    public static function school_colours(): array {
        return [
            'School of Business' => '#003DA5',
            'School of Education, Humanities and Social Sciences' => '#5B2C83',
            'School of Nursing and Health Sciences' => '#0F6B3E',
            'School of Science and Technology' => '#B04600',
            'School of Graduate Studies and Research' => '#7A1633',
        ];
    }

    /** @return string[] */
    public static function module_fields(): array {
        return [
            'title', 'shortname', 'dept', 'university', 'university_address',
            'school', 'deptname', 'dept_contact', 'dept_contact_email',
            'original_author_name', 'original_author_email',
            'lead_author_name', 'lead_author_email', 'lead_author_role', 'coauthors',
            'level', 'credits', 'class_contact_hours', 'private_study_hours',
            'weeks', 'total_learning_hours', 'units', 'programmes',
            'prereq_abilities', 'prereq_modules', 'welcome_message', 'aim',
            'module_description', 'outcomes_intro', 'outcomes', 'course_overview',
            'faith_integration', 'course_purpose', 'syllabus', 'delivery_methods',
            'instructional_materials', 'assessment_components',
            'continuous_assessment_structure', 'final_assessment', 'assessment_map',
            'grading_scale', 'core_texts', 'reference_texts', 'media',
            'odel_design_plan', 'attendance_policy', 'tardiness_policy',
            'academic_integrity_policy', 'special_needs_policy',
            'significant_features', 'student_target', 'student_skills',
            'student_knowledge', 'learner_support', 'support_staff_skills',
            'module_feedback_collection', 'module_feedback_use', 'qa_certificate',
            'instructor', 'email', 'mode',
        ];
    }

    /** @return string[] */
    public static function topic_fields(): array {
        return [
            'title', 'welcome_message', 'aim', 'description', 'outcomes',
            'pretopic_activity', 'pretopic_hours', 'course_content',
            'activity_overview', 'engagement_plan', 'f2f_activity', 'f2f_hours',
            'online_activity', 'online_hours', 'what', 'where', 'when',
            'tutor_role', 'assessment_activity', 'assessment_hours', 'topic_links',
            'resources', 'resource_access', 'collaboration', 'inclusive_approach',
            'feedback_collection', 'feedback_use', 'formative_feedback',
        ];
    }

    public static function normalise(array $data): array {
        $defaults = array_merge(array_fill_keys(self::module_fields(), ''), [
            'schema_version' => self::VERSION,
            'revision' => 0,
            'source' => 'block',
            'credits' => 3,
            'weeks' => 15,
            'topics' => 9,
            'lessons' => 9,
            'mode' => 'Blended',
            'university' => 'UNIVERSITY OF EASTERN AFRICA, BARATON',
            'university_address' => 'P.O. BOX 2500-30100 ELDORET KENYA, EAST AFRICA',
            'school' => 'School of Business',
            'outcomes_intro' => 'By the end of this module, you will be able to:',
            'topicsdata' => [],
            'topiclinks' => [],
        ]);

        // Backward-compatible aliases from version 1.x payloads.
        if (empty($data['core_texts']) && !empty($data['readings'])) {
            $data['core_texts'] = $data['readings'];
        }
        if (empty($data['lead_author_name']) && !empty($data['authors'])) {
            $data['lead_author_name'] = $data['authors'];
        }
        if (empty($data['course_overview']) && !empty($data['module_description'])) {
            $data['course_overview'] = $data['module_description'];
        }
        if (empty($data['assessment_components']) && !empty($data['assessments'])) {
            $data['assessment_components'] = self::legacy_assessments($data['assessments']);
        }

        $data['school'] = self::canonical_school((string)($data['school'] ?? ''));
        $normalised = array_merge($defaults, array_intersect_key($data, $defaults));
        $topiccount = (int)($data['topics'] ?? $data['lessons'] ?? 9);
        $topiccount = max(1, min(self::MAX_TOPICS, $topiccount));
        $normalised['topics'] = $topiccount;
        $normalised['lessons'] = $topiccount;
        $normalised['schema_version'] = self::VERSION;
        $normalised['revision'] = max(0, (int)($data['revision'] ?? 0));

        $rawtopics = $data['topicsdata'] ?? $data['lessonsdata'] ?? [];
        $normalised['topicsdata'] = [];
        for ($i = 1; $i <= $topiccount; $i++) {
            $row = $rawtopics[$i] ?? $rawtopics[(string)$i] ?? [];
            $normalised['topicsdata'][$i] = self::normalise_topic(is_array($row) ? $row : [], $i);
        }
        $rawlinks = $data['topiclinks'] ?? $data['lessonlinks'] ?? [];
        $normalised['topiclinks'] = [];
        for ($i = 1; $i <= $topiccount; $i++) {
            $normalised['topiclinks'][$i] = trim((string)($rawlinks[$i] ?? $rawlinks[(string)$i] ?? ''));
        }
        return $normalised;
    }

    public static function canonical_school(string $school): string {
        $decoded = html_entity_decode($school, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $normalised = strtolower(trim((string)preg_replace('/\s+/', ' ', str_replace('&', 'and', $decoded))));
        if ($normalised === '') {
            return 'School of Business';
        }
        if (str_contains($normalised, 'graduate')) {
            return 'School of Graduate Studies and Research';
        }
        if (str_contains($normalised, 'nursing') || str_contains($normalised, 'health sciences')) {
            return 'School of Nursing and Health Sciences';
        }
        if (str_contains($normalised, 'science and technology')) {
            return 'School of Science and Technology';
        }
        if (str_contains($normalised, 'education') || str_contains($normalised, 'humanities')
                || str_contains($normalised, 'social sciences')) {
            return 'School of Education, Humanities and Social Sciences';
        }
        if (str_contains($normalised, 'business')) {
            return 'School of Business';
        }
        return in_array($school, self::schools(), true) ? $school : 'School of Business';
    }

    public static function normalise_topic(array $topic, int $number): array {
        $defaults = array_fill_keys(self::topic_fields(), '');
        $defaults['num'] = $number;
        $defaults['title'] = "Topic {$number}";
        $defaults['pretopic_hours'] = 0;
        $defaults['f2f_hours'] = 0;
        $defaults['online_hours'] = 0;
        $defaults['assessment_hours'] = 0;

        // Backward-compatible aliases from the lesson schema.
        if (empty($topic['course_content']) && !empty($topic['syllabus'])) {
            $topic['course_content'] = $topic['syllabus'];
        }
        if (empty($topic['engagement_plan']) && !empty($topic['over_to_you'])) {
            $topic['engagement_plan'] = $topic['over_to_you'];
        }
        if (empty($topic['topic_links']) && !empty($topic['purpose'])) {
            $topic['topic_links'] = $topic['purpose'];
        }

        $normalised = array_merge($defaults, array_intersect_key($topic, $defaults));
        $normalised['num'] = $number;
        foreach (['pretopic_hours', 'f2f_hours', 'online_hours', 'assessment_hours'] as $field) {
            $normalised[$field] = max(0, (float)$normalised[$field]);
        }
        return $normalised;
    }

    public static function assessment_weight_total(string $text): ?float {
        $rows = self::pipe_rows($text, 2);
        if (!$rows) {
            return null;
        }
        $total = 0.0;
        foreach ($rows as $row) {
            $value = trim((string)($row[1] ?? ''));
            if ($value === '' || !is_numeric(str_replace('%', '', $value))) {
                return null;
            }
            $total += (float)str_replace('%', '', $value);
        }
        return $total;
    }

    /** @return array<int, array<int, string>> */
    public static function pipe_rows(string $text, int $minimumcolumns = 2): array {
        $rows = [];
        foreach (preg_split('/\R/u', $text) ?: [] as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            $parts = array_map('trim', explode('|', trim($line, '| ')));
            if (count($parts) >= $minimumcolumns) {
                $rows[] = $parts;
            }
        }
        return $rows;
    }

    private static function legacy_assessments(string $text): string {
        $lines = [];
        foreach (preg_split('/\R/u', $text) ?: [] as $line) {
            $line = trim($line);
            if ($line !== '') {
                $lines[] = $line . (str_contains($line, '|') ? '' : ' | |');
            }
        }
        return implode("\n", $lines);
    }
}
