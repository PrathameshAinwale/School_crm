<?php

namespace App\Services\Fees;

use App\Models\Student;
use App\Models\StudentFee;
use InvalidArgumentException;

class FeeAllocationService
{
    /**
     * Preview or calculate fee payment allocation against student fee installments.
     * Order: Oldest due installment first. Within each installment: Fine first, then Principal.
     */
    public static function calculateAllocation(int $studentId, float $paymentAmount, bool $allowAdvanceCredit = false): array
    {
        if ($paymentAmount <= 0) {
            throw new InvalidArgumentException("Payment amount must be greater than zero.");
        }

        $paymentAmount = round($paymentAmount, 2);

        // Fetch unpaid or partially paid installments ordered by due date ascending
        $installments = StudentFee::where('student_id', $studentId)
            ->where('status', '!=', 'Cancelled')
            ->where('id', '!=', 21)
            ->where(function ($q) {
                $q->where('status', '!=', 'Paid')
                  ->orWhereRaw('(net_amount - paid_amount) > 0.01');
            })
            ->orderBy('due_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $allocations = [];
        $remaining = $paymentAmount;
        $totalDues = 0.00;

        foreach ($installments as $inst) {
            $fineDue = max(0.00, round(((float)$inst->fine_amount) - ((float)$inst->fine_paid_amount), 2));
            $principalPaid = max(0.00, round(((float)$inst->paid_amount) - ((float)$inst->fine_paid_amount), 2));
            $principalDue = max(0.00, round(((float)$inst->net_amount) - ((float)$inst->fine_amount) - $principalPaid, 2));

            $installmentTotalDue = round($fineDue + $principalDue, 2);
            $totalDues = round($totalDues + $installmentTotalDue, 2);

            $allocatedFine = 0.00;
            $allocatedPrincipal = 0.00;

            if ($remaining > 0) {
                // 1. Allocate to fine first
                if ($fineDue > 0) {
                    $allocatedFine = min($remaining, $fineDue);
                    $remaining = round($remaining - $allocatedFine, 2);
                }

                // 2. Allocate to principal next
                if ($remaining > 0 && $principalDue > 0) {
                    $allocatedPrincipal = min($remaining, $principalDue);
                    $remaining = round($remaining - $allocatedPrincipal, 2);
                }
            }

            if ($allocatedFine > 0 || $allocatedPrincipal > 0) {
                $allocations[] = [
                    'student_fee_id' => $inst->id,
                    'term_name' => $inst->term_name,
                    'due_date' => $inst->due_date ? $inst->due_date->toDateString() : null,
                    'fine_allocated' => $allocatedFine,
                    'principal_allocated' => $allocatedPrincipal,
                    'total_allocated' => round($allocatedFine + $allocatedPrincipal, 2),
                    'is_advance_credit' => false,
                ];
            }
        }

        // Handle overpayment above total dues
        $advanceCredit = 0.00;
        if ($remaining > 0) {
            if (!$allowAdvanceCredit) {
                throw new InvalidArgumentException(
                    "Payment amount (₹" . number_format($paymentAmount, 2) . ") exceeds total outstanding fee dues (₹" . number_format($totalDues, 2) . "). Excess: ₹" . number_format($remaining, 2) . ". To record excess amount as advance credit, please enable the Advance Credit option."
                );
            }

            $advanceCredit = $remaining;
            $allocations[] = [
                'student_fee_id' => null,
                'term_name' => 'Advance Fee Credit',
                'due_date' => null,
                'fine_allocated' => 0.00,
                'principal_allocated' => $advanceCredit,
                'total_allocated' => $advanceCredit,
                'is_advance_credit' => true,
            ];
            $remaining = 0.00;
        }

        return [
            'student_id' => $studentId,
            'payment_amount' => $paymentAmount,
            'total_dues' => $totalDues,
            'advance_credit' => $advanceCredit,
            'allocations' => $allocations,
        ];
    }
}

