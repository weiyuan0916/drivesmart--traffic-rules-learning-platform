<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * BBC Listening — Add segments_source flag.
     *
     * Compliance: .cursor/rules/bbc-feature.mdc
     * The BBC feature must not rehost BBC transcripts or audio. The
     * "user_provided" model allows users to supply their own audio +
     * transcript (which they downloaded from BBC for personal use) so
     * DriveSmart can provide segmenting + scoring without ever storing
     * BBC-derived content.
     *
     * Backwards compatibility: existing rows default to 'legacy_bbc',
     * meaning their metadata_json.segments was set by the deprecated
     * CrawlBbc6MinLessons command. This data will be cleaned up by a
     * separate purge job; until then the UI continues to work for those
     * rows but no new rows are created in this state.
     */
    public function up(): void
    {
        Schema::table('listening_external_lessons', function (Blueprint $table) {
            $table->string('segments_source', 32)->nullable()->after('metadata_json');
            $table->index('segments_source');
        });

        // SQLite doesn't support ADD CONSTRAINT CHECK in ALTER TABLE,
        // so we skip the check constraint for SQLite
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement(
                "ALTER TABLE listening_external_lessons
                 ADD CONSTRAINT listening_external_lessons_segments_source_check
                 CHECK (segments_source IS NULL OR segments_source IN ('legacy_bbc', 'user_provided', 'curated', 'manual'))"
            );
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement(
                'ALTER TABLE listening_external_lessons
                 DROP CONSTRAINT IF EXISTS listening_external_lessons_segments_source_check'
            );
        }

        Schema::table('listening_external_lessons', function (Blueprint $table) {
            $table->dropIndex(['segments_source']);
            $table->dropColumn('segments_source');
        });
    }
};
