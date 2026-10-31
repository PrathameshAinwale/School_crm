<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunicationTemplate;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CommunicationTemplateController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = CommunicationTemplate::orderBy('name', 'asc');

        if ($request->filled('channel') && $request->channel !== 'all') {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('message_category', $request->category);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('communication_templates', 'code')->where('school_id', $schoolId),
            ],
            'channel' => 'required|string|in:sms,whatsapp,email,push,in_app',
            'message_category' => 'nullable|string|in:transactional,promotional,emergency',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'dlt_template_id' => 'nullable|string|max:50',
            'dlt_header' => 'nullable|string|max:20',
            'whatsapp_template_name' => 'nullable|string|max:100',
            'whatsapp_language' => 'nullable|string|max:20',
            'meta_variable_mapping' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $template = CommunicationTemplate::create([
            'school_id' => $schoolId,
            ...$validated,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template created successfully.',
            'data' => $template,
        ], 201);
    }

    public function show($id)
    {
        $template = CommunicationTemplate::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    public function update(Request $request, $id)
    {
        $template = CommunicationTemplate::findOrFail($id);
        $schoolId = $request->user()->school_id;

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('communication_templates', 'code')->where('school_id', $schoolId)->ignore($template->id),
            ],
            'channel' => 'required|string|in:sms,whatsapp,email,push,in_app',
            'message_category' => 'nullable|string|in:transactional,promotional,emergency',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'dlt_template_id' => 'nullable|string|max:50',
            'dlt_header' => 'nullable|string|max:20',
            'whatsapp_template_name' => 'nullable|string|max:100',
            'whatsapp_language' => 'nullable|string|max:20',
            'meta_variable_mapping' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully.',
            'data' => $template,
        ]);
    }

    public function destroy($id)
    {
        $template = CommunicationTemplate::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully.',
        ]);
    }
}

