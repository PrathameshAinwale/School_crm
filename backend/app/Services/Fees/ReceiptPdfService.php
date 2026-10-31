<?php

namespace App\Services\Fees;

use App\Models\FeePayment;
use App\Models\School;
use App\Models\SchoolSetting;
use Carbon\Carbon;

class ReceiptPdfService
{
    /**
     * Generate HTML or stream PDF for a fee receipt.
     */
    public static function generateReceiptHtml(FeePayment $payment): string
    {
        $payment->loadMissing(['student.schoolClass', 'student.section', 'collector', 'allocations.studentFee', 'academicYear']);
        $school = School::find($payment->school_id);

        $schoolName = SchoolSetting::getDecrypted('school_name', $payment->school_id, $school?->name ?: 'Arch Campus');
        $address = SchoolSetting::getDecrypted('school_address', $payment->school_id, $school?->address ?: 'Campus Road');
        $phone = SchoolSetting::getDecrypted('school_phone', $payment->school_id, $school?->phone ?: '');
        $email = SchoolSetting::getDecrypted('school_email', $payment->school_id, $school?->email ?: '');
        $affiliation = SchoolSetting::getDecrypted('school_affiliation', $payment->school_id, $school?->affiliation ?: 'CBSE');
        $logoUrl = SchoolSetting::getDecrypted('logo_url', $payment->school_id, null);

        $isVoided = ($payment->status === 'voided' || !empty($payment->voided_at));
        $student = $payment->student;
        $className = $student?->schoolClass?->name ?: 'Class 10';
        $sectionName = $student?->section?->name ?: 'A';
        $allocations = $payment->allocations;

        $rowsHtml = '';
        $sn = 1;
        foreach ($allocations as $alloc) {
            $desc = $alloc->is_advance_credit ? 'Advance Fee Credit' : ($alloc->studentFee?->term_name ?: 'Fee Installment');
            $pAmt = (float) $alloc->principal_amount;
            $fAmt = (float) $alloc->fine_amount;
            $total = $pAmt + $fAmt;

            $rowsHtml .= "<tr>
                <td style='border: 1px solid #e2e8f0; padding: 8px; text-align: center;'>{$sn}</td>
                <td style='border: 1px solid #e2e8f0; padding: 8px;'>{$desc}</td>
                <td style='border: 1px solid #e2e8f0; padding: 8px; text-align: right;'>₹" . number_format($pAmt, 2) . "</td>
                <td style='border: 1px solid #e2e8f0; padding: 8px; text-align: right;'>₹" . number_format($fAmt, 2) . "</td>
                <td style='border: 1px solid #e2e8f0; padding: 8px; text-align: right; font-weight: bold;'>₹" . number_format($total, 2) . "</td>
            </tr>";
            $sn++;
        }

        $watermarkHtml = $isVoided ? "
            <div style='position: absolute; top: 35%; left: 15%; width: 70%; text-align: center; transform: rotate(-35deg); font-size: 90px; font-weight: 900; color: rgba(220, 38, 38, 0.18); border: 8px solid rgba(220, 38, 38, 0.22); border-radius: 12px; pointer-events: none; z-index: 100; letter-spacing: 12px; text-transform: uppercase;'>
                VOID
            </div>
        " : "";

        $voidInfoHtml = $isVoided ? "
            <div style='margin-top: 15px; padding: 10px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; font-size: 11px;'>
                <strong>PAYMENT VOIDED:</strong> Voided on " . ($payment->voided_at ? $payment->voided_at->format('M d, Y h:i A') : '—') . " by " . ($payment->voider?->name ?: 'Administrator') . ". Reason: " . htmlspecialchars($payment->void_reason ?: 'Administrative reversal') . "
            </div>
        " : "";

        $modeLabel = match($payment->payment_mode) {
            'cash' => 'Cash',
            'cheque' => 'Cheque (' . ($payment->bank_name ?: 'Bank') . ' No: ' . ($payment->reference_number ?: '—') . ')',
            'bank_transfer' => 'Bank Transfer / NEFT (UTR: ' . ($payment->reference_number ?: '—') . ')',
            'upi_manual' => 'UPI (Txn Ref: ' . ($payment->reference_number ?: '—') . ')',
            default => strtoupper($payment->payment_mode),
        };

        return "<!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Fee Receipt - {$payment->receipt_number}</title>
            <style>
                @page { size: A4 portrait; margin: 15mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
                .receipt-box { max-width: 750px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; position: relative; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class='receipt-box'>
                {$watermarkHtml}
                <table style='border: none; margin-bottom: 20px;'>
                    <tr>
                        <td style='width: 70%; vertical-align: top;'>
                            <h2 style='margin: 0 0 4px 0; color: #0f172a; font-size: 20px;'>{$schoolName}</h2>
                            <p style='margin: 0; color: #64748b; font-size: 11px;'>Affiliation: {$affiliation} | {$address}</p>
                            <p style='margin: 2px 0 0 0; color: #64748b; font-size: 11px;'>Contact: {$phone} | {$email}</p>
                        </td>
                        <td style='width: 30%; text-align: right; vertical-align: top;'>
                            <h3 style='margin: 0; color: #0f172a; font-size: 14px;'>FEE RECEIPT</h3>
                            <p style='margin: 4px 0 0 0; font-weight: bold; font-family: monospace; font-size: 13px; color: #3b82f6;'>{$payment->receipt_number}</p>
                            <p style='margin: 2px 0 0 0; font-size: 10px; color: #64748b;'>Date: " . Carbon::parse($payment->payment_date)->format('M d, Y') . "</p>
                        </td>
                    </tr>
                </table>

                <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 15px;'>
                    <table style='border: none; margin: 0;'>
                        <tr>
                            <td style='width: 50%; padding: 3px 0;'><strong>Student Name:</strong> {$student?->full_name}</td>
                            <td style='width: 50%; padding: 3px 0;'><strong>Admission No:</strong> {$student?->admission_number}</td>
                        </tr>
                        <tr>
                            <td style='padding: 3px 0;'><strong>Class & Division:</strong> {$className} - {$sectionName}</td>
                            <td style='padding: 3px 0;'><strong>Academic Year:</strong> " . ($payment->academicYear?->name ?: '2026-2027') . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 3px 0;'><strong>Parent / Guardian:</strong> " . ($student?->guardian_name ?: ($student?->father_name ?: 'Parent')) . "</td>
                            <td style='padding: 3px 0;'><strong>Payment Mode:</strong> {$modeLabel}</td>
                        </tr>
                    </table>
                </div>

                <table>
                    <thead>
                        <tr style='background-color: #f1f5f9;'>
                            <th style='border: 1px solid #cbd5e1; padding: 8px; width: 40px; text-align: center;'>#</th>
                            <th style='border: 1px solid #cbd5e1; padding: 8px; text-align: left;'>Fee Description / Head</th>
                            <th style='border: 1px solid #cbd5e1; padding: 8px; text-align: right; width: 120px;'>Principal</th>
                            <th style='border: 1px solid #cbd5e1; padding: 8px; text-align: right; width: 100px;'>Fine</th>
                            <th style='border: 1px solid #cbd5e1; padding: 8px; text-align: right; width: 120px;'>Total Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$rowsHtml}
                        <tr style='background-color: #f8fafc; font-weight: bold;'>
                            <td colspan='4' style='border: 1px solid #cbd5e1; padding: 10px; text-align: right;'>GRAND TOTAL RECEIVED:</td>
                            <td style='border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-size: 14px; color: #047857;'>₹" . number_format($payment->amount_paid, 2) . "</td>
                        </tr>
                    </tbody>
                </table>

                {$voidInfoHtml}

                <div style='margin-top: 35px;'>
                    <table style='border: none;'>
                        <tr>
                            <td style='width: 50%; font-size: 10px; color: #94a3b8;'>
                                <p style='margin: 0;'>• This is a computer-generated fee receipt.</p>
                                <p style='margin: 2px 0 0 0;'>• Tuition fee portion is eligible for deduction under 80C.</p>
                            </td>
                            <td style='width: 50%; text-align: right;'>
                                <div style='border-top: 1px dashed #94a3b8; display: inline-block; padding-top: 4px; width: 180px; text-align: center;'>
                                    <span style='font-size: 10px; font-weight: bold;'>Authorized Cashier</span><br>
                                    <span style='font-size: 9px; color: #64748b;'>" . ($payment->collector?->name ?: 'Accounts Desk') . "</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </body>
        </html>";
    }

    /**
     * Download or stream PDF receipt.
     */
    public static function streamReceiptPdf(FeePayment $payment)
    {
        $html = self::generateReceiptHtml($payment);

        if (class_exists('Dompdf\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf(['isRemoteEnabled' => true]);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            return response($dompdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"receipt-{$payment->receipt_number}.pdf\"",
            ]);
        }

        // Compliant HTML printable fallback stream
        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}

