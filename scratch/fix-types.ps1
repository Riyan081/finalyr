$content = Get-Content 'apps\web\lib\api.ts' -Raw -Encoding UTF8

# 1. Add withdrawableRevenueCents to AnalyticsOverview
$old1 = 'export interface AnalyticsOverview {
  totalRevenueCents: number;
  totalSales: number;
  productCount: number;
  followerCount: number;
}'
$new1 = 'export interface AnalyticsOverview {
  totalRevenueCents: number;
  totalSales: number;
  productCount: number;
  followerCount: number;
  withdrawableRevenueCents: number;
  minimumWithdrawalCents: number;
}'
$content = $content.Replace($old1, $new1)

# 2. Add systemRequirements to ApiProduct (after tags line)
$old2 = '  tags: string[];
  salesCount: number;'
$new2 = '  tags: string[];
  systemRequirements?: string | null;
  salesCount: number;'
$content = $content.Replace($old2, $new2)

# 3. Add systemRequirements to CreateProductPayload (after tags line)
$old3 = '  tags?: string[];
}

export interface SetupCreatorPayload'
$new3 = '  tags?: string[];
  systemRequirements?: string | null;
}

export interface SetupCreatorPayload'
$content = $content.Replace($old3, $new3)

[System.IO.File]::WriteAllText((Resolve-Path 'apps\web\lib\api.ts'), $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - all 3 type updates applied"
