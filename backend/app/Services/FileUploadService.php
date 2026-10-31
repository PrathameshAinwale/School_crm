<?php

namespace App\Services;

use App\Models\MediaFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FileUploadService
{
    /**
     * Allowed MIME types and their mapped extensions.
     */
    protected const ALLOWED_MIME_TYPES = [
        // Images (2MB max)
        'image/jpeg' => ['jpg', 'jpeg'],
        'image/png' => ['png'],
        'image/webp' => ['webp'],
        'image/svg+xml' => ['svg'],

        // Documents (10MB max)
        'application/pdf' => ['pdf'],
        'application/msword' => ['doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => ['docx'],
        'application/vnd.ms-excel' => ['xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => ['xlsx'],
        'text/csv' => ['csv'],
        'text/plain' => ['txt'],
    ];

    protected const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
    protected const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    /**
     * Upload an incoming file with strict server-side MIME and size validation.
     */
    public function upload(
        UploadedFile $file,
        int $schoolId,
        ?int $userId = null,
        string $documentType = 'general',
        string $visibility = 'private'
    ): MediaFile {
        // 1. Inspect real server-side MIME type via fileinfo
        $realMime = $this->detectRealMimeType($file);

        if (!array_key_exists($realMime, self::ALLOWED_MIME_TYPES)) {
            throw new InvalidArgumentException(
                "Unsupported file format ({$realMime}). Allowed types are PDF, DOCX, XLSX, CSV, TXT, JPEG, PNG, WEBP, SVG."
            );
        }

        $fileSize = $file->getSize();
        $isImage = str_starts_with($realMime, 'image/');

        // 2. Validate Size Limit
        if ($isImage && $fileSize > self::MAX_IMAGE_SIZE_BYTES) {
            throw new InvalidArgumentException("Image file exceeds the 2 MB maximum size limit.");
        }

        if (!$isImage && $fileSize > self::MAX_DOCUMENT_SIZE_BYTES) {
            throw new InvalidArgumentException("Document file exceeds the 10 MB maximum size limit.");
        }

        // 3. Resolve safe extension based on detected real MIME type (ignoring client spoofing)
        $allowedExtensions = self::ALLOWED_MIME_TYPES[$realMime];
        $clientExt = strtolower($file->getClientOriginalExtension());
        $safeExtension = in_array($clientExt, $allowedExtensions, true) ? $clientExt : $allowedExtensions[0];

        // 4. Generate unguessable UUID token and stored name
        $fileToken = (string) Str::uuid();
        $storedName = "{$fileToken}.{$safeExtension}";

        $diskName = ($visibility === 'public') ? 'public' : 'local';
        $subFolder = "schools/{$schoolId}/{$documentType}";
        $storagePath = "{$subFolder}/{$storedName}";

        // 5. Store file on disk
        $disk = Storage::disk($diskName);
        $disk->putFileAs($subFolder, $file, $storedName);

        // 6. Record MediaFile in database
        return MediaFile::withoutGlobalScopes()->create([
            'school_id' => $schoolId,
            'user_id' => $userId,
            'file_token' => $fileToken,
            'original_name' => strip_tags(basename($file->getClientOriginalName())),
            'stored_name' => $storedName,
            'file_path' => $storagePath,
            'file_size' => $fileSize,
            'mime_type' => $realMime,
            'disk' => $diskName,
            'visibility' => $visibility,
            'document_type' => $documentType,
        ]);
    }

    /**
     * Detect real MIME type using PHP Fileinfo.
     */
    protected function detectRealMimeType(UploadedFile $file): string
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $path = $file->getRealPath();
        $mime = finfo_file($finfo, $path);
        finfo_close($finfo);

        if ($mime) {
            return strtolower($mime);
        }

        return strtolower($file->getMimeType() ?: 'application/octet-stream');
    }

    /**
     * Resolve a MediaFile by token and assert active school ownership.
     * Returns null if not found or cross-school (enforces 404).
     */
    public function resolveFileForAccess(string $token, ?int $activeSchoolId, ?User $user): ?MediaFile
    {
        $media = MediaFile::withoutGlobalScopes()->where('file_token', $token)->first();

        if (!$media) {
            return null;
        }

        // Public files can be previewed directly without school restriction
        if ($media->isPublic()) {
            return $media;
        }

        // Private files require authenticated user and active school_id match (or super_admin)
        if (!$user) {
            return null;
        }

        if ($user->role === 'super_admin') {
            return $media;
        }

        // Return null (to trigger 404) if accessing a file belonging to a different school
        // Normal admin and all school roles are restricted strictly to their home school
        $effectiveSchoolId = $user->school_id ? (int)$user->school_id : (int)$activeSchoolId;
        if ((int)$media->school_id !== $effectiveSchoolId) {
            return null;
        }

        return $media;
    }

    /**
     * Stream binary response for preview or download.
     */
    public function streamFile(MediaFile $media, bool $isDownload = false): BinaryFileResponse
    {
        $disk = Storage::disk($media->disk);
        $fullPath = $disk->path($media->file_path);

        if (!file_exists($fullPath)) {
            abort(404, 'File not found on storage disk.');
        }

        $headers = [
            'Content-Type' => $media->mime_type,
            'Content-Length' => $media->file_size,
        ];

        if ($media->isPublic()) {
            $headers['Cache-Control'] = 'public, max-age=31536000'; // 1 year cache for public assets
        } else {
            $headers['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
        }

        $disposition = $isDownload ? 'attachment' : 'inline';

        return response()->download($fullPath, $media->original_name, $headers, $disposition);
    }
}

