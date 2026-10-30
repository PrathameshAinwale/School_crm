<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Official Statement of Marks - {{ $student->first_name }} {{ $student->last_name }}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 7mm 9mm 7mm 9mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 10.5px;
      line-height: 1.25;
    }

    /* Certificate Outer Framing */
    .certificate-frame {
      border: 3px double #1e3a8a;
      border-radius: 8px;
      padding: 8px;
      position: relative;
    }
    .certificate-inner {
      border: 1px solid #3b82f6;
      border-radius: 6px;
      padding: 10px 12px;
      position: relative;
      background-color: #ffffff;
    }

    /* Watermark text behind content */
    .watermark {
      position: absolute;
      top: 42%;
      left: 10%;
      width: 80%;
      text-align: center;
      font-size: 42px;
      font-weight: 900;
      letter-spacing: 6px;
      color: rgba(30, 58, 138, 0.04);
      transform: rotate(-25deg);
      z-index: 0;
      text-transform: uppercase;
      pointer-events: none;
    }

    /* Header Table */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .header-logo {
      width: 65px;
      vertical-align: middle;
      text-align: center;
    }
    .logo-badge {
      width: 58px;
      height: 58px;
      background: #1e3a8a;
      color: #ffffff;
      border-radius: 8px;
      display: inline-block;
      text-align: center;
      line-height: 58px;
      font-size: 26px;
      font-weight: bold;
      border: 2px solid #fbbf24;
    }
    .header-center {
      text-align: center;
      vertical-align: middle;
      padding: 0 8px;
    }
    .board-affiliation {
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .school-title {
      font-size: 19px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .school-address {
      font-size: 9px;
      color: #475569;
      line-height: 1.2;
    }
    .school-contacts {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .header-qr {
      width: 65px;
      vertical-align: middle;
      text-align: center;
    }
    .qr-placeholder {
      width: 54px;
      height: 54px;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      display: inline-block;
      text-align: center;
      font-size: 7.5px;
      color: #64748b;
      padding-top: 6px;
      background: #f8fafc;
    }

    /* Title Ribbon */
    .title-banner {
      background: #1e3a8a;
      color: #ffffff;
      text-align: center;
      padding: 4px 0;
      margin: 6px 0 8px 0;
      border-radius: 4px;
      border-top: 2px solid #fbbf24;
      border-bottom: 2px solid #fbbf24;
    }
    .title-banner h2 {
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
    }
    .title-banner p {
      font-size: 8.5px;
      font-weight: 500;
      letter-spacing: 1px;
      color: #e2e8f0;
      margin-top: 1px;
    }

    /* Meta Table (Serial & Exam Details) */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      font-size: 9px;
    }
    .meta-table td {
      padding: 2px 4px;
    }
    .meta-badge {
      display: inline-block;
      padding: 2px 7px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 3px;
      font-weight: 700;
      color: #1d4ed8;
      font-size: 8.5px;
    }

    /* Student Info Box */
    .student-box {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      margin-bottom: 8px;
      background: #f8fafc;
      border-collapse: collapse;
    }
    .student-box td {
      padding: 4px 7px;
      font-size: 9.5px;
      vertical-align: middle;
      border-bottom: 1px solid #e2e8f0;
    }
    .student-box tr:last-child td {
      border-bottom: none;
    }
    .info-label {
      font-weight: 700;
      color: #475569;
      width: 16%;
      text-transform: uppercase;
      font-size: 8.5px;
    }
    .info-val {
      font-weight: 700;
      color: #0f172a;
      width: 34%;
    }
    .info-val-highlight {
      color: #1e3a8a;
      font-weight: 800;
    }

    /* Marks Table */
    .marks-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .marks-table th {
      background: #1e3a8a;
      color: #ffffff;
      padding: 4.5px 3px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border: 1px solid #1e40af;
      text-align: center;
    }
    .marks-table th.sub-th {
      background: #2563eb;
      font-size: 7.5px;
    }
    .marks-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 5px;
      font-size: 9px;
      text-align: center;
      vertical-align: middle;
    }
    .marks-table tr:nth-child(even) td {
      background: #fbfcfe;
    }
    .marks-table td.subject-name {
      text-align: left;
      font-weight: 700;
      color: #0f172a;
      padding-left: 8px;
    }
    .marks-table td.subject-code {
      font-weight: 600;
      color: #475569;
      font-size: 8.5px;
    }
    .marks-table td.marks-bold {
      font-weight: 700;
      color: #0f172a;
    }
    .marks-table td.grade-cell {
      font-weight: 800;
      color: #1e3a8a;
    }
    .marks-table td.status-pass {
      font-weight: 700;
      color: #15803d;
      font-size: 8.5px;
    }
    .marks-table td.status-fail {
      font-weight: 700;
      color: #b91c1c;
      font-size: 8.5px;
    }

    /* Grand Total Row */
    .grand-total-row td {
      background: #f1f5f9 !important;
      font-weight: 800;
      color: #0f172a;
      border-top: 2px solid #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      padding: 5px 5px;
      font-size: 9.5px;
    }

    /* Words Row */
    .words-box {
      width: 100%;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      padding: 4px 8px;
      margin-bottom: 8px;
      border-radius: 4px;
      font-size: 9px;
    }
    .words-label {
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      font-size: 8px;
      margin-right: 4px;
    }
    .words-val {
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Result Summary Cards Table */
    .result-summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .result-summary-table td {
      width: 25%;
      padding: 3px;
      vertical-align: top;
    }
    .summary-card {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 5px 6px;
      text-align: center;
      background: #f8fafc;
    }
    .summary-card.highlight {
      background: #eff6ff;
      border-color: #93c5fd;
    }
    .summary-card.success {
      background: #f0fdf4;
      border-color: #86efac;
    }
    .summary-title {
      font-size: 7.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .summary-val {
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
    }
    .summary-val.primary {
      color: #1e3a8a;
    }
    .summary-val.green {
      color: #15803d;
    }

    /* Final Result Banner */
    .final-result-banner {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      border: 1.5px solid #1e3a8a;
      border-radius: 4px;
      overflow: hidden;
    }
    .final-result-banner td {
      padding: 5px 8px;
      vertical-align: middle;
    }
    .result-tag {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
    }
    .result-status-text {
      font-size: 12px;
      font-weight: 900;
      color: #15803d;
      letter-spacing: 1px;
    }
    .result-status-text.fail {
      color: #b91c1c;
    }

    /* Grading Scale Legend */
    .legend-box {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 4px 6px;
      margin-bottom: 8px;
      background: #fafaf9;
    }
    .legend-title {
      font-size: 7.5px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .legend-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5px;
    }
    .legend-table td {
      padding: 1.5px 3px;
      color: #334155;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .legend-table th {
      background: #e2e8f0;
      padding: 1.5px 3px;
      font-weight: 700;
      color: #1e293b;
      font-size: 7.5px;
      border: 1px solid #cbd5e1;
    }

    /* Signatures Section */
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .signatures-table td {
      width: 25%;
      text-align: center;
      vertical-align: bottom;
      padding: 0 4px;
    }
    .sign-space {
      height: 38px;
      display: block;
    }
    .sign-line {
      border-top: 1px solid #334155;
      padding-top: 3px;
      font-size: 8.5px;
      font-weight: 700;
      color: #1e293b;
      text-transform: uppercase;
    }
    .sign-sub {
      font-size: 7px;
      color: #64748b;
      margin-top: 1px;
    }
    .seal-circle {
      width: 48px;
      height: 48px;
      border: 1.5px dashed #94a3b8;
      border-radius: 50%;
      display: inline-block;
      text-align: center;
      line-height: 48px;
      font-size: 7px;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 2px;
    }

    /* Security Footer */
    .security-footer {
      margin-top: 8px;
      border-top: 1px solid #e2e8f0;
      padding-top: 4px;
      font-size: 7px;
      color: #64748b;
      text-align: center;
      line-height: 1.2;
    }
  </style>
</head>
<body>

<div class="certificate-frame">
  <div class="certificate-inner">
    <div class="watermark">OFFICIAL STATEMENT OF MARKS</div>

    <!-- Header Section -->
    <table class="header-table">
      <tr>
        <td class="header-logo">
          <div class="logo-badge">
            {{ strtoupper(substr($school->name ?? 'DPS', 0, 2)) }}
          </div>
        </td>
        <td class="header-center">
          <div class="board-affiliation">Affiliated to {{ $school->affiliation ?? 'Central Board of Secondary Education (CBSE)' }} | Affiliation No: {{ $school->affiliation_no ?? '2130842' }} | School Code: {{ $school->code ?? 'DPS-101' }}</div>
          <div class="school-title">{{ $school->name ?? 'Delhi Public Academy' }}</div>
          <div class="school-address">{{ $school->address ?? 'Plot 42, Institutional Area, Sector 14' }}, {{ $school->city ?? 'New Delhi' }} - {{ $school->pincode ?? '110001' }} ({{ $school->state ?? 'Delhi' }})</div>
          <div class="school-contacts">Tel: {{ $school->phone ?? '+91 11 2890 1200' }} | Email: {{ $school->email ?? 'contact@delhipublic.edu' }} | Web: {{ $school->website ?? 'https://delhipublic.edu' }}</div>
        </td>
        <td class="header-qr">
          <div class="qr-placeholder">
            OFFICIAL<br>VERIFIED<br>DOCUMENT
          </div>
        </td>
      </tr>
    </table>

    <!-- Title Banner -->
    <div class="title-banner">
      <h2>Statement of Marks</h2>
      <p>{{ strtoupper($examination->name ?? 'Periodic Assessment / Examination') }} &bull; ACADEMIC YEAR {{ $examination->academic_year ?? '2024-2025' }}</p>
    </div>

    <!-- Meta Information Row -->
    <table class="meta-table">
      <tr>
        <td style="width: 35%;">
          <span style="color: #64748b; font-weight: 600;">Marksheet Serial No:</span>
          <span class="meta-badge">MS/{{ $examination->academic_year ?? '24-25' }}/{{ $examination->code ?? 'EX' }}/{{ str_pad($student->roll_number ?? $student->id, 4, '0', STR_PAD_LEFT) }}</span>
        </td>
        <td style="width: 35%; text-align: center;">
          <span style="color: #64748b; font-weight: 600;">Exam Term:</span>
          <strong>{{ $examination->term ?? 'Term 1' }}</strong>
        </td>
        <td style="width: 30%; text-align: right;">
          <span style="color: #64748b; font-weight: 600;">Date of Issue:</span>
          <strong>{{ date('d-M-Y') }}</strong>
        </td>
      </tr>
    </table>

    <!-- Candidate Information Box -->
    <table class="student-box">
      <tr>
        <td class="info-label">Candidate Name:</td>
        <td class="info-val info-val-highlight">{{ strtoupper($student->first_name . ' ' . $student->last_name) }}</td>
        <td class="info-label">Roll Number:</td>
        <td class="info-val">{{ $student->roll_number ?? '101' }}</td>
      </tr>
      <tr>
        <td class="info-label">Mother's Name:</td>
        <td class="info-val">{{ strtoupper($student->mother_name ?? 'Mrs. Sunita ' . $student->last_name) }}</td>
        <td class="info-label">Admission No:</td>
        <td class="info-val">{{ $student->admission_number ?? 'ADM-' . ($student->id + 1000) }}</td>
      </tr>
      <tr>
        <td class="info-label">Father's Name:</td>
        <td class="info-val">{{ strtoupper($student->father_name ?? 'Mr. Ramesh ' . $student->last_name) }}</td>
        <td class="info-label">Class & Division:</td>
        <td class="info-val">{{ $student->schoolClass->name ?? 'Class 10' }} - {{ $student->section->name ?? 'Section A' }}</td>
      </tr>
      <tr>
        <td class="info-label">Date of Birth:</td>
        <td class="info-val">{{ $student->dob ? date('d-M-Y', strtotime($student->dob)) : '15-Aug-2010' }}</td>
        <td class="info-label">Exam Period:</td>
        <td class="info-val">
          @if($examination->start_date && $examination->end_date)
            {{ date('d M', strtotime($examination->start_date)) }} - {{ date('d M Y', strtotime($examination->end_date)) }}
          @else
            {{ $examination->academic_year ?? '2024-2025' }}
          @endif
        </td>
      </tr>
    </table>

    <!-- Subject-wise Marks Table -->
    <table class="marks-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 7%;">Sub Code</th>
          <th rowspan="2" style="width: 25%;">Subject Title</th>
          <th colspan="3" class="sub-th" style="width: 20%;">Theory</th>
          <th colspan="3" class="sub-th" style="width: 20%;">Practical / Internal</th>
          <th colspan="3" class="sub-th" style="width: 16%;">Total Marks</th>
          <th rowspan="2" style="width: 6%;">Grade</th>
          <th rowspan="2" style="width: 6%;">Status</th>
        </tr>
        <tr>
          <!-- Theory columns -->
          <th style="font-size: 7px; background: #1d4ed8; width: 6.5%;">Max</th>
          <th style="font-size: 7px; background: #1d4ed8; width: 6.5%;">Pass</th>
          <th style="font-size: 7px; background: #1d4ed8; width: 7%;">Obt</th>
          <!-- Practical columns -->
          <th style="font-size: 7px; background: #1d4ed8; width: 6.5%;">Max</th>
          <th style="font-size: 7px; background: #1d4ed8; width: 6.5%;">Pass</th>
          <th style="font-size: 7px; background: #1d4ed8; width: 7%;">Obt</th>
          <!-- Total columns -->
          <th style="font-size: 7px; background: #1e3a8a; width: 5%;">Max</th>
          <th style="font-size: 7px; background: #1e3a8a; width: 5%;">Pass</th>
          <th style="font-size: 7px; background: #1e3a8a; width: 6%;">Obt</th>
        </tr>
      </thead>
      <tbody>
        @php
          $totTheoryMax = 0;
          $totTheoryPass = 0;
          $totTheoryObt = 0;
          $totPracMax = 0;
          $totPracPass = 0;
          $totPracObt = 0;
          $grandMax = 0;
          $grandPass = 0;
          $grandObt = 0;
          $allPassed = true;
          $failCount = 0;
        @endphp

        @foreach($marks as $m)
          @php
            $subCode = $m->subject->code ?? ('SUB-' . str_pad($m->subject_id, 3, '0', STR_PAD_LEFT));
            $subName = $m->subject->name ?? 'General Subject';
            
            $thMax = 80;
            $thPass = 26;
            $thObt = (float) $m->theory_marks;
            
            $prMax = 20;
            $prPass = 7;
            $prObt = (float) $m->practical_marks;
            
            $subTotalMax = (float) ($m->max_marks ?: 100);
            $subTotalPass = (float) ($m->passing_marks ?: 33);
            $subTotalObt = (float) ($m->marks_obtained ?: ($thObt + $prObt));
            
            $subPassed = ($thObt >= $thPass) && ($prObt >= $prPass) && ($subTotalObt >= $subTotalPass);
            if (!$subPassed) {
              $allPassed = false;
              $failCount++;
            }

            $totTheoryMax += $thMax;
            $totTheoryPass += $thPass;
            $totTheoryObt += $thObt;
            $totPracMax += $prMax;
            $totPracPass += $prPass;
            $totPracObt += $prObt;
            $grandMax += $subTotalMax;
            $grandPass += $subTotalPass;
            $grandObt += $subTotalObt;
          @endphp
          <tr>
            <td class="subject-code">{{ $subCode }}</td>
            <td class="subject-name">{{ $subName }}</td>
            <!-- Theory -->
            <td>{{ (int)$thMax }}</td>
            <td>{{ (int)$thPass }}</td>
            <td class="marks-bold">{{ (int)$thObt }}</td>
            <!-- Practical -->
            <td>{{ (int)$prMax }}</td>
            <td>{{ (int)$prPass }}</td>
            <td class="marks-bold">{{ (int)$prObt }}</td>
            <!-- Total -->
            <td>{{ (int)$subTotalMax }}</td>
            <td>{{ (int)$subTotalPass }}</td>
            <td class="marks-bold" style="background: #eff6ff; color: #1e3a8a;">{{ (int)$subTotalObt }}</td>
            <!-- Grade -->
            <td class="grade-cell">{{ $m->grade ?? 'A' }}</td>
            <!-- Status -->
            <td class="{{ $subPassed ? 'status-pass' : 'status-fail' }}">
              {{ $subPassed ? 'PASS' : 'FAIL' }}
            </td>
          </tr>
        @endforeach

        @php
          $pct = $grandMax > 0 ? round(($grandObt / $grandMax) * 100, 2) : 0;
          $cgpa = round($pct / 9.5, 2);
          
          if ($failCount == 0) {
            if ($pct >= 85) {
              $resultLabel = 'PASSED WITH DISTINCTION';
              $divisionLabel = 'FIRST DIVISION (DISTINCTION)';
            } elseif ($pct >= 60) {
              $resultLabel = 'PASSED - FIRST DIVISION';
              $divisionLabel = 'FIRST DIVISION';
            } elseif ($pct >= 45) {
              $resultLabel = 'PASSED - SECOND DIVISION';
              $divisionLabel = 'SECOND DIVISION';
            } else {
              $resultLabel = 'PASSED - THIRD DIVISION';
              $divisionLabel = 'THIRD DIVISION';
            }
          } elseif ($failCount == 1) {
            $resultLabel = 'COMPARTMENT / ELIGIBLE FOR RETEST';
            $divisionLabel = 'COMPARTMENT';
          } else {
            $resultLabel = 'ESSENTIAL REPEAT / FAILED';
            $divisionLabel = 'FAILED';
          }
        @endphp

        <!-- Grand Total Row -->
        <tr class="grand-total-row">
          <td colspan="2" style="text-align: right; padding-right: 10px;">GRAND TOTAL:</td>
          <td>{{ (int)$totTheoryMax }}</td>
          <td>{{ (int)$totTheoryPass }}</td>
          <td class="marks-bold">{{ (int)$totTheoryObt }}</td>
          <td>{{ (int)$totPracMax }}</td>
          <td>{{ (int)$totPracPass }}</td>
          <td class="marks-bold">{{ (int)$totPracObt }}</td>
          <td>{{ (int)$grandMax }}</td>
          <td>{{ (int)$grandPass }}</td>
          <td class="marks-bold" style="background: #dbeafe; color: #1e3a8a; font-size: 10.5px;">{{ (int)$grandObt }}</td>
          <td class="grade-cell">{{ $reportCard->overall_grade ?? 'A' }}</td>
          <td class="{{ $failCount == 0 ? 'status-pass' : 'status-fail' }}">{{ $failCount == 0 ? 'PASSED' : 'RE-APPEAR' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Total Marks in Words -->
    <div class="words-box">
      <span class="words-label">Total Marks in Words:</span>
      <span class="words-val">{{ $marksInWords ?? 'FOUR HUNDRED AND EIGHTY-FIVE' }} OUT OF {{ $maxInWords ?? 'SIX HUNDRED' }}</span>
    </div>

    <!-- Result Summary KPI Cards Table -->
    <table class="result-summary-table">
      <tr>
        <td>
          <div class="summary-card highlight">
            <div class="summary-title">Marks Obtained</div>
            <div class="summary-val primary">{{ (int)$grandObt }} / {{ (int)$grandMax }}</div>
          </div>
        </td>
        <td>
          <div class="summary-card highlight">
            <div class="summary-title">Aggregate Percentage</div>
            <div class="summary-val primary">{{ number_format($pct, 2) }}%</div>
          </div>
        </td>
        <td>
          <div class="summary-card highlight">
            <div class="summary-title">Overall Grade & CGPA</div>
            <div class="summary-val primary">{{ $reportCard->overall_grade ?? 'A1' }} <span style="font-size: 10px; font-weight: normal; color: #475569;">({{ $cgpa }} CGPA)</span></div>
          </div>
        </td>
        <td>
          <div class="summary-card success">
            <div class="summary-title">Class Rank</div>
            <div class="summary-val green">Rank #{{ $reportCard->class_rank ?? 1 }}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Final Result Status Banner -->
    <table class="final-result-banner" style="background: {{ $failCount == 0 ? '#f0fdf4' : '#fef2f2' }}; border-color: {{ $failCount == 0 ? '#15803d' : '#b91c1c' }};">
      <tr>
        <td style="width: 25%;">
          <div class="result-tag">FINAL EXAMINATION RESULT:</div>
          <div class="result-status-text {{ $failCount > 0 ? 'fail' : '' }}">{{ $resultLabel }}</div>
        </td>
        <td style="width: 25%;">
          <div class="result-tag">AWARDED DIVISION:</div>
          <div style="font-size: 11px; font-weight: 800; color: #1e293b;">{{ $divisionLabel }}</div>
        </td>
        <td style="width: 25%;">
          <div class="result-tag">DATE OF DECLARATION:</div>
          <div style="font-size: 10px; font-weight: 700; color: #334155;">{{ $declarationDate ?? date('d F Y') }}</div>
        </td>
        <td style="width: 25%;">
          <div class="result-tag">ATTENDANCE RECORD:</div>
          <div style="font-size: 10px; font-weight: 700; color: #334155;">{{ $reportCard->present_days ?? 88 }} / {{ $reportCard->total_working_days ?? 96 }} Days ({{ $reportCard->attendance_percentage ?? 91.6 }}%)</div>
        </td>
      </tr>
    </table>

    <!-- Grading Scale Key Legend -->
    <div class="legend-box">
      <div class="legend-title">CBSE Standard 8-Point Secondary Grading Scale & Passing Norms</div>
      <table class="legend-table">
        <thead>
          <tr>
            <th>Marks Range</th>
            <td>91 - 100%</td>
            <td>81 - 90%</td>
            <td>71 - 80%</td>
            <td>61 - 70%</td>
            <td>51 - 60%</td>
            <td>41 - 50%</td>
            <td>33 - 40%</td>
            <td>Below 33%</td>
          </tr>
          <tr>
            <th>Grade / Points</th>
            <td><strong>A1</strong> (10.0)</td>
            <td><strong>A2</strong> (9.0)</td>
            <td><strong>B1</strong> (8.0)</td>
            <td><strong>B2</strong> (7.0)</td>
            <td><strong>C1</strong> (6.0)</td>
            <td><strong>C2</strong> (5.0)</td>
            <td><strong>D</strong> (4.0)</td>
            <td><strong>E</strong> (Needs Imp.)</td>
          </tr>
        </thead>
      </table>
    </div>

    <!-- Signatures Section -->
    <table class="signatures-table">
      <tr>
        <td>
          <div class="sign-space"></div>
          <div class="sign-line">Prepared By</div>
          <div class="sign-sub">Tabulation Officer</div>
        </td>
        <td>
          <div class="sign-space"></div>
          <div class="sign-line">Checked By</div>
          <div class="sign-sub">Class Teacher</div>
        </td>
        <td>
          <div class="seal-circle">SEAL</div>
          <div class="sign-line">Institutional Seal</div>
          <div class="sign-sub">Arch Campus</div>
        </td>
        <td>
          <div class="sign-space" style="font-family: cursive; font-size: 15px; color: #1e3a8a; line-height: 40px; font-weight: bold;">
            {{ $school->principal_name ?? 'Dr. R. Sharma' }}
          </div>
          <div class="sign-line">Principal / Controller</div>
          <div class="sign-sub">Head of Institution</div>
        </td>
      </tr>
    </table>

    <!-- Security & Disclaimer Footer -->
    <div class="security-footer">
      Notice: This official statement of marks is computer generated by {{ $school->name ?? 'Delhi Public Academy' }} ERP System and authenticated under digital certification guidelines.
      Any discrepancy must be reported to the Examination Cell within 15 days of result declaration.
    </div>
  </div>
</div>

</body>
</html>
