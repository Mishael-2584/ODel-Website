<?php
namespace block_ueabbuilder\local;

defined('MOODLE_INTERNAL') || die();

/** Builds the template-ordered block form and its local interaction script. */
final class form_renderer {
    public static function render(array $state): string {
        $rawsaved = $state['saved'] ?? [];
        $hassavedcontent = !empty($rawsaved) && empty($rawsaved['reset']);
        $saved = schema::normalise($rawsaved);
        $saved['title'] = $hassavedcontent ? $saved['title'] : ($state['course_title'] ?? '');
        $saved['shortname'] = $hassavedcontent ? $saved['shortname'] : ($state['course_shortname'] ?? '');
        $saved['dept'] = $hassavedcontent ? $saved['dept'] : ($state['course_category'] ?? '');
        $saved['deptname'] = $hassavedcontent ? $saved['deptname'] : ($state['course_category'] ?? '');
        $saved['instructor'] = $hassavedcontent ? $saved['instructor'] : ($state['instructor'] ?? '');
        $saved['email'] = $hassavedcontent ? $saved['email'] : ($state['email'] ?? '');

        $institution = self::details('1. Institution and department',
            'UEAB identity is prefilled; confirm the school, department and contact details.',
            self::input('university', 'Name of University')
            . self::textarea('university_address', 'University address', 'normal')
            . self::select('school', 'Name of the School', schema::schools())
            . self::school_colour_key()
            . self::input('deptname', 'Name of the Department')
            . self::grid(
                self::input('dept_contact', 'Department contact person'),
                self::input('dept_contact_email', 'Department contact email', 'email')
            ), true);

        $authors = self::details('2. Authors and contributors',
            'Record people and responsibilities separately so attribution remains clear.',
            self::grid(
                self::input('original_author_name', 'Original author (if applicable)'),
                self::input('original_author_email', 'Original author email', 'email')
            )
            . self::grid(
                self::input('lead_author_name', 'Lead author'),
                self::input('lead_author_email', 'Lead author email', 'email')
            )
            . self::textarea('lead_author_role', 'Lead author responsibility', 'normal')
            . self::textarea('coauthors', 'Co-authors / contributors', 'large',
                'One per line: Name | Email | Responsibility'), true);

        $course = self::details('3. Course details',
            'Course identity is synchronized from the current Moodle course where possible.',
            self::input('title', 'Module title')
            . self::input('shortname', 'Course code / short name')
            . '<input id="ubb-dept" type="hidden">'
            . self::grid(self::select('level', 'Academic level',
                ['Certificate', 'Diploma', 'Undergraduate', 'MBA', 'Masters', 'PhD', 'Short Course']),
                self::input('credits', 'Number of credits', 'number', '1', '12'))
            . self::grid(self::input('class_contact_hours', 'Class contact time (hours)', 'number', '0', '5000'),
                self::input('private_study_hours', 'Private / online study hours', 'number', '0', '5000'))
            . self::grid(self::input('weeks', 'Number of weeks of study', 'number', '1', '52'),
                self::input('total_learning_hours', 'Total student learning hours', 'number', '0', '10000'))
            . self::grid(self::input('units', 'Number of units / topics', 'number', '1', '12'),
                self::input('topics', 'Topics to publish', 'number', '1', '12'))
            . self::textarea('programmes', 'Programme(s) which might include this module', 'normal', 'One per line')
            . self::textarea('prereq_abilities', 'Pre-requisite student abilities and knowledge', 'normal')
            . self::textarea('prereq_modules', 'Pre-requisite or co-requisite modules', 'normal')
            . self::grid(self::select('mode', 'Primary delivery mode', ['Blended', 'Online', 'Face-to-Face']),
                self::input('instructor', 'Instructor(s)'))
            . self::input('email', 'Instructor email', 'email'), true);

        $overview = self::details('4. Module welcome, aim and outcomes',
            'These are learner-facing and appear early on the generated course page.',
            self::textarea('welcome_message', 'Module welcome message', 'large')
            . self::textarea('aim', 'Aim of the module', 'large')
            . self::textarea('module_description', 'Brief description of the module', 'large')
            . self::input('outcomes_intro', 'Learning outcomes introduction')
            . self::textarea('outcomes', 'Intended learning outcomes', 'xlarge', 'One outcome per line'), true);

        $courseoverview = self::details('5. Course overview and delivery',
            'Large fields support paragraphs, lists, headings and Markdown-style tables.',
            self::textarea('course_overview', 'Course overview / topic map', 'xlarge')
            . self::textarea('faith_integration', 'Biblical or faith-integration basis', 'large')
            . self::textarea('course_purpose', 'Purpose of the course', 'large')
            . self::textarea('syllabus', 'Syllabus / curriculum', 'xlarge')
            . self::textarea('delivery_methods', 'Delivery methods', 'large', 'One method per line')
            . self::textarea('instructional_materials', 'Instructional materials and equipment', 'large')
            . self::textarea('odel_design_plan', 'ODeL design plan', 'large'));

        $assessment = self::details('6. Assessment and grading',
            'Structured assessment weights are validated to total 100%.',
            self::textarea('assessment_components', 'Assessment categories and percentages', 'large',
                'One per line: Category | Weight % | Description. Example: Continuous assessment | 40 | Quizzes and assignments')
            . '<div id="ubb-weight-status" class="ubb-inline-status"></div>'
            . self::textarea('continuous_assessment_structure', 'Continuous assessment structure', 'large')
            . self::textarea('final_assessment', 'Form of final / summative assessment', 'large')
            . self::textarea('assessment_map', 'Assessment of module-level learning outcomes', 'xlarge',
                'One per line: Learning outcome | Assessment task')
            . self::textarea('grading_scale', 'Grading scale', 'large',
                'Use a Markdown table for structured scales, for example: | Score | Grade | Points |'));

        $resources = self::details('7. Texts, media and online resources',
            'Core and reference texts remain distinct in both storage and display.',
            self::textarea('core_texts', 'Core texts', 'large', 'One text per line')
            . self::textarea('reference_texts', 'Reference texts', 'large', 'One text per line')
            . self::textarea('media', 'Media and links', 'large',
                'One per line: Type | Label | URL or location'));

        $policies = self::details('8. Course policies and inclusion',
            'Keep institutional policies explicit and easy for learners to find.',
            self::textarea('attendance_policy', 'Attendance regulations', 'large')
            . self::textarea('tardiness_policy', 'Tardiness policy', 'large')
            . self::textarea('academic_integrity_policy', 'Academic integrity / dishonesty policy', 'xlarge')
            . self::textarea('special_needs_policy', 'Special needs and accommodation provisions', 'large'));

        $support = self::details('9. Learner profile, support and quality assurance',
            'Describe who the module serves, how learners are supported and how quality improves.',
            self::textarea('significant_features', 'Significant features or elements of the module', 'large')
            . self::textarea('student_target', 'Target group of students', 'large')
            . self::textarea('student_skills', 'Skills students should already have', 'large')
            . self::textarea('student_knowledge', 'Prior subject knowledge expected', 'large')
            . self::textarea('learner_support', 'Learner support provided', 'large')
            . self::textarea('support_staff_skills', 'Skills required by support staff', 'large')
            . self::textarea('module_feedback_collection', 'How module feedback is obtained', 'normal')
            . self::textarea('module_feedback_use', 'How student feedback improves the module', 'normal')
            . self::select('qa_certificate', 'Quality assurance certificate confirmed', ['Not confirmed', 'Yes', 'No']));

        $topics = self::details('10. Topic-level templates',
            'Each topic follows the exact UEAB topic template sequence. Topic hours are calculated automatically.',
            '<div id="ubb-topics-wrap"></div>');

        $savedjson = json_encode($saved, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
            | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $modulefields = json_encode(array_merge(schema::module_fields(), ['topics']), JSON_UNESCAPED_SLASHES);
        $topicfields = json_encode(schema::topic_fields(), JSON_UNESCAPED_SLASHES);
        $generateurl = json_encode($state['generate_url'], JSON_UNESCAPED_SLASHES);
        $reseturl = json_encode($state['reset_url'], JSON_UNESCAPED_SLASHES);
        $sesskey = json_encode($state['sesskey']);
        $courseid = (int)$state['course_id'];

        return self::styles() . '<div class="ubb-wrap"><div class="ubb-brand"><span>UEAB</span><div><strong>Course Builder</strong><small>Template-aligned editor</small></div></div>'
            . '<div class="ubb-context">Editing ' . self::e($state['course_title']) . '</div>'
            . '<div class="ubb-format-help"><strong>Structured content:</strong> use blank lines for paragraphs, <code>-</code> for bullets, '
            . '<code>1.</code> for numbered lists, <code>##</code> for headings, and rows such as <code>| Column | Column |</code> for tables.</div>'
            . $institution . $authors . $course . $overview . $courseoverview . $assessment . $resources . $policies . $support . $topics
            . '<div class="ubb-actions"><button class="ubb-btn" id="ubb-save" type="button">Update this course</button>'
            . '<button class="ubb-btn ubb-secondary" id="ubb-reset" type="button">Reset saved form data</button></div>'
            . '<div id="ubb-status" class="ubb-status" role="status" aria-live="polite"></div></div>'
            . self::script($savedjson, $modulefields, $topicfields, $generateurl, $reseturl, $sesskey, $courseid);
    }

    private static function details(string $title, string $description, string $content, bool $open = false): string {
        return '<details class="ubb-section"' . ($open ? ' open' : '') . '><summary><span>' . self::e($title)
            . '</span><small>' . self::e($description) . '</small></summary><div class="ubb-section-body">' . $content . '</div></details>';
    }

    private static function input(string $id, string $label, string $type = 'text', string $min = '', string $max = ''): string {
        $limits = ($min !== '' ? ' min="' . self::e($min) . '"' : '') . ($max !== '' ? ' max="' . self::e($max) . '"' : '');
        return '<label class="ubb-field"><span>' . self::e($label) . '</span><input id="ubb-' . self::e($id)
            . '" class="ubb-input" type="' . self::e($type) . '"' . $limits . '></label>';
    }

    private static function textarea(string $id, string $label, string $size = 'normal', string $hint = ''): string {
        return '<label class="ubb-field"><span>' . self::e($label) . '</span>'
            . ($hint ? '<small>' . self::e($hint) . '</small>' : '')
            . '<textarea id="ubb-' . self::e($id) . '" class="ubb-textarea ubb-' . self::e($size) . '"></textarea></label>';
    }

    private static function select(string $id, string $label, array $options): string {
        $html = '<label class="ubb-field"><span>' . self::e($label) . '</span><select id="ubb-' . self::e($id) . '" class="ubb-select">';
        foreach ($options as $option) {
            $html .= '<option value="' . self::e($option) . '">' . self::e($option) . '</option>';
        }
        return $html . '</select></label>';
    }

    private static function grid(string $left, string $right): string {
        return '<div class="ubb-grid">' . $left . $right . '</div>';
    }

    private static function school_colour_key(): string {
        $items = '';
        foreach (schema::school_colours() as $school => $colour) {
            $items .= '<span class="ubb-palette-item"><i style="--ubb-swatch:' . self::e($colour)
                . '"></i>' . self::e($school) . '</span>';
        }
        return '<aside class="ubb-palette-key" aria-label="School colour key"><strong>Published colour key</strong>'
            . '<div>' . $items . '</div></aside>';
    }

    private static function e(mixed $value): string {
        return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function styles(): string {
        return '<style>
.ubb-wrap{font-family:"Segoe UI",Arial,sans-serif;color:#16253d;font-size:13px}.ubb-brand{display:flex;align-items:center;gap:10px;margin-bottom:8px}.ubb-brand>span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#0b315f;color:#f0b928;font-weight:900}.ubb-brand strong,.ubb-brand small{display:block}.ubb-brand strong{font-size:16px;color:#0b315f}.ubb-brand small{color:#6f7d91}.ubb-context{padding:8px 10px;border-radius:8px;background:#edf5ff;color:#174b8b;font-weight:700}.ubb-format-help{margin:10px 0;padding:10px;border:1px solid #e3d6aa;border-radius:9px;background:#fff9e8;color:#5d4a13;line-height:1.5}.ubb-format-help code{background:#f4ecd2;padding:1px 4px;border-radius:4px}
.ubb-section{margin:8px 0;border:1px solid #dce3ed;border-radius:10px;background:#fff;overflow:hidden}.ubb-section>summary{cursor:pointer;padding:12px 13px;list-style:none;background:#f7f9fc}.ubb-section>summary::-webkit-details-marker{display:none}.ubb-section>summary:after{content:"+";float:right;margin-top:-28px;color:#174b8b;font-size:18px;font-weight:800}.ubb-section[open]>summary:after{content:"-"}.ubb-section>summary span,.ubb-section>summary small{display:block;padding-right:24px}.ubb-section>summary span{font-weight:800;color:#0b315f}.ubb-section>summary small{margin-top:3px;color:#6f7d91;line-height:1.35}.ubb-section-body{padding:12px}
.ubb-field{display:block;margin:0 0 10px}.ubb-field>span{display:block;margin-bottom:4px;color:#53627a;font-size:10px;font-weight:800;letter-spacing:.055em;text-transform:uppercase}.ubb-field>small{display:block;margin:-1px 0 5px;color:#7b8798;line-height:1.4}.ubb-input,.ubb-select,.ubb-textarea{width:100%;box-sizing:border-box;border:1.5px solid #ccd6e4;border-radius:7px;padding:7px 9px;background:#fff;color:#16253d;font:inherit}.ubb-input:focus,.ubb-select:focus,.ubb-textarea:focus{outline:2px solid rgba(23,75,139,.14);border-color:#174b8b}.ubb-textarea{min-height:72px;resize:vertical;line-height:1.55}.ubb-textarea.ubb-large{min-height:130px}.ubb-textarea.ubb-xlarge{min-height:210px}.ubb-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ubb-inline-status{margin:-3px 0 10px;font-size:11px;font-weight:700}.ubb-inline-status.good{color:#14764b}.ubb-inline-status.bad{color:#b12c2c}
.ubb-palette-key{margin:-2px 0 12px;padding:10px;border:1px solid #dce3ed;border-radius:9px;background:#f8fafc}.ubb-palette-key>strong{display:block;margin-bottom:7px;color:#53627a;font-size:10px;letter-spacing:.055em;text-transform:uppercase}.ubb-palette-key>div{display:grid;gap:6px}.ubb-palette-item{display:grid;grid-template-columns:12px minmax(0,1fr);align-items:center;gap:7px;color:#53627a;font-size:11px;line-height:1.3}.ubb-palette-item i{width:12px;height:12px;border-radius:4px;background:var(--ubb-swatch);box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.ubb-topic{margin:9px 0;border:1px solid #d5dfed;border-radius:10px}.ubb-topic>summary{padding:10px 11px;background:#f2f6fb;color:#0b315f;font-weight:800;cursor:pointer}.ubb-topic-body{padding:11px}.ubb-topic-group{margin:12px 0 7px;padding-top:9px;border-top:1px solid #e6ebf2;color:#b77900;font-size:10px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.ubb-topic-total{padding:8px 10px;border-radius:7px;background:#edf7f2;color:#14764b;font-weight:800}
.ubb-actions{position:sticky;bottom:0;display:grid;gap:7px;padding:10px 0;background:linear-gradient(transparent,#fff 18%)}.ubb-btn{width:100%;border:0;border-radius:8px;padding:11px;background:#0b315f;color:#fff;font-weight:800;cursor:pointer}.ubb-btn:disabled{opacity:.55;cursor:not-allowed}.ubb-secondary{background:#fff;color:#174b8b;border:1.5px solid #ccd6e4}.ubb-status{display:none;margin:8px 0;padding:9px 10px;border-radius:8px}.ubb-status.info{display:block;background:#edf5ff;color:#174b8b}.ubb-status.success{display:block;background:#e9f7ef;color:#14764b}.ubb-status.error{display:block;background:#fceceb;color:#a92a2a}
@media(max-width:520px){.ubb-grid{grid-template-columns:1fr}}
</style>';
    }

    private static function script(string $saved, string $modulefields, string $topicfields, string $gen, string $reset, string $sesskey, int $courseid): string {
        return '<script>(function(){
const SAVED=' . $saved . ', MODULE_FIELDS=' . $modulefields . ', TOPIC_FIELDS=' . $topicfields . ';
const GEN=' . $gen . ', RESET=' . $reset . ', SESSKEY=' . $sesskey . ', COURSE_ID=' . $courseid . ';
let revision=Number(SAVED.revision||0), topicState={};
const byId=id=>document.getElementById(id);
const value=id=>{const el=byId("ubb-"+id);return el?String(el.value||"").trim():"";};
const setValue=(id,v)=>{const el=byId("ubb-"+id);if(el&&v!==undefined&&v!==null)el.value=String(v);};
const field=(n,key,label,type="textarea",hint="")=>{const id="ubb-t"+n+"-"+key;if(type==="number")return `<label class="ubb-field"><span>${label}</span><input id="${id}" class="ubb-input ubb-topic-input" data-key="${key}" type="number" min="0" max="5000" step="0.25"></label>`;if(type==="input")return `<label class="ubb-field"><span>${label}</span><input id="${id}" class="ubb-input ubb-topic-input" data-key="${key}" type="text"></label>`;return `<label class="ubb-field"><span>${label}</span>${hint?`<small>${hint}</small>`:""}<textarea id="${id}" class="ubb-textarea ${type==="xlarge"?"ubb-xlarge":type==="large"?"ubb-large":""} ubb-topic-input" data-key="${key}"></textarea></label>`;};
function captureTopics(){document.querySelectorAll(".ubb-topic").forEach(topic=>{const n=Number(topic.dataset.topic);const row=topicState[n]||{};topic.querySelectorAll(".ubb-topic-input").forEach(el=>row[el.dataset.key]=el.value);topicState[n]=row;});}
function topicHtml(n){return `<details class="ubb-topic" data-topic="${n}" ${n===1?"open":""}><summary>Topic ${n}: <span id="ubb-t${n}-summary">Topic ${n}</span></summary><div class="ubb-topic-body">
${field(n,"title","Topic title","input")}${field(n,"welcome_message","Welcome message for the week","large")}${field(n,"aim","Aim / purpose of the topic","large")}${field(n,"description","Brief description of the topic","large")}${field(n,"outcomes","Intended learning outcomes","large","One outcome per line")}
<div class="ubb-topic-group">Learning sequence</div>${field(n,"pretopic_activity","Pre-topic activity description","large")}${field(n,"pretopic_hours","Pre-topic hours","number")}${field(n,"course_content","Course content","xlarge")}${field(n,"activity_overview","Overview of student activity","large")}${field(n,"engagement_plan","Detailed chronological student and teacher engagement plan","xlarge")}${field(n,"f2f_activity","Face-to-face activity description","large")}${field(n,"f2f_hours","Face-to-face hours","number")}${field(n,"online_activity","Online activity description","large")}${field(n,"online_hours","Online activity hours","number")}${field(n,"what","What should students do?","large")}${field(n,"where","Where do they do it?","large")}${field(n,"when","By when should they do it?","normal")}${field(n,"tutor_role","E-moderator / tutor role","large")}${field(n,"assessment_activity","Topic assessment activity","large")}${field(n,"assessment_hours","Topic assessment hours","number")}
<div class="ubb-topic-total" id="ubb-t${n}-total">Total topic time: 0h</div><div class="ubb-topic-group">Connections, resources and feedback</div>${field(n,"topic_links","Links to previous and following topics","large")}${field(n,"resources","Topic learning resources and references","large")}${field(n,"resource_access","How students access the resources","large")}${field(n,"collaboration","Where collaborative work occurs","large")}${field(n,"inclusive_approach","Inclusive-learning and accessibility approach","large")}${field(n,"feedback_collection","How feedback on the topic is obtained","large")}${field(n,"feedback_use","How topic feedback is used","large")}${field(n,"formative_feedback","Points where students receive formative feedback","large")}</div></details>`;}
function renderTopics(){captureTopics();const count=Math.max(1,Math.min(12,Number(value("topics")||9)));const wrap=byId("ubb-topics-wrap");wrap.innerHTML=Array.from({length:count},(_,i)=>topicHtml(i+1)).join("");for(let n=1;n<=count;n++){const row=topicState[n]||SAVED.topicsdata?.[n]||SAVED.topicsdata?.[String(n)]||{};TOPIC_FIELDS.forEach(key=>{const el=byId(`ubb-t${n}-${key}`);if(el&&row[key]!==undefined)el.value=row[key];});bindTopic(n);updateTopic(n);}}
function bindTopic(n){const title=byId(`ubb-t${n}-title`);if(title)title.addEventListener("input",()=>{byId(`ubb-t${n}-summary`).textContent=title.value||`Topic ${n}`;});["pretopic_hours","f2f_hours","online_hours","assessment_hours"].forEach(key=>byId(`ubb-t${n}-${key}`)?.addEventListener("input",()=>updateTopic(n)));}
function updateTopic(n){const title=byId(`ubb-t${n}-title`);if(title)byId(`ubb-t${n}-summary`).textContent=title.value||`Topic ${n}`;const total=["pretopic_hours","f2f_hours","online_hours","assessment_hours"].reduce((s,k)=>s+Number(byId(`ubb-t${n}-${k}`)?.value||0),0);const el=byId(`ubb-t${n}-total`);if(el)el.textContent=`Total topic time: ${Number(total.toFixed(2))}h`;}
function weightTotal(){const text=value("assessment_components");if(!text)return null;const rows=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);let total=0;for(const row of rows){const parts=row.replace(/^\||\|$/g,"").split("|").map(x=>x.trim());if(parts.length<2||!Number.isFinite(Number(parts[1].replace("%",""))))return NaN;total+=Number(parts[1].replace("%",""));}return total;}
function showWeight(){const total=weightTotal(),el=byId("ubb-weight-status");el.className="ubb-inline-status";if(total===null){el.textContent="";return;}if(!Number.isFinite(total)){el.classList.add("bad");el.textContent="Use: Category | Weight % | Description";return;}el.classList.add(Math.abs(total-100)<0.001?"good":"bad");el.textContent=`Assessment weight total: ${total}%${Math.abs(total-100)<0.001?" - ready":" - must equal 100%"}`;}
function status(message,type){const el=byId("ubb-status");el.className=`ubb-status ${type}`;el.innerHTML=message;}
MODULE_FIELDS.forEach(key=>setValue(key,SAVED[key]));topicState=SAVED.topicsdata||{};renderTopics();showWeight();
byId("ubb-topics")?.addEventListener("change",renderTopics);byId("ubb-assessment_components")?.addEventListener("input",showWeight);
byId("ubb-save").addEventListener("click",async()=>{captureTopics();const total=weightTotal();if(total!==null&&(!Number.isFinite(total)||Math.abs(total-100)>=0.001)){status("Assessment weights must be valid and total exactly 100% before publishing.","error");byId("ubb-assessment_components")?.focus();return;}if(!value("title")){status("Module title is required.","error");return;}const count=Math.max(1,Math.min(12,Number(value("topics")||9)));const topics=[];for(let n=1;n<=count;n++){const row={num:n};TOPIC_FIELDS.forEach(key=>row[key]=String(topicState[n]?.[key]??"").trim());topics.push(row);}const body={sesskey:SESSKEY,courseid:COURSE_ID,template:"full",expectedrevision:revision,topicsjson:JSON.stringify(topics),lessonsjson:JSON.stringify(topics)};MODULE_FIELDS.forEach(key=>body[key]=value(key));body.lessons=count;const button=byId("ubb-save");button.disabled=true;button.textContent="Updating course...";status("Publishing the module and topic pages. Please keep this page open.","info");try{const response=await fetch(GEN,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(body)});const data=await response.json();if(!response.ok||!data.success)throw new Error(data.error||"Course update failed.");revision=Number(data.revision||revision+1);status(`Course updated as revision ${revision}. <a href="${data.url}">Open course</a>`,"success");}catch(error){status(String(error.message||error),"error");}finally{button.disabled=false;button.textContent="Update this course";}});
byId("ubb-reset").addEventListener("click",async()=>{if(!confirm("Clear the saved UEAB Course Builder form data? Published Moodle content will remain."))return;const button=byId("ubb-reset");button.disabled=true;try{const response=await fetch(RESET,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({sesskey:SESSKEY,courseid:COURSE_ID})});const data=await response.json();if(!response.ok||!data.success)throw new Error(data.error||"Reset failed.");revision=Number(data.revision||revision+1);status("Saved form data cleared. Reload this page to restore context defaults.","success");}catch(error){status(String(error.message||error),"error");}finally{button.disabled=false;}});
})();</script>';
    }
}
