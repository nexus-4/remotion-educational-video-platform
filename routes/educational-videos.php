<?php

use App\Http\Controllers\EducationalVideoController;
use Illuminate\Support\Facades\Route;

Route::get('videos', [EducationalVideoController::class, 'index'])->name('educational-videos.index');
Route::get('videos/create', [EducationalVideoController::class, 'create'])->name('educational-videos.create');
Route::post('videos', [EducationalVideoController::class, 'store'])->name('educational-videos.store');
Route::get('videos/{video}', [EducationalVideoController::class, 'show'])->name('educational-videos.show');
Route::post('videos/{video}/storyboard', [EducationalVideoController::class, 'confirmStoryboard'])->name('educational-videos.storyboard.confirm');
Route::post('videos/{video}/retry', [EducationalVideoController::class, 'retry'])->name('educational-videos.retry');
Route::post('videos/{video}/worksheet', [EducationalVideoController::class, 'generateWorksheet'])->name('educational-videos.worksheet.generate');
Route::get('videos/{video}/worksheet', [EducationalVideoController::class, 'showWorksheet'])->name('educational-videos.worksheet.show');
