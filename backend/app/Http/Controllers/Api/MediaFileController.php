<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Services\FileUploadService;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MediaFileController extends Controller
{
    public function __construct(
        protected FileUploadService $fileService
    ) {}

    /**
     * Upload an uploaded file with server-side validation.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'document_type' => 'nullable|string|max:50',
            'visibility' => 'nullable|string|in:private,public',
        ]);

        $schoolId = SchoolContext::getActiveSchoolId();
        if (!$schoolId) {
            $schoolId = $request->user()?->school_id;
        }

        if (!$schoolId) {
            return response()->json([
                'success' => false,
                'message' => 'No active school context detected for file upload.',
            ], 422);
        }

        $userId = $request->user()?->id;
        $docType = $request->input('document_type', 'general');
        $visibility = $request->input('visibility', 'private');

        try {
            $media = $this->fileService->upload(
                $request->file('file'),
                $schoolId,
                $userId,
                $docType,
                $visibility
            );

            return response()->json([
                'success' => true,
                'message' => 'File uploaded and validated successfully.',
                'data' => [
                    'file_token' => $media->file_token,
                    'original_name' => $media->original_name,
                    'file_size' => $media->file_size,
                    'mime_type' => $media->mime_type,
                    'visibility' => $media->visibility,
                    'document_type' => $media->document_type,
                    'preview_url' => url("/api/v1/files/{$media->file_token}/preview"),
                    'download_url' => url("/api/v1/files/{$media->file_token}/download"),
                ],
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Preview private or public document inline.
     * Enforces school_id check, returning 404 (not 403) on cross-school denial.
     */
    public function preview(Request $request, string $token)
    {
        $schoolId = SchoolContext::getActiveSchoolId();
        $user = $request->user();

        $media = $this->fileService->resolveFileForAccess($token, $schoolId, $user);

        if (!$media) {
            abort(404, 'Requested document was not found.');
        }

        return $this->fileService->streamFile($media, false);
    }

    /**
     * Download private or public document as attachment.
     * Enforces school_id check, returning 404 (not 403) on cross-school denial.
     */
    public function download(Request $request, string $token)
    {
        $schoolId = SchoolContext::getActiveSchoolId();
        $user = $request->user();

        $media = $this->fileService->resolveFileForAccess($token, $schoolId, $user);

        if (!$media) {
            abort(404, 'Requested document was not found.');
        }

        return $this->fileService->streamFile($media, true);
    }

    /**
     * Public asset stream (direct URL fallback when symlinks are broken).
     */
    public function publicStream(string $token)
    {
        $media = MediaFile::withoutGlobalScopes()
            ->where('file_token', $token)
            ->where('visibility', 'public')
            ->first();

        if (!$media) {
            abort(404, 'Public asset was not found.');
        }

        return $this->fileService->streamFile($media, false);
    }
}

