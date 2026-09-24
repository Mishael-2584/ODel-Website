<?php
namespace block_ueabbuilder\local;

defined('MOODLE_INTERNAL') || die();

/** Renders the canonical module schema into safe, responsive Moodle HTML. */
final class renderer {
    private static function e(mixed $value): string {
        return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function present(mixed $value): bool {
        return trim((string)$value) !== '';
    }

    /**
     * Render structured plain text. Supports paragraphs, headings, lists and
     * Markdown-style tables without accepting executable HTML.
     */
    public static function rich(string $text, array $assets = []): string {
        $lines = preg_split('/\R/u', trim($text)) ?: [];
        if (!$lines || (count($lines) === 1 && trim($lines[0]) === '')) {
            return '';
        }

        $html = '';
        $list = null;
        $table = [];
        $practice = false;
        $practicequestion = 0;
        $wordfigure = false;
        $flushlist = function() use (&$html, &$list): void {
            if ($list !== null) {
                $html .= "</{$list}>";
                $list = null;
            }
        };
        $flushtable = function() use (&$html, &$table): void {
            if (!$table) {
                return;
            }
            $hasheader = isset($table[1]) && self::is_table_separator($table[1]);
            $columncount = max(array_map('count', $table));
            $html .= '<div class="ueab-table-wrap"><table class="ueab-table" data-columns="'
                . $columncount . '">';
            if ($hasheader) {
                $html .= '<thead><tr>';
                foreach ($table[0] as $cell) {
                    $html .= '<th scope="col">' . self::inline($cell) . '</th>';
                }
                $html .= '</tr></thead>';
            }
            $html .= '<tbody>';
            foreach ($table as $index => $cells) {
                if (($hasheader && $index < 2) || self::is_table_separator($cells)) {
                    continue;
                }
                $html .= '<tr>';
                foreach ($cells as $cell) {
                    $html .= '<td>' . self::inline($cell) . '</td>';
                }
                $html .= '</tr>';
            }
            $html .= '</tbody></table></div>';
            $table = [];
        };
        $closepractice = function() use (&$html, &$practice, &$practicequestion): void {
            if ($practice) {
                $html .= '</section>';
                $practice = false;
                $practicequestion = 0;
            }
        };
        $closewordfigure = function() use (&$html, &$wordfigure): void {
            if ($wordfigure) {
                $html .= '</blockquote></figure>';
                $wordfigure = false;
            }
        };

        foreach ($lines as $line) {
            $line = trim($line);
            if (preg_match('/^>\s?(.*)$/u', $line, $match)) {
                $flushlist();
                $flushtable();
                if (!$wordfigure) {
                    $html .= '<figure class="ueab-word-figure"><figcaption>Figure or equation</figcaption><blockquote>';
                    $wordfigure = true;
                }
                $html .= '<p>' . self::inline($match[1]) . '</p>';
                continue;
            }
            $closewordfigure();
            if (preg_match('/^\[\[FA_IMAGE:([a-f0-9]{16,64})\]\]$/', $line, $match)) {
                $flushlist();
                $flushtable();
                $html .= self::figure($match[1], $assets);
                continue;
            }
            if (preg_match('/^\|.*\|$/u', $line)) {
                $flushlist();
                $table[] = array_map('trim', explode('|', trim($line, '|')));
                continue;
            }
            $flushtable();
            if ($line === '') {
                $flushlist();
                continue;
            }
            if (preg_match('/^(#{1,3})\s+(.+)$/u', $line, $match)) {
                $flushlist();
                $heading = self::plain_inline($match[2]);
                if (self::is_practice_heading($heading)) {
                    if (!$practice) {
                        $practice = true;
                        $practicequestion = 0;
                        $html .= '<section class="ueab-practice"><header class="ueab-practice-header">'
                            . '<span>Try it yourself</span><h3>' . self::inline($match[2]) . '</h3>'
                            . '<p>Work through each prompt before comparing notes or continuing. '
                            . 'Responses typed here are private scratch work and are not saved or submitted.</p></header>';
                    } else {
                        if (preg_match('/\b(?:questions?|tasks?|instructions?)\b/i', $heading)) {
                            $practicequestion = 0;
                        }
                        $html .= '<h4 class="ueab-practice-subheading">' . self::inline($match[2]) . '</h4>';
                    }
                    continue;
                }
                $closepractice();
                $level = min(4, strlen($match[1]) + 2);
                $html .= "<h{$level}>" . self::inline($match[2]) . "</h{$level}>";
                continue;
            }
            if (preg_match('/^[-*]\s+(.+)$/u', $line, $match)) {
                if ($practice) {
                    $flushlist();
                    $practicequestion++;
                    $html .= self::practice_question($practicequestion, $match[1]);
                    continue;
                }
                if ($list !== 'ul') {
                    $flushlist();
                    $list = 'ul';
                    $html .= '<ul>';
                }
                $html .= '<li>' . self::inline($match[1]) . '</li>';
                continue;
            }
            if (preg_match('/^\d+[.)]\s+(.+)$/u', $line, $match)) {
                if ($practice) {
                    $flushlist();
                    $practicequestion++;
                    $html .= self::practice_question($practicequestion, $match[1]);
                    continue;
                }
                if ($list !== 'ol') {
                    $flushlist();
                    $list = 'ol';
                    $html .= '<ol>';
                }
                $html .= '<li>' . self::inline($match[1]) . '</li>';
                continue;
            }
            $flushlist();
            if ($practice && preg_match('/^Facilitat(?:ion|or)\s+note\s*:\s*(.+)$/iu', $line, $match)) {
                $html .= '<details class="ueab-practice-guidance"><summary>Facilitator guidance</summary><p>'
                    . self::inline($match[1]) . '</p></details>';
                continue;
            }
            if ($practice && preg_match('/^(?:Suggested|Model)\s+answer\s*:\s*(.+)$/iu', $line, $match)) {
                $html .= '<details class="ueab-practice-guidance"><summary>Compare your response</summary><p>'
                    . self::inline($match[1]) . '</p></details>';
                continue;
            }
            $html .= '<p>' . self::inline($line) . '</p>';
        }
        $flushlist();
        $flushtable();
        $closepractice();
        $closewordfigure();
        return $html;
    }

    private static function is_practice_heading(string $heading): bool {
        return (bool)preg_match(
            '/^(?:unit activity(?:\s*\/\s*case study)?|case study\b.*|activity instructions?|discussion tasks?'
                . '|(?:five\s+)?unit questions?|self[ -]?assessment(?: questions?)?|practice questions?'
                . '|review questions?|estimation exercise for learners)$/iu',
            trim($heading),
        );
    }

    private static function practice_question(int $number, string $prompt): string {
        return '<details class="ueab-practice-question"><summary><span class="ueab-practice-number">Question '
            . $number . '</span><span class="ueab-practice-prompt">' . self::inline($prompt) . '</span></summary>'
            . '<div class="ueab-practice-response"><label>Draft your response'
            . '<textarea rows="4" spellcheck="true" aria-label="Draft response to question ' . $number . '"></textarea>'
            . '</label><small>This practice response is not saved or submitted.</small></div></details>';
    }

    private static function plain_inline(string $value): string {
        return trim(preg_replace('/\*{1,3}(.+?)\*{1,3}/u', '$1', $value) ?? $value);
    }

    private static function figure(string $id, array $assets): string {
        foreach ($assets as $asset) {
            if (!is_array($asset) || ($asset['id'] ?? '') !== $id || empty($asset['url'])) {
                continue;
            }
            $alt = trim((string)($asset['altText'] ?? '')) ?: 'Course illustration';
            $caption = trim((string)($asset['caption'] ?? ''));
            return '<figure class="ueab-figure"><img src="' . self::e($asset['url'])
                . '" alt="' . self::e($alt) . '" loading="lazy" decoding="async">'
                . ($caption !== '' ? '<figcaption>' . self::e($caption) . '</figcaption>' : '')
                . '</figure>';
        }
        return '<p class="ueab-media-unavailable">An imported course illustration is unavailable. '
            . 'Ask the lecturer to republish this Topic.</p>';
    }

    /** @param string[] $headers */
    public static function pipe_table(string $text, array $headers): string {
        $rows = schema::pipe_rows($text, 2);
        if (!$rows) {
            return '';
        }
        $html = '<div class="ueab-table-wrap"><table class="ueab-table"><thead><tr>';
        foreach ($headers as $header) {
            $html .= '<th>' . self::e($header) . '</th>';
        }
        $html .= '</tr></thead><tbody>';
        foreach ($rows as $row) {
            $html .= '<tr>';
            for ($i = 0; $i < count($headers); $i++) {
                $html .= '<td>' . self::rich((string)($row[$i] ?? '')) . '</td>';
            }
            $html .= '</tr>';
        }
        return $html . '</tbody></table></div>';
    }

    public static function homepage(array $raw): string {
        $p = schema::normalise($raw);
        $palette = self::palette($p['school']);
        $title = self::e($p['title']);
        $code = self::e($p['shortname']);
        $school = self::e($p['school']);
        $department = self::e($p['deptname'] ?: $p['dept']);
        $welcome = self::rich($p['welcome_message']);
        $intro = self::rich($p['module_description']);
        $herolead = self::e(self::excerpt($p['aim'] ?: $p['module_description'], 190));
        $outcomes = self::rich(self::numbered_lines($p['outcomes']));
        $topiccards = '';
        for ($i = 1; $i <= (int)$p['topics']; $i++) {
            $topic = $p['topicsdata'][$i];
            $url = self::e($p['topiclinks'][$i] ?? '#');
            $topiccards .= '<a class="ueab-topic-card" href="' . $url . '"><span class="ueab-topic-number">' . $i
                . '</span><div><strong>'
                . self::e($topic['title']) . '</strong><small>' . self::e(self::excerpt($topic['description']))
                . '</small></div><span class="ueab-topic-arrow" aria-hidden="true">&#8594;</span></a>';
        }

        $authors = self::author_table($p);
        $assessment = self::pipe_table($p['assessment_components'], ['Assessment category', 'Weight (%)', 'Description']);
        $assessmentmap = self::pipe_table($p['assessment_map'], ['Module-level learning outcome', 'Assessment task']);
        $resources = self::pipe_table($p['media'], ['Resource type', 'Label', 'Link or location']);

        $sections = '';
        $sections .= self::card('institution', 'Institution and module team',
            self::facts([
                'University' => $p['university'], 'Address' => $p['university_address'],
                'School' => $p['school'], 'Department' => $p['deptname'],
                'Department contact' => trim($p['dept_contact'] . ' ' . $p['dept_contact_email']),
            ]) . $authors);
        $sections .= self::card('details', 'Course details', self::facts([
            'Academic level' => $p['level'], 'Credits' => $p['credits'],
            'Class contact hours' => $p['class_contact_hours'], 'Private/online study hours' => $p['private_study_hours'],
            'Weeks of study' => $p['weeks'], 'Your total learning hours' => $p['total_learning_hours'],
            'Units of study' => $p['units'], 'Programme(s)' => $p['programmes'],
            'Pre-requisite abilities and knowledge' => $p['prereq_abilities'],
            'Pre/co-requisite modules' => $p['prereq_modules'],
        ]));
        $sections .= self::card('overview', 'Module overview', self::subsections([
            'Aim of the module' => $p['aim'],
            'What you will be able to do' => self::numbered_lines($p['outcomes']),
        ]));
        $sections .= self::card('outline', 'Course outline', self::subsections([
            'Course overview and topic map' => $p['course_overview'],
            'Biblical and faith-integration basis' => $p['faith_integration'],
            'Purpose of the course' => $p['course_purpose'],
            'Course content / syllabus' => $p['syllabus'],
        ]));
        $sections .= self::card('delivery', 'Delivery and learning environment', self::subsections([
            'Delivery methods' => self::bullet_lines($p['delivery_methods']),
            'Instructional materials and equipment' => $p['instructional_materials'],
            'ODeL design plan' => $p['odel_design_plan'],
        ]));
        $sections .= self::card('assessment', 'Assessment and grading',
            $assessment . self::subsections([
                'Continuous assessment structure' => $p['continuous_assessment_structure'],
                'Final / summative assessment' => $p['final_assessment'],
            ]) . $assessmentmap . self::subsections(['Grading scale' => $p['grading_scale']]));
        $sections .= self::card('resources', 'Texts and online resources', self::subsections([
            'Core texts' => self::bullet_lines($p['core_texts']),
            'Reference texts' => self::bullet_lines($p['reference_texts']),
        ]) . $resources);
        $sections .= self::card('policies', 'Course policies and inclusion', self::subsections([
            'Attendance regulations' => $p['attendance_policy'], 'Tardiness policy' => $p['tardiness_policy'],
            'Academic integrity and dishonesty policy' => $p['academic_integrity_policy'],
            'Special needs and accommodation' => $p['special_needs_policy'],
        ]));
        $sections .= self::card('learners', 'Your learning profile and support', self::subsections([
            'Significant features of the module' => $p['significant_features'],
            'Who this module is for' => $p['student_target'], 'Skills you will need' => $p['student_skills'],
            'What you should already know' => $p['student_knowledge'], 'Support available to you' => $p['learner_support'],
            'Support staff skills' => $p['support_staff_skills'],
        ]));
        $sections .= self::card('quality', 'Quality assurance', self::subsections([
            'How we will gather your feedback' => $p['module_feedback_collection'],
            'How your feedback improves the module' => $p['module_feedback_use'],
            'Quality assurance certificate' => $p['qa_certificate'],
        ]));
        $sections .= self::card('topics', 'Course map: topics', '<div class="ueab-topic-grid">' . $topiccards . '</div>');
        $sections .= self::general_course_information((int)$p['topics']);

        return self::styles($palette) . '<main class="ueab-course" data-ueab-builder="module">'
            . '<header class="ueab-hero"><div class="ueab-hero-top"><span>' . self::e($p['university'])
            . '</span><span>' . $school . '</span></div><div class="ueab-hero-body"><p class="ueab-kicker">'
            . $department . '</p><h1>' . $title . '</h1><p class="ueab-code">' . $code . '</p>'
            . ($herolead !== '' ? '<p class="ueab-hero-lead">' . $herolead . '</p>' : '')
            . '<div class="ueab-meta"><span>'
            . self::e($p['level']) . '</span><span>' . self::e($p['credits']) . ' credits</span><span>'
            . self::e($p['weeks']) . ' weeks</span><span>' . self::e($p['mode']) . '</span></div></div></header>'
            . self::summary_stats($p)
            . ($welcome ? '<section class="ueab-welcome"><strong>Welcome</strong>' . $welcome . '</section>' : '')
            . ($intro ? '<section class="ueab-lead">' . $intro . '</section>' : '')
            . '<nav class="ueab-nav"><a href="#overview">Overview</a><a href="#outline">Course outline</a>'
            . '<a href="#delivery">Delivery</a>'
            . '<a href="#assessment">Assessment</a><a href="#resources">Resources</a>'
            . '<a href="#learners">Learner support</a><a href="#topics">Topics</a>'
            . '<a href="#faq">Help and accessibility</a></nav>'
            . '<section class="ueab-identity"><div><small>School</small><strong>' . $school
            . '</strong></div><div><small>Department</small><strong>' . $department . '</strong></div></section>'
            . $sections . '</main>';
    }

    public static function topic(int $number, array $rawmodule, array $rawtopic): string {
        $courseid = max(0, (int)($rawmodule['courseid'] ?? 0));
        $p = schema::normalise($rawmodule);
        $p['assets'] = self::resolve_asset_urls($courseid, $p['assets']);
        $t = schema::normalise_topic($rawtopic, $number);
        $palette = self::palette($p['school']);
        $total = $t['pretopic_hours'] + $t['f2f_hours'] + $t['online_hours'] + $t['assessment_hours'];
        $welcome = self::rich($t['welcome_message']);
        $cards = self::activity_card('Before this topic', $t['pretopic_hours'], $t['pretopic_activity']);
        $cards .= self::activity_card('Your face-to-face session', $t['f2f_hours'], $t['f2f_activity']);
        $cards .= self::activity_card('Your online session', $t['online_hours'], $t['online_activity']);
        $cards .= self::activity_card('Your topic assessment', $t['assessment_hours'], $t['assessment_activity']);

        $sections = '';
        $sections .= self::card('overview', 'Topic overview', self::subsections([
            'Aim / purpose' => $t['aim'], 'Brief description' => $t['description'],
            'What you will be able to do' => self::numbered_lines($t['outcomes']),
        ]));
        $sections .= self::card('content', 'What you will learn', self::rich($t['course_content'], $p['assets']));
        $sections .= self::card('activities', 'How you will learn and participate',
            self::subsections(['What you will do' => $t['activity_overview'],
                'Your learning sequence' => $t['engagement_plan']])
            . '<div class="ueab-activity-grid">' . $cards . '</div>'
            . self::subsections(['What you should do' => $t['what'], 'Where you will do it' => $t['where'],
                'When you should complete it' => $t['when'], 'How your tutor will support you' => $t['tutor_role']]));
        $sections .= self::card('connections', 'Connections, resources and access', self::subsections([
            'Links to previous and following topics' => $t['topic_links'],
            'Learning resources and references' => $t['resources'],
            'How you will access the resources' => $t['resource_access'],
            'How you will collaborate' => $t['collaboration'],
            'Accessibility and support available to you' => $t['inclusive_approach'],
        ]));
        $sections .= self::card('feedback', 'Feedback and improvement', self::subsections([
            'How we will gather your feedback' => $t['feedback_collection'],
            'How your feedback improves this topic' => $t['feedback_use'],
            'When you will receive formative feedback' => $t['formative_feedback'],
        ]));
        return self::styles($palette) . '<main class="ueab-course ueab-topic" data-ueab-builder="topic">'
            . '<header class="ueab-hero ueab-topic-hero"><div class="ueab-hero-top"><span>'
            . self::e($p['shortname']) . '</span><span>' . self::e($p['school'])
            . '</span></div><div class="ueab-hero-body"><p class="ueab-kicker">' . self::e($p['title'])
            . '</p><h1>Topic ' . $number . ': ' . self::e($t['title']) . '</h1><div class="ueab-meta"><span>'
            . self::hours($total) . ' total hours</span><span>' . self::e($p['mode']) . '</span></div></div></header>'
            . ($welcome ? '<section class="ueab-welcome"><strong>Welcome to this topic</strong>' . $welcome . '</section>' : '')
            . '<nav class="ueab-nav"><a href="#overview">Overview</a><a href="#content">Content</a>'
            . '<a href="#activities">Activities</a><a href="#connections">Resources</a><a href="#feedback">Feedback</a></nav>'
            . $sections . '</main>';
    }

    /** Rebuild protected Moodle URLs from persisted file identities at render time. */
    private static function resolve_asset_urls(int $courseid, array $assets): array {
        if ($courseid <= 0 || !$assets) {
            return $assets;
        }
        $context = \context_course::instance($courseid);
        foreach ($assets as &$asset) {
            if (!empty($asset['url']) || empty($asset['fileItemId']) || empty($asset['filename'])) {
                continue;
            }
            $asset['url'] = \moodle_url::make_pluginfile_url(
                $context->id,
                'block_ueabbuilder',
                'media',
                (int)$asset['fileItemId'],
                '/',
                (string)$asset['filename'],
                false,
            )->out(false);
        }
        unset($asset);
        return $assets;
    }

    private static function styles(array $palette): string {
        $primary = self::e($palette['primary']);
        $dark = self::e($palette['dark']);
        $accent = self::e($palette['accent']);
        $tint = self::e($palette['tint']);
        $soft = self::e($palette['soft']);
        return '<style>
.ueab-course{--ueab-primary:' . $primary . ';--ueab-dark:' . $dark . ';--ueab-accent:' . $accent . ';--ueab-tint:' . $tint . ';--ueab-soft:' . $soft . ';width:100%;max-width:980px;min-width:0;margin:0 auto;color:#172033;font-family:"Segoe UI",Arial,sans-serif;line-height:1.65;overflow-x:hidden;box-sizing:border-box}
.ueab-course *{box-sizing:border-box}.ueab-course>*{width:100%;max-width:100%;min-width:0}.ueab-hero{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(128deg,var(--ueab-dark) 0%,var(--ueab-primary) 70%,var(--ueab-accent) 145%);color:#fff;box-shadow:0 22px 50px rgba(17,35,64,.2);border-bottom:5px solid var(--ueab-accent)}.ueab-hero:after{content:"";position:absolute;right:-90px;bottom:-145px;width:330px;height:330px;border-radius:50%;border:55px solid rgba(255,255,255,.07);pointer-events:none}.ueab-hero-top{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:10px clamp(22px,5vw,48px);background:rgba(0,0,0,.2);border-bottom:1px solid rgba(255,255,255,.12);font-size:10px;font-weight:800;letter-spacing:.075em;text-transform:uppercase}.ueab-hero-top span:last-child{text-align:right;color:#ffe6a0}.ueab-hero-body{position:relative;z-index:1;padding:28px clamp(22px,5vw,52px) 32px}
.ueab-hero h1{margin:5px 0 7px;color:#fff!important;font-size:clamp(29px,5vw,46px);font-weight:850;letter-spacing:-.025em;line-height:1.08;text-shadow:0 3px 24px rgba(0,0,0,.25);overflow-wrap:anywhere}.ueab-kicker{margin:0;text-transform:uppercase;letter-spacing:.13em;font-size:10px;font-weight:900;color:#ffe08a}.ueab-code{margin:0;font-weight:700;opacity:.82}.ueab-hero-lead{max-width:720px;margin:13px 0 0;color:#fff!important;font-size:14px;line-height:1.55;opacity:.92}.ueab-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:19px}.ueab-meta span{padding:5px 11px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(255,255,255,.12);font-size:11px;font-weight:700;backdrop-filter:blur(3px)}
.ueab-topic-hero .ueab-hero-body{display:flex;min-height:158px;flex-direction:column;justify-content:center;padding-top:24px;padding-bottom:26px}.ueab-topic-hero h1{max-width:830px;font-size:clamp(27px,4.2vw,42px);line-height:1.12}.ueab-topic-hero .ueab-meta{margin-top:17px}
.ueab-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.ueab-stat{padding:13px 15px;border:1px solid var(--ueab-soft);border-radius:13px;background:linear-gradient(145deg,#fff,var(--ueab-tint));box-shadow:0 6px 18px rgba(17,35,64,.05)}.ueab-stat strong,.ueab-stat small{display:block}.ueab-stat strong{color:var(--ueab-primary);font-size:18px;line-height:1.2}.ueab-stat small{margin-top:3px;color:#69768a;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}
.ueab-welcome,.ueab-lead{margin:16px 0;padding:20px 24px;border-radius:15px;background:linear-gradient(135deg,#fff,var(--ueab-tint));border:1px solid var(--ueab-soft);box-shadow:0 8px 22px rgba(17,35,64,.045)}.ueab-welcome{border-left:4px solid var(--ueab-accent)}.ueab-welcome>strong{display:block;color:var(--ueab-primary);text-transform:uppercase;letter-spacing:.08em;font-size:11px}.ueab-welcome p:last-child,.ueab-lead p:last-child{margin-bottom:0}
.ueab-nav{position:sticky;top:0;z-index:2;display:flex;gap:6px;min-width:0;max-width:100%;overflow:auto;margin:14px 0;padding:9px 11px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:linear-gradient(100deg,var(--ueab-dark),var(--ueab-primary));box-shadow:0 10px 26px rgba(17,35,64,.12)}.ueab-nav a{padding:6px 10px;border:1px solid transparent;border-radius:999px;white-space:nowrap;color:#fff;font-size:12px;font-weight:750;text-decoration:none}.ueab-nav a:hover,.ueab-nav a:focus{border-color:rgba(255,255,255,.32);background:rgba(255,255,255,.14);outline:none}
.ueab-identity{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:14px 0}.ueab-identity div{padding:14px 18px;border:1px solid var(--ueab-soft);border-radius:12px;background:var(--ueab-tint)}.ueab-identity small{display:block;text-transform:uppercase;letter-spacing:.08em;color:#718096}.ueab-identity strong{display:block;color:var(--ueab-dark)}
.ueab-card{position:relative;margin:14px 0;padding:25px clamp(18px,4vw,32px);border:1px solid #e1e6ee;border-radius:17px;background:#fff;box-shadow:0 9px 28px rgba(17,35,64,.055)}.ueab-card:before{content:"";position:absolute;top:0;left:28px;width:56px;height:3px;border-radius:0 0 3px 3px;background:var(--ueab-accent)}.ueab-card h2{margin:0 0 19px;color:var(--ueab-primary);font-size:22px;letter-spacing:-.015em}.ueab-card h3,.ueab-card h4,.ueab-card h5{margin:18px 0 6px;color:var(--ueab-dark)!important;font-size:15px;line-height:1.35}.ueab-card p{margin:0 0 10px}.ueab-card ul,.ueab-card ol{padding-left:22px}.ueab-card li{margin:5px 0}.ueab-card strong{color:inherit}
.ueab-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.ueab-fact{padding:13px 15px;border:1px solid var(--ueab-soft);background:var(--ueab-tint);border-radius:11px}.ueab-fact small{display:block;color:#718096;text-transform:uppercase;letter-spacing:.06em}.ueab-fact strong{display:block;color:var(--ueab-dark);white-space:pre-line}
.ueab-table-wrap{min-width:0;max-width:100%;overflow:auto;margin:18px 0;border:1px solid #d8e0eb;border-radius:14px;background:#fff;box-shadow:0 7px 20px rgba(17,35,64,.06)}.ueab-table{width:100%;min-width:560px;border-collapse:collapse;border-spacing:0}.ueab-table th{background:linear-gradient(120deg,var(--ueab-dark),var(--ueab-primary));color:#fff;text-align:left;font-size:12px;letter-spacing:.01em}.ueab-table th,.ueab-table td{padding:11px 13px;border-right:1px solid #e3e8f0;border-bottom:1px solid #e3e8f0;vertical-align:top;overflow-wrap:anywhere}.ueab-table th:last-child,.ueab-table td:last-child{border-right:0}.ueab-table tbody tr:nth-child(even) td{background:var(--ueab-tint)}.ueab-table tbody tr:hover td{background:var(--ueab-soft)}.ueab-table tbody tr:last-child td{border-bottom:0}.ueab-table td:first-child{font-weight:700;color:var(--ueab-dark)}.ueab-table td p{margin:0}
.ueab-figure{max-width:860px;margin:26px auto;padding:10px;text-align:center;border:1px solid #e2e7ef;border-radius:16px;background:linear-gradient(145deg,#fff,var(--ueab-tint));box-shadow:0 10px 30px rgba(17,35,64,.08)}.ueab-figure img{display:block;width:auto;max-width:100%;height:auto;max-height:760px;margin:0 auto;border-radius:10px;background:#fff;object-fit:contain}.ueab-figure figcaption{max-width:720px;margin:9px auto 2px;color:#59667b;font-size:12px;line-height:1.5}.ueab-word-figure{max-width:860px;margin:20px auto;padding:12px 16px;border:1px solid var(--ueab-soft);border-left:4px solid var(--ueab-accent);border-radius:12px;background:linear-gradient(145deg,#fff,var(--ueab-tint));box-shadow:0 7px 20px rgba(17,35,64,.06)}.ueab-word-figure figcaption{margin:0 0 7px;color:var(--ueab-primary);font-size:10px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.ueab-word-figure blockquote{margin:0;color:#24334a;font-size:15px;line-height:1.7;overflow-wrap:anywhere}.ueab-word-figure blockquote p{margin:0}.ueab-media-unavailable{padding:12px 14px;border:1px solid #ecd8a4;border-radius:10px;background:#fff8e6;color:#6d5420}
.ueab-practice{margin:24px 0;padding:clamp(16px,3vw,24px);border:1px solid var(--ueab-soft);border-radius:18px;background:linear-gradient(145deg,var(--ueab-tint),#fff);box-shadow:0 10px 28px rgba(17,35,64,.07)}.ueab-practice-header{margin:-1px -1px 18px;padding:18px 20px;border-radius:14px;background:linear-gradient(120deg,var(--ueab-dark),var(--ueab-primary));color:#fff}.ueab-practice-header>span{display:block;color:#ffe08a;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.ueab-practice-header h3{margin:4px 0 5px;color:#fff!important;font-size:21px}.ueab-practice-header p{margin:0;color:#fff;opacity:.88;font-size:13px}.ueab-practice-subheading{margin:20px 0 10px!important;padding-bottom:7px;border-bottom:1px solid var(--ueab-soft);color:var(--ueab-primary)!important;font-size:16px!important}.ueab-practice-question{margin:10px 0;border:1px solid #d9e1eb;border-radius:13px;background:#fff;overflow:hidden}.ueab-practice-question[open]{border-color:var(--ueab-primary);box-shadow:0 8px 22px rgba(17,35,64,.08)}.ueab-practice-question summary{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:11px;padding:14px 16px;cursor:pointer;list-style:none}.ueab-practice-question summary::-webkit-details-marker{display:none}.ueab-practice-question summary:after{content:"+";grid-column:1/-1;justify-self:end;margin-top:-26px;color:var(--ueab-primary);font-size:20px;font-weight:800}.ueab-practice-question[open] summary:after{content:"−"}.ueab-practice-number{padding:3px 8px;border-radius:999px;background:var(--ueab-soft);color:var(--ueab-dark);font-size:10px;font-weight:850;white-space:nowrap}.ueab-practice-prompt{padding-right:24px;color:#253147;font-weight:650;line-height:1.5}.ueab-practice-response{padding:0 16px 16px}.ueab-practice-response label{display:block;color:var(--ueab-dark);font-size:12px;font-weight:800}.ueab-practice-response textarea{display:block;width:100%;min-height:96px;margin-top:6px;padding:11px 12px;resize:vertical;border:1px solid #c9d3df;border-radius:10px;background:#fff;color:#172033;font:inherit;line-height:1.5}.ueab-practice-response textarea:focus{border-color:var(--ueab-primary);outline:3px solid var(--ueab-soft)}.ueab-practice-response small{display:block;margin-top:6px;color:#68748a}.ueab-practice-guidance{margin:12px 0;padding:10px 13px;border-left:3px solid var(--ueab-accent);border-radius:8px;background:#fff}.ueab-practice-guidance summary{cursor:pointer;color:var(--ueab-dark);font-weight:800}.ueab-practice-guidance p{margin:8px 0 0}
.ueab-topic-grid,.ueab-activity-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}.ueab-topic-card{display:grid;grid-template-columns:38px minmax(0,1fr) 22px;align-items:center;gap:12px;min-height:92px;padding:15px;border:1px solid var(--ueab-soft);border-left:4px solid var(--ueab-accent);border-radius:13px;background:linear-gradient(145deg,#fff,var(--ueab-tint));color:inherit;text-decoration:none;box-shadow:0 5px 16px rgba(17,35,64,.045);transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}.ueab-topic-card:hover,.ueab-topic-card:focus{transform:translateY(-2px);border-color:var(--ueab-primary);box-shadow:0 12px 28px rgba(17,35,64,.12);outline:none}.ueab-topic-number{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--ueab-primary);color:#fff;font-weight:850}.ueab-topic-arrow{color:var(--ueab-primary);font-size:20px;font-weight:800;transition:transform .16s ease}.ueab-topic-card:hover .ueab-topic-arrow,.ueab-topic-card:focus .ueab-topic-arrow{transform:translateX(3px)}.ueab-topic-card strong,.ueab-topic-card small{display:block}.ueab-topic-card strong{color:var(--ueab-dark);line-height:1.3}.ueab-topic-card small{margin-top:5px;color:#68748a;line-height:1.45}.ueab-activity{padding:15px;border-radius:12px;background:var(--ueab-tint);border-top:3px solid var(--ueab-accent)}.ueab-activity h3{display:flex;justify-content:space-between;margin-top:0}.ueab-activity h3 span{color:var(--ueab-primary)}
.ueab-faq{margin:0}.ueab-faq dt{margin-top:16px;color:var(--ueab-dark);font-weight:800}.ueab-faq dt:first-child{margin-top:0}.ueab-faq dd{margin:4px 0 0}.ueab-support a{color:var(--ueab-primary);font-weight:700;overflow-wrap:anywhere}
@media(max-width:620px){.ueab-hero-top{align-items:flex-start;flex-direction:column;gap:2px}.ueab-hero-top span:last-child{text-align:left}.ueab-topic-hero .ueab-hero-body{min-height:0;padding-top:22px;padding-bottom:24px}.ueab-topic-hero h1{font-size:clamp(25px,8vw,34px)}.ueab-nav{position:static}.ueab-card{padding:20px 18px}.ueab-stats{grid-template-columns:1fr 1fr}.ueab-activity-grid,.ueab-topic-grid{grid-template-columns:1fr}.ueab-table th,.ueab-table td{padding:9px 10px}.ueab-figure{margin:20px 0;padding:7px}.ueab-practice{padding:13px}.ueab-practice-question summary{grid-template-columns:1fr}.ueab-practice-number{justify-self:start}.ueab-practice-prompt{padding-right:20px}}
@media print{.ueab-course{max-width:none;color:#000}.ueab-nav{display:none}.ueab-hero,.ueab-card,.ueab-welcome,.ueab-lead{box-shadow:none;break-inside:avoid}.ueab-topic-card,.ueab-fact,.ueab-activity{break-inside:avoid}.ueab-hero{print-color-adjust:exact;-webkit-print-color-adjust:exact}.ueab-card a{color:inherit;text-decoration:underline}}
</style>';
    }

    private static function general_course_information(int $topiccount): string {
        $topiccount = max(1, $topiccount);
        $topiclabel = $topiccount === 1 ? 'Topic' : 'Topics';
        $supportemail = 'elearningsupport@ueab.ac.ke';
        $directoremail = 'elearningdirector@ueab.ac.ke';
        $faqs = [
            'How is the course structured?' => $topiccount . ' sequential, self-paced ' . $topiclabel
                . '. Use the Course map above to move through them in order.',
            'What if I fall behind schedule?' => 'Contact your course coordinator as soon as possible to discuss '
                . 'an extension or catch-up plan.',
            'Are the case studies graded?' => 'When a case study is listed as an assessment activity, it contributes '
                . 'to continuous assessment. Check Assessment and grading for its weighting.',
            'How do I access the final examination?' => 'Follow the course-specific instructions under Assessment and '
                . 'grading. Where completion tracking is enabled, complete all required Topics and practice activities first.',
            'Where can I find definitions of key terms?' => 'Use the course glossary or the glossary supplied in the relevant Topic.',
            'What if a link or resource does not work?' => 'Report it to ' . $supportemail
                . ' so it can be checked and corrected.',
            'How do I know my progress?' => 'Where completion tracking is enabled, the LMS dashboard shows completed '
                . 'Topics, submitted assessments and available grades.',
            'Can I print the course materials?' => 'Yes. Each Topic is formatted for printing. Use your browser print '
                . 'command or PDF export option.',
        ];

        $faqhtml = '<dl class="ueab-faq">';
        foreach ($faqs as $question => $answer) {
            $faqhtml .= '<dt>' . self::e($question) . '</dt><dd>' . self::e($answer) . '</dd>';
        }
        $faqhtml .= '</dl>';

        $support = '<div class="ueab-support"><p><strong>ODeL technical support (LMS issues):</strong> '
            . '<a href="mailto:' . self::e($supportemail) . '">' . self::e($supportemail) . '</a></p>'
            . '<p><strong>eLearning Director (course delivery and escalations):</strong> '
            . '<a href="mailto:' . self::e($directoremail) . '">' . self::e($directoremail) . '</a></p>'
            . '<p><strong>Expected response time:</strong> within two working days during normal university working periods.</p>'
            . '<p>For official examination and academic-record changes, contact your course coordinator or the Academic '
            . 'Registrar through the official UEAB channels.</p></div>';

        $accessibility = '<p>This course is designed for keyboard and mouse navigation. Images and other non-text elements '
            . 'should include descriptive alternative text. Audio and video content should include synchronized captions '
            . 'and a text transcript. Quizzes, submission controls and navigation links should be clearly labelled and '
            . 'keyboard operable.</p><p>If you encounter an accessibility barrier, email <a href="mailto:'
            . self::e($supportemail) . '">' . self::e($supportemail) . '</a> to request assistance or an alternative format.</p>';

        return self::card('faq', 'Frequently asked questions', $faqhtml)
            . self::card('support', 'Contact and support information', $support)
            . self::card('accessibility', 'Accessibility statement', '<div class="ueab-support">' . $accessibility . '</div>');
    }

    private static function card(string $id, string $title, string $content): string {
        if (trim(strip_tags($content)) === '' && !str_contains($content, '<img ')) {
            return '';
        }
        return '<section id="' . self::e($id) . '" class="ueab-card"><h2>' . self::e($title) . '</h2>' . $content . '</section>';
    }

    private static function facts(array $items): string {
        $html = '';
        foreach ($items as $label => $value) {
            if (!self::present($value)) {
                continue;
            }
            $html .= '<div class="ueab-fact"><small>' . self::e($label) . '</small><strong>' . self::e($value) . '</strong></div>';
        }
        return $html ? '<div class="ueab-facts">' . $html . '</div>' : '';
    }

    private static function subsections(array $items): string {
        $html = '';
        foreach ($items as $label => $value) {
            if (!self::present($value)) {
                continue;
            }
            $html .= '<section><h3>' . self::e($label) . '</h3>' . self::rich((string)$value) . '</section>';
        }
        return $html;
    }

    private static function author_table(array $p): string {
        $rows = [];
        if (self::present($p['original_author_name'])) {
            $rows[] = ['Original author', $p['original_author_name'], $p['original_author_email'], ''];
        }
        if (self::present($p['lead_author_name'])) {
            $rows[] = ['Lead author', $p['lead_author_name'], $p['lead_author_email'], $p['lead_author_role']];
        }
        foreach (schema::pipe_rows($p['coauthors'], 2) as $row) {
            $rows[] = ['Co-author / contributor', $row[0] ?? '', $row[1] ?? '', $row[2] ?? ''];
        }
        if (!$rows) {
            return '';
        }
        $html = '<div class="ueab-table-wrap"><table class="ueab-table"><thead><tr><th>Role</th><th>Name</th><th>Email</th><th>Responsibility</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $html .= '<td>' . self::e($cell) . '</td>';
            }
            $html .= '</tr>';
        }
        return $html . '</tbody></table></div>';
    }

    private static function activity_card(string $label, float $hours, string $content): string {
        if (!self::present($content) && $hours <= 0) {
            return '';
        }
        return '<article class="ueab-activity"><h3>' . self::e($label) . '<span>' . self::hours($hours) . '</span></h3>'
            . self::rich($content) . '</article>';
    }

    private static function numbered_lines(string $text): string {
        $lines = array_values(array_filter(array_map('trim', preg_split('/\R/u', $text) ?: [])));
        return implode("\n", array_map(fn($line, $index) => preg_match('/^\d+[.)]\s/u', $line) ? $line : ($index + 1) . '. ' . $line, $lines, array_keys($lines)));
    }

    private static function bullet_lines(string $text): string {
        $lines = array_values(array_filter(array_map('trim', preg_split('/\R/u', $text) ?: [])));
        return implode("\n", array_map(fn($line) => preg_match('/^[-*]\s/u', $line) ? $line : '- ' . $line, $lines));
    }

    private static function hours(float $hours): string {
        return rtrim(rtrim(number_format($hours, 2, '.', ''), '0'), '.') . 'h';
    }

    private static function summary_stats(array $module): string {
        $items = [
            'Topics' => (string)$module['topics'],
            'Weeks' => (string)$module['weeks'],
            'Credits' => (string)$module['credits'],
            'Delivery' => (string)$module['mode'],
        ];
        $html = '<section class="ueab-stats" aria-label="Course summary">';
        foreach ($items as $label => $value) {
            $html .= '<div class="ueab-stat"><strong>' . self::e($value) . '</strong><small>'
                . self::e($label) . '</small></div>';
        }
        return $html . '</section>';
    }

    private static function excerpt(string $text, int $limit = 100): string {
        $plain = trim(preg_replace('/\s+/', ' ', $text));
        $limit = max(10, $limit);
        return mb_strlen($plain) > $limit ? mb_substr($plain, 0, $limit - 3) . '...' : $plain;
    }

    private static function is_table_separator(array $cells): bool {
        return count($cells) > 0 && count(array_filter($cells, fn($cell) => !preg_match('/^:?-{3,}:?$/', trim($cell)))) === 0;
    }

    private static function inline(string $value): string {
        $escaped = self::e($value);
        $escaped = preg_replace('/\*\*\*(.+?)\*\*\*/u', '<strong><em>$1</em></strong>', $escaped) ?? $escaped;
        $escaped = preg_replace('/\*\*(.+?)\*\*/u', '<strong>$1</strong>', $escaped) ?? $escaped;
        $escaped = preg_replace('/(?<!\*)\*([^*]+?)\*(?!\*)/u', '<em>$1</em>', $escaped) ?? $escaped;
        return self::linkify($escaped);
    }

    private static function linkify(string $escaped): string {
        return preg_replace('~(https?://[^\s<]+)~i', '<a href="$1" target="_blank" rel="noopener">$1</a>', $escaped) ?? $escaped;
    }

    private static function palette(string $school): array {
        return match (schema::canonical_school($school)) {
            'School of Education, Humanities and Social Sciences' => [
                'primary' => '#5B2C83', 'dark' => '#3A1C54', 'accent' => '#D8A92D',
                'tint' => '#FAF6FC', 'soft' => '#E8DDF0',
            ],
            'School of Nursing and Health Sciences' => [
                'primary' => '#0F6B3E', 'dark' => '#083B23', 'accent' => '#D2A62A',
                'tint' => '#F3FAF6', 'soft' => '#D5EADD',
            ],
            'School of Science and Technology' => [
                'primary' => '#B04600', 'dark' => '#6E2B00', 'accent' => '#E0A622',
                'tint' => '#FFF7F1', 'soft' => '#F1D9C8',
            ],
            'School of Graduate Studies and Research' => [
                'primary' => '#7A1633', 'dark' => '#4A0D1F', 'accent' => '#D5A62B',
                'tint' => '#FCF5F7', 'soft' => '#EBCFD7',
            ],
            default => [
                'primary' => '#003DA5', 'dark' => '#002064', 'accent' => '#C9A227',
                'tint' => '#F4F7FD', 'soft' => '#D7E2F5',
            ],
        };
    }
}
