$content = Get-Content 'apps\web\lib\api.ts' -Raw -Encoding UTF8
$old = 'DiscountValidation { valid: boolean; discountType: "percentage" | "fixed"; discountValue: number; code: string; }'
$new = 'DiscountValidation { discount: { id: string; code: string; type: "percentage" | "fixed"; value: number; }; originalPriceCents: number; discountedPriceCents: number; savingsCents: number; }'
$updated = $content -replace [regex]::Escape($old), $new
[System.IO.File]::WriteAllText((Resolve-Path 'apps\web\lib\api.ts'), $updated, [System.Text.Encoding]::UTF8)
Write-Host "Done"
