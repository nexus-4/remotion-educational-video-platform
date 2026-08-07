<?php

use App\Http\Controllers\EducationalVideoController;
use Illuminate\Support\Facades\Route;

Route::get('videos', [EducationalVideoController::class, 'index'])->name('educational-videos.index');
Route::get('videos/create', [EducationalVideoController::class, 'create'])->name('educational-videos.create');
Route::post('videos', [EducationalVideoController::class, 'store'])->name('educational-videos.store');
Route::get('videos/{video}', [EducationalVideoController::class, 'show'])->name('educational-videos.show');
