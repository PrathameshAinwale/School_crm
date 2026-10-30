<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Student Progress Report Card - {{ $student->full_name ?? ($student->first_name . ' ' . $student->last_name) }}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
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
      font-size: 11px;
      line-height: 1.3;
    }
    .report-card-container {
      border: 3px double #065f46;
      border-radius: 8px;
      padding: 10px;
      position: relative;
    }
    /* Outer decorative border */
    .inner-border {
      border: 1px solid #10b981;
      border-radius: 6px;
      padding: 8px 10px;
    }

    /* Header */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .header-logo {
      width: 65px;
      vertical-align: middle;
      text-align: center;
    }
    .logo-badge {
      width: 55px;
      height: 55px;
      background: #065f46;
      color: #ffffff;
      border-radius: 10px;
      display: inline-block;
      text-align: center;
      line-height: 55px;
      font-size: 24px;
      font-weight: bold;
    }
    .header-center {
      text-align: center;
      vertical-align: middle;
    }
    .school-name {
      font-size: 20px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .school-sub {
      font-size: 9px;
      color: #475569;
      font-weight: 600;
    }
    .school-contact {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .report-title-badge {
      display: inline-block;
      background: #065f46;
      color: #ffffff;
      padding: 3px 14px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 5px;
    }

    /* Term & Session Bar */
    .session-bar {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 8px;
      width: 100%;
      display: table;
    }
    .session-bar-item {
      display: table-cell;
      font-size: 9.5px;
    }
    .session-bar-item.center {
      text-align: center;
    }
    .session-bar-item.right {
      text-align: right;
    }

    /* Student Demographics Info Table */
    .student-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      background: #fafafa;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .student-info-table td {
      padding: 3.5px 6px;
      font-size: 9.5px;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-label {
      font-weight: 700;
      color: #475569;
      width: 15%;
      text-transform: uppercase;
      font-size: 8.5px;
    }
    .info-value {
      font-weight: 700;
      color: #0f172a;
      width: 35%;
    }

    /* Marks Table */
    .marks-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .marks-table th {
      background: #065f46;
      color: #ffffff;
      padding: 5px 6px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      border: 1px solid #065f46;
      text-align: center;
    }
    .marks-table th.left {
      text-align: left;
    }
    .marks-table td {
      padding: 4.5px 6px;
      font-size: 9px;
      border: 1px solid #cbd5e1;
      text-align: center;
      color: #1e293b;
    }
    .marks-table td.left {
      text-align: left;
      font-weight: 700;
    }
    .marks-table tr.total-row td {
      background: #f8fafc;
      font-weight: 800;
      font-size: 9.5px;
      border-top: 2px solid #065f46;
    }
    .grade-badge {
      font-weight: 800;
      color: #065f46;
    }

    /* Performance Summary Cards */
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 5px 6px;
      text-align: center;
      vertical-align: top;
      width: 16.66%;
    }
    .summary-card.highlight {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .summary-label {
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .summary-value {
      font-size: 13px;
      font-weight: 900;
      color: #065f46;
    }
    .summary-value.pass {
      color: #059669;
    }

    /* Co-Scholastic & Scale Grid */
    .two-col-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .two-col-td {
      width: 50%;
      vertical-align: top;
      padding: 0 4px;
    }
    .sub-section-title {
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #065f46;
      border-bottom: 1.5px solid #065f46;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    .mini-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
    }
    .mini-table th {
      background: #f1f5f9;
      padding: 3px 4px;
      border: 1px solid #cbd5e1;
      font-weight: 700;
      text-align: left;
    }
    .mini-table td {
      padding: 2.5px 4px;
      border: 1px solid #cbd5e1;
    }
    .mini-table td.center {
      text-align: center;
    }

    /* Remarks Box */
    .remarks-box {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 5px 8px;
      margin-bottom: 8px;
      background: #fafafa;
    }
    .remarks-line {
      font-size: 9px;
      margin-bottom: 3px;
    }
    .remarks-label {
      font-weight: 800;
      color: #334155;
    }

    /* Signatures Section */
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .sig-cell {
      width: 33.33%;
      text-align: center;
      vertical-align: bottom;
      padding: 0 10px;
    }
    .sig-line {
      border-bottom: 1px solid #94a3b8;
      height: 25px;
      margin-bottom: 4px;
    }
    .sig-title {
      font-size: 8.5px;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
    }
    .sig-sub {
      font-size: 7.5px;
      color: #64748b;
    }

    /* QR / Barcode Footer */
    .footer-bar {
      margin-top: 8px;
      padding-top: 4px;
      border-top: 1px dashed #cbd5e1;
      font-size: 7.5px;
      color: #64748b;
      display: table;
      width: 100%;
    }
    .footer-left {
      display: table-cell;
      vertical-align: middle;
    }
    .footer-right {
      display: table-cell;
      text-align: right;
      vertical-align: middle;
      font-family: monospace;
      font-weight: bold;
    }
  </style>
</head>
<body>

<div class="report-card-container">
  <div class="inner-border">
    <!-- Header with School Logo & Details -->
    <table class="header-table">
      <tr>
        <td class="header-logo">
          @if(!empty($school->logo_url))
            <img src="{{ $school->logo_url }}" alt="Logo" style="max-width: 55px; max-height: 55px;" />
          @else
            <div class="logo-badge">🎓</div>
          @endif
        </td>
        <td class="header-center">
          <div class="school-name">{{ $school->name ?? 'ARCH CAMPUS INTERNATIONAL SCHOOL' }}</div>
          <div class="school-sub">
            Affiliated to {{ $school->affiliation ?? 'Central Board of Secondary Education (CBSE)' }} • School Code: {{ $school->code ?? 'DPS-101' }}
          </div>
          <div class="school-contact">
            {{ $school->address ?? 'Institutional Area, Sector 14' }}, {{ $school->city ?? 'New Delhi' }} | Phone: {{ $school->phone ?? '+91 11 2890 1200' }} | Email: {{ $school->email ?? 'contact@archcampus.edu' }}
          </div>
          <div>
            <span class="report-title-badge">STUDENT PROGRESS & ANNUAL PERFORMANCE REPORT</span>
          </div>
        </td>
        <td class="header-logo" style="text-align: right;">
          <div style="font-size: 8px; font-weight: bold; color: #065f46; border: 1.5px solid #065f46; padding: 4px 6px; border-radius: 4px; text-align: center;">
            ACADEMIC SESSION<br>
            <strong style="font-size: 11px;">{{ $examination->academic_year ?? '2024-2025' }}</strong>
          </div>
        </td>
      </tr>
    </table>

    <!-- Session & Exam Banner -->
    <div class="session-bar">
      <div class="session-bar-item">
        <strong>Examination:</strong> {{ $examination->name ?? 'Half-Yearly Summative Assessment (SA-1)' }}
      </div>
      <div class="session-bar-item center">
        <strong>Term:</strong> {{ $examination->term ?? 'Term 1' }}
      </div>
      <div class="session-bar-item right">
        <strong>Evaluation Period:</strong> 
        {{ $examination->start_date ? \Carbon\Carbon::parse($examination->start_date)->format('M Y') : 'Oct 2026' }} - 
        {{ $examination->end_date ? \Carbon\Carbon::parse($examination->end_date)->format('M Y') : 'Oct 2026' }}
      </div>
    </div>

    <!-- Student Demographics Info Table -->
    <table class="student-info-table">
      <tr>
        <td class="info-label">Student Name:</td>
        <td class="info-value">{{ strtoupper($student->full_name ?? ($student->first_name . ' ' . $student->last_name)) }}</td>
        <td class="info-label">Roll Number:</td>
        <td class="info-value">{{ $student->roll_number ?? 'N/A' }}</td>
      </tr>
      <tr>
        <td class="info-label">Admission No:</td>
        <td class="info-value">{{ $student->admission_number ?? 'STU-2024-001' }}</td>
        <td class="info-label">Class & Section:</td>
        <td class="info-value">
          {{ $student->schoolClass->name ?? ('Class ' . $student->school_class_id) }} - 
          {{ $student->section->name ?? 'Division A' }}
        </td>
      </tr>
      <tr>
        <td class="info-label">Father's Name:</td>
        <td class="info-value">{{ $student->father_name ?? $student->guardian_name ?? 'Rajesh Patel' }}</td>
        <td class="info-label">Date of Birth:</td>
        <td class="info-value">
          {{ $student->date_of_birth ? \Carbon\Carbon::parse($student->date_of_birth)->format('d M Y') : '15 Jan 2010' }}
        </td>
      </tr>
      <tr>
        <td class="info-label">Mother's Name:</td>
        <td class="info-value">{{ $student->mother_name ?? 'Sunita Patel' }}</td>
        <td class="info-label">Blood Group / Gender:</td>
        <td class="info-value">{{ $student->blood_group ?? 'O+' }} | {{ $student->gender ?? 'Male' }}</td>
      </tr>
      <tr>
        <td class="info-label">Attendance:</td>
        <td class="info-value" colspan="3">
          <strong>{{ $reportCard->present_days ?? 88 }} / {{ $reportCard->total_working_days ?? 95 }} Days</strong> 
          ({{ number_format($reportCard->attendance_percentage ?? 92.6, 1) }}%) • Status: 
          <span style="color: #059669; font-weight: bold;">Regular & Punctual</span>
        </td>
      </tr>
    </table>

    <!-- Subject-Wise Marks & Academic Evaluation Table -->
    <table class="marks-table">
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th class="left" style="width: 32%;">Subject Details</th>
          <th style="width: 10%;">Max Marks</th>
          <th style="width: 10%;">Pass Marks</th>
          <th style="width: 10%;">Theory (80)</th>
          <th style="width: 10%;">Practical (20)</th>
          <th style="width: 11%;">Total Obtained</th>
          <th style="width: 12%;">Grade / Remark</th>
        </tr>
      </thead>
      <tbody>
        @php
          $sumMax = 0;
          $sumPass = 0;
          $sumObtained = 0;
          $count = 1;
        @endphp
        @forelse($marks as $m)
          @php
            $maxM = $m->max_marks ?: 100;
            $passM = $m->passing_marks ?: 35;
            $obtM = $m->marks_obtained;
            $sumMax += $maxM;
            $sumPass += $passM;
            $sumObtained += $obtM;
          @endphp
          <tr>
            <td>{{ $count++ }}</td>
            <td class="left">
              {{ $m->subject->name ?? 'Subject' }}
              @if(!empty($m->subject->code))
                <span style="color: #64748b; font-size: 8px;">({{ $m->subject->code }})</span>
              @endif
            </td>
            <td>{{ (int)$maxM }}</td>
            <td>{{ (int)$passM }}</td>
            <td>{{ (int)$m->theory_marks }}</td>
            <td>{{ (int)$m->practical_marks }}</td>
            <td><strong>{{ (int)$obtM }}</strong></td>
            <td>
              <span class="grade-badge">{{ $m->grade ?: 'A' }}</span>
              <div style="font-size: 7px; color: #64748b;">{{ $m->remarks ?: 'Good' }}</div>
            </td>
          </tr>
        @empty
          <tr>
            <td colspan="8">No evaluation marks recorded for this examination.</td>
          </tr>
        @endforelse

        <!-- Total Summary Row -->
        <tr class="total-row">
          <td colspan="2" class="left">GRAND SCHOLASTIC TOTAL</td>
          <td>{{ (int)$sumMax }}</td>
          <td>{{ (int)$sumPass }}</td>
          <td colspan="2" style="font-size: 8px; color: #64748b;">Theory + Practical Combined</td>
          <td><strong style="font-size: 11px; color: #065f46;">{{ (int)$sumObtained }}</strong></td>
          <td>
            <strong style="color: #065f46; font-size: 11px;">{{ $reportCard->overall_grade ?? 'A' }}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- High Level Performance Analytics Cards -->
    <table class="summary-table">
      <tr>
        <td class="summary-card">
          <div class="summary-label">Total Marks</div>
          <div class="summary-value">{{ (int)$sumObtained }} / {{ (int)$sumMax }}</div>
        </td>
        <td class="summary-card highlight">
          <div class="summary-label">Percentage</div>
          <div class="summary-value">{{ number_format($reportCard->percentage ?? ($sumMax > 0 ? ($sumObtained/$sumMax)*100 : 0), 1) }}%</div>
        </td>
        <td class="summary-card">
          <div class="summary-label">Final Grade</div>
          <div class="summary-value">{{ $reportCard->overall_grade ?? 'A' }}</div>
        </td>
        <td class="summary-card highlight">
          <div class="summary-label">Result Status</div>
          <div class="summary-value pass">{{ $reportCard->result_status ?? 'PASSED' }}</div>
        </td>
        <td class="summary-card">
          <div class="summary-label">Class Rank</div>
          <div class="summary-value">{{ $reportCard->class_rank ?? 1 }}<span style="font-size: 8px; font-weight: normal;"> / {{ $totalStudentsInClass ?? 9 }}</span></div>
        </td>
        <td class="summary-card">
          <div class="summary-label">Division Rank</div>
          <div class="summary-value">{{ $reportCard->division_rank ?? 1 }}<span style="font-size: 8px; font-weight: normal;"> / {{ $totalStudentsInDivision ?? 4 }}</span></div>
        </td>
      </tr>
    </table>

    <!-- Co-Scholastic Traits & Grading Scale Side-by-Side -->
    <table class="two-col-table">
      <tr>
        <td class="two-col-td">
          <div class="sub-section-title">Co-Scholastic & Life Skills Evaluation (3-Point Scale)</div>
          <table class="mini-table">
            <thead>
              <tr>
                <th>Assessment Trait</th>
                <th style="width: 25%;" class="center">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Work Education & Computer Literacy</td>
                <td class="center"><strong>A (Outstanding)</strong></td>
              </tr>
              <tr>
                <td>Art & Creative Expression</td>
                <td class="center"><strong>A (Outstanding)</strong></td>
              </tr>
              <tr>
                <td>Health, Physical Fitness & Games</td>
                <td class="center"><strong>A+ (Exemplary)</strong></td>
              </tr>
              <tr>
                <td>Discipline, Values & Civic Etiquette</td>
                <td class="center"><strong>A+ (Exemplary)</strong></td>
              </tr>
            </tbody>
          </table>
        </td>
        <td class="two-col-td">
          <div class="sub-section-title">CBSE Standard Grading Scale Reference</div>
          <table class="mini-table">
            <thead>
              <tr>
                <th style="width: 30%;">Marks Range</th>
                <th style="width: 25%;" class="center">Grade</th>
                <th>Performance Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>91% - 100%</td>
                <td class="center"><strong>A+</strong></td>
                <td>Outstanding / Distinction</td>
              </tr>
              <tr>
                <td>81% - 90%</td>
                <td class="center"><strong>A</strong></td>
                <td>Excellent Comprehension</td>
              </tr>
              <tr>
                <td>71% - 80%</td>
                <td class="center"><strong>B+</strong></td>
                <td>Very Good Achievement</td>
              </tr>
              <tr>
                <td>61% - 70%</td>
                <td class="center"><strong>B</strong></td>
                <td>Good Learning Progress</td>
              </tr>
              <tr>
                <td>35% - 60%</td>
                <td class="center"><strong>C / D</strong></td>
                <td>Satisfactory / Passed</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </table>

    <!-- Teacher & Principal Qualitative Remarks -->
    <div class="remarks-box">
      <div class="remarks-line">
        <span class="remarks-label">Class Teacher Remarks:</span>
        <em>"{{ $reportCard->teacher_remarks ?? ($student->first_name . ' has maintained exemplary dedication and keen curiosity throughout the academic term.') }}"</em>
      </div>
      <div class="remarks-line" style="margin-bottom: 0;">
        <span class="remarks-label">Principal Remarks & Action:</span>
        <strong>{{ $reportCard->principal_remarks ?? 'Commendable scholastic achievement. Promoted with Distinction.' }}</strong>
      </div>
    </div>

    <!-- Official Signatures Block -->
    <table class="signatures-table">
      <tr>
        <td class="sig-cell">
          <div class="sig-line"></div>
          <div class="sig-title">Class Teacher Signature</div>
          <div class="sig-sub">Senior Faculty Representative</div>
        </td>
        <td class="sig-cell">
          <div class="sig-line"></div>
          <div class="sig-title">Examination Controller</div>
          <div class="sig-sub">Academic Evaluation Wing</div>
        </td>
        <td class="sig-cell">
          <div class="sig-line"></div>
          <div class="sig-title">Principal Signature & Seal</div>
          <div class="sig-sub">{{ $school->principal_name ?? 'Dr. Rajeshwari Sharma' }}</div>
        </td>
      </tr>
    </table>

    <!-- Footer Bar with Generation Metadata -->
    <div class="footer-bar">
      <div class="footer-left">
        Generated electronically via Arch Campus School Management ERP • Date of Issue: {{ date('d F, Y') }} • System Ref: RC-{{ $examination->code ?? 'SA1' }}-{{ $student->id }}
      </div>
      <div class="footer-right">
        VERIFIED OFFICIAL DOCUMENT
      </div>
    </div>

  </div>
</div>

</body>
</html>
