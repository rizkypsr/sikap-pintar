<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('file_metadata', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->string('storage_path');
            $table->string('mime_type');
            $table->bigInteger('size');
            $table->string('source_action')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('file_id');
            $table->index('created_by');
            $table->index('storage_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_metadata');
    }
};
