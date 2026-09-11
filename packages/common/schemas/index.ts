// ─── Schemas ──────────────────────────────────────────────────────
export {
  userSchema,
  userProfileSchema,
} from "./user.schema.js";
export type { User, UserProfile } from "./user.schema.js";

export {
  signInSchema,
  signUpSchema,
} from "./auth.schema.js";
export type { SignInInput, SignUpInput } from "./auth.schema.js";

export {
  apiResponseSchema,
  apiErrorSchema,
} from "./api.schema.js";
export type { ApiResponse, ApiError } from "./api.schema.js";

export {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productParamsSchema,
  createVariantSchema,
  updateVariantSchema,
  variantParamsSchema,
  PRODUCT_TYPES,
  PRODUCT_STATUSES,
  PRODUCT_CATEGORIES,
  RECURRENCE_OPTIONS,
} from "./product.schema.js";
export type {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
  ProductParams,
  CreateVariantInput,
  UpdateVariantInput,
  VariantParams,
  ProductType,
  ProductStatus,
  ProductCategory,
} from "./product.schema.js";

export {
  setupCreatorSchema,
  updateCreatorSchema,
  creatorUsernameSchema,
} from "./creator.schema.js";
export type {
  SetupCreatorInput,
  UpdateCreatorInput,
  CreatorUsernameParams,
} from "./creator.schema.js";
