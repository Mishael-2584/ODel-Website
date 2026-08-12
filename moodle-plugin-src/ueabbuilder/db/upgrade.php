<?php
defined('MOODLE_INTERNAL') || die();

function xmldb_block_ueabbuilder_upgrade(int $oldversion): bool {
    global $DB;
    $dbman = $DB->get_manager();

    if ($oldversion < 2026040201) {
        $table = new xmldb_table('block_ueabbuilder_data');
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE);
        $table->add_field('courseid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('datajson', XMLDB_TYPE_TEXT, null, null, XMLDB_NOTNULL);
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_key('courseid_uix', XMLDB_KEY_UNIQUE, ['courseid']);
        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }
        upgrade_plugin_savepoint(true, 2026040201, 'block', 'ueabbuilder');
    }

    if ($oldversion < 2026080604) {
        $systemcontext = context_system::instance();
        foreach (get_archetype_roles('editingteacher') as $role) {
            foreach (['block/ueabbuilder:addinstance', 'block/ueabbuilder:generate'] as $capability) {
                if (!$DB->record_exists('role_capabilities', [
                    'roleid' => $role->id, 'contextid' => $systemcontext->id, 'capability' => $capability,
                ])) {
                    assign_capability($capability, CAP_ALLOW, $role->id, $systemcontext->id, false);
                }
            }
        }
        upgrade_plugin_savepoint(true, 2026080604, 'block', 'ueabbuilder');
    }

    if ($oldversion < 2026080605) {
        $datatable = new xmldb_table('block_ueabbuilder_data');
        $fields = [
            new xmldb_field('schemaversion', XMLDB_TYPE_INTEGER, '4', null, XMLDB_NOTNULL, null, '1', 'datajson'),
            new xmldb_field('revision', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0', 'schemaversion'),
            new xmldb_field('source', XMLDB_TYPE_CHAR, '32', null, XMLDB_NOTNULL, null, 'block', 'revision'),
            new xmldb_field('contenthash', XMLDB_TYPE_CHAR, '64', null, XMLDB_NOTNULL, null, '', 'source'),
            new xmldb_field('usermodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0', 'contenthash'),
            new xmldb_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0', 'usermodified'),
        ];
        foreach ($fields as $field) {
            if (!$dbman->field_exists($datatable, $field)) {
                $dbman->add_field($datatable, $field);
            }
        }
        $DB->execute('UPDATE {block_ueabbuilder_data} SET timecreated = timemodified WHERE timecreated = 0');

        $versiontable = new xmldb_table('block_ueabbuilder_versions');
        $versiontable->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE);
        $versiontable->add_field('courseid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $versiontable->add_field('revision', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $versiontable->add_field('source', XMLDB_TYPE_CHAR, '32', null, XMLDB_NOTNULL, null, 'block');
        $versiontable->add_field('contenthash', XMLDB_TYPE_CHAR, '64', null, XMLDB_NOTNULL, null, '');
        $versiontable->add_field('datajson', XMLDB_TYPE_TEXT, null, null, XMLDB_NOTNULL);
        $versiontable->add_field('usermodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $versiontable->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $versiontable->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $versiontable->add_key('course_fk', XMLDB_KEY_FOREIGN, ['courseid'], 'course', ['id']);
        $versiontable->add_key('courserevision_uix', XMLDB_KEY_UNIQUE, ['courseid', 'revision']);
        $versiontable->add_index('coursecreated_ix', XMLDB_INDEX_NOTUNIQUE, ['courseid', 'timecreated']);
        if (!$dbman->table_exists($versiontable)) {
            $dbman->create_table($versiontable);
        }

        $pagetable = new xmldb_table('block_ueabbuilder_pages');
        $pagetable->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE);
        $pagetable->add_field('courseid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $pagetable->add_field('sectionnum', XMLDB_TYPE_INTEGER, '4', null, XMLDB_NOTNULL, null, '0');
        $pagetable->add_field('cmid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $pagetable->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $pagetable->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $pagetable->add_key('course_fk', XMLDB_KEY_FOREIGN, ['courseid'], 'course', ['id']);
        $pagetable->add_key('cm_fk', XMLDB_KEY_FOREIGN, ['cmid'], 'course_modules', ['id']);
        $pagetable->add_key('coursesection_uix', XMLDB_KEY_UNIQUE, ['courseid', 'sectionnum']);
        if (!$dbman->table_exists($pagetable)) {
            $dbman->create_table($pagetable);
        }

        upgrade_plugin_savepoint(true, 2026080605, 'block', 'ueabbuilder');
    }

    if ($oldversion < 2026081200) {
        // Rendering and Topic-link correction; no database schema change is required.
        upgrade_plugin_savepoint(true, 2026081200, 'block', 'ueabbuilder');
    }

    if ($oldversion < 2026081201) {
        // Topic presentation and school colour guidance; no database schema change is required.
        upgrade_plugin_savepoint(true, 2026081201, 'block', 'ueabbuilder');
    }

    if ($oldversion < 2026081202) {
        // Shared publishing engine for the block UI and Faculty Assistant.
        upgrade_plugin_savepoint(true, 2026081202, 'block', 'ueabbuilder');
    }
    return true;
}
