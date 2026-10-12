<?php

use App\Http\Controllers\Api\GuestResolveController;
use Illuminate\Support\Facades\Route;

Route::get('/guests/resolve', GuestResolveController::class);
