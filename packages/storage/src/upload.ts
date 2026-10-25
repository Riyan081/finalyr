import { PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storageClient, BUCKET_NAME } from "./client.js";
import crypto from "crypto";

/** Wildcard MIME patterns allowed for digital goods (code, media, 3D, fonts) */
const ALLOWED_MIME_PATTERNS = [
  /^text\//i,   // Source code, scripts, markup, plain text, markdown, config
  /^image\//i,  // Images, textures, graphics, RAW, PSD
  /^audio\//i,  // Audio files, music, sound FX, podcasts
  /^video\//i,  // Video files, tutorials, courses
  /^model\//i,  // 3D models (GLTF, GLB, OBJ, STL)
  /^font\//i,   // Fonts (TTF, OTF, WOFF, WOFF2)
];

/** Specific allowed application/* MIME types for digital goods */
const ALLOWED_APPLICATION_MIME_TYPES = new Set([
  // Documents & eBooks
  "application/pdf",
  "application/epub+zip",
  "application/x-mobipocket-ebook",
  "application/vnd.amazon.ebook",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/rtf",

  // Archives & Compressed Packages
  "application/zip",
  "application/x-zip-compressed",
  "application/s-compressed",
  "multipart/x-zip",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-rar",
  "application/x-tar",
  "application/tar",
  "application/gzip",
  "application/x-gzip",
  "application/x-bzip2",
  "application/x-xz",
  "application/zstd",

  // Code, Scripts & Data
  "application/json",
  "application/ld+json",
  "application/xml",
  "application/x-yaml",
  "application/javascript",
  "application/x-javascript",
  "application/typescript",
  "application/x-python-code",
  "application/x-sh",
  "application/sql",
  "application/wasm",
  "application/java-archive",

  // Creative & 3D software formats
  "application/x-blender",
  "application/x-photoshop",
  "application/postscript",
  "application/x-tgif",
  "application/vnd.adobe.photoshop",

  // Software Installers & Binaries
  "application/x-msdownload",
  "application/x-dosexec",
  "application/vnd.microsoft.portable-executable",
  "application/x-msi",
  "application/x-apple-diskimage",
  "application/x-deb",
  "application/vnd.debian.binary-package",
  "application/x-rpm",
  "application/x-executable",
  "application/vnd.android.package-archive",

  // Generic Binary (standard browser fallback for unknown file types)
  "application/octet-stream",
]);

/** Known allowed digital product file extensions */
const ALLOWED_EXTENSIONS = new Set([
  // Scripts & Code
  "py", "pyw", "js", "mjs", "cjs", "ts", "tsx", "jsx", "html", "htm", "css", "scss", "sass", "less",
  "c", "cpp", "h", "hpp", "cc", "cs", "java", "jar", "go", "rs", "rb", "php", "sh", "bash", "zsh",
  "ps1", "lua", "swift", "r", "sql", "json", "xml", "yaml", "yml", "md", "txt", "csv", "tsv", "ini", "env",
  // Software & Installers
  "exe", "msi", "dmg", "pkg", "deb", "rpm", "appimage", "apk", "aab", "ipa", "bin",
  // Archives
  "zip", "7z", "rar", "tar", "gz", "tgz", "bz2", "xz", "zst",
  // 3D & Creative
  "blend", "fbx", "obj", "gltf", "glb", "stl", "dae", "3ds", "c4d", "max", "ma", "mb", "unitypackage",
  "psd", "ai", "eps", "fig", "sketch", "xd", "abr", "atn", "pat", "cube", "look", "xmp", "dng",
  "lrtemplate", "prproj", "aep", "mogrt", "drp",
  // Fonts
  "ttf", "otf", "woff", "woff2", "eot",
  // Documents & eBooks
  "pdf", "epub", "mobi", "azw", "azw3", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "rtf",
  // Media
  "png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "tiff", "ico",
  "mp3", "wav", "ogg", "flac", "aac", "m4a", "aiff", "mid", "midi",
  "mp4", "webm", "mov", "mkv", "avi", "wmv", "m4v"
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

/**
 * Validate file metadata before generating upload URL or storing file.
 * Throws on invalid input.
 */
export function validateFileUpload(fileType: string, fileSizeBytes: number, fileName?: string) {
  const normType = (fileType || "").trim().toLowerCase();

  const matchesPattern = ALLOWED_MIME_PATTERNS.some((pattern) => pattern.test(normType));
  const matchesExplicit = ALLOWED_APPLICATION_MIME_TYPES.has(normType);

  let matchesExt = false;
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext && ALLOWED_EXTENSIONS.has(ext)) {
      matchesExt = true;
    }
  }

  // Allow if matches wildcard pattern, explicit application MIME list, or valid file extension
  if (!matchesPattern && !matchesExplicit && !matchesExt) {
    throw new Error(
      `File type "${fileType || "unknown"}" is not allowed for product uploads. Supported formats include source code (.py, .js, .ts), software executables, archives (.zip, .rar, .7z), documents (.pdf, .epub), audio, video, 3D assets, and creative presets.`
    );
  }

  if (fileSizeBytes > MAX_FILE_SIZE) {
    throw new Error(
      `File size ${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB exceeds the maximum 5 GB limit`
    );
  }
}

/**
 * Generate a unique S3 object key for a product file.
 * Format: products/{productId}/{randomId}-{originalName}
 */
export function generateFileKey(productId: string, fileName: string): string {
  const id = crypto.randomUUID().slice(0, 8);
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `products/${productId}/${id}-${sanitized}`;
}

/**
 * Generate a presigned PUT URL for direct browser → MinIO upload.
 * The browser uploads directly to storage — never through our Express server.
 *
 * @returns { uploadUrl, fileKey } — the URL to PUT to & the key to save in DB
 */
export async function generateUploadUrl(
  productId: string,
  fileName: string,
  fileType: string,
  fileSizeBytes: number
): Promise<{ uploadUrl: string; fileKey: string }> {
  validateFileUpload(fileType, fileSizeBytes, fileName);

  const fileKey = generateFileKey(productId, fileName);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(storageClient, command, {
    expiresIn: 3600, // 1 hour to complete upload
  });

  return { uploadUrl, fileKey };
}

/**
 * Directly upload a file buffer to S3 / MinIO storage.
 */
export async function uploadBuffer(
  fileKey: string,
  buffer: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await ensureBucketExists();
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
  });
  await storageClient.send(command);
}

/**
 * Ensure the storage bucket exists. Call once at startup.
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    await storageClient.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch {
    await storageClient.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`[Storage] Created bucket: ${BUCKET_NAME}`);
  }

  // Ensure public read policy so browser can load product thumbnails & assets without 403 Forbidden
  try {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetBucketLocation", "s3:ListBucket"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}`],
        },
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await storageClient.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(policy),
      })
    );
  } catch (err: any) {
    console.warn(`[Storage] Could not set public bucket policy on ${BUCKET_NAME}:`, err.message);
  }
}
