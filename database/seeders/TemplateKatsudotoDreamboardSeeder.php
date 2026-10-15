<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Template;
use App\Models\TemplateCategory;
use Illuminate\Database\Seeder;

/**
 * Register the "Katsudoto Dreamboard" invitation template.
 *
 * Standalone & idempotent: safe to run multiple times (updateOrCreate by slug).
 * Requires the template files to be copied first:
 *   - public/templates/katsudoto-dreamboard/ (index.html + assets + thumbnail.jpg)
 *   - resources/js/Pages/Templates/KatsudotoDreamboard/Index.tsx
 *
 * Usage:
 *   php artisan db:seed --class=TemplateKatsudotoDreamboardSeeder
 */
class TemplateKatsudotoDreamboardSeeder extends Seeder
{
    public function run(): void
    {
        $template = Template::updateOrCreate(
            ['slug' => 'katsudoto-dreamboard'],
            [
                'name' => 'Katsudoto Dreamboard',
                'description' => 'Template undangan elegan nuansa gelap dengan ornamen emas, cover dreamboard, countdown, galeri, love story, dan amplop digital.',
                'thumbnail_url' => '/templates/katsudoto-dreamboard/thumbnail.jpg',
                'component_name' => 'KatsudotoDreamboard',
                'is_active' => true,
                'sort_order' => 10,
            ]
        );

        // Attach to the "modern" category when it exists (optional, non-fatal).
        $category = TemplateCategory::where('slug', 'modern')->first();
        if ($category) {
            $template->categories()->syncWithoutDetaching([$category->id]);
        }
    }
}
