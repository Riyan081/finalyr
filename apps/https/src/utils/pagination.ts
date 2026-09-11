/**
 * Standardized pagination utilities.
 * Ensures consistent pagination responses across all list endpoints.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Build pagination metadata from query params and total count.
 */
export function buildPagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Calculate the Prisma `skip` value from page and limit.
 */
export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Build a Prisma `orderBy` object from sort field and order direction.
 */
export function buildOrderBy(
  sort: string,
  order: "asc" | "desc"
): Record<string, "asc" | "desc"> {
  return { [sort]: order };
}
