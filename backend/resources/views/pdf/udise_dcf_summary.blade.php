<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>UDISE+ Data Capture Format (DCF) Summary Report - {{ $academicYear }}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
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
      font-size: 10px;
      line-height: 1.3;
    }
    .header-box {
      border: 2px solid #1e40af;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 8px;
      background: #f8fafc;
      text-align: center;
    }
    .govt-heading {
      font-size: 8.5px;
      font-weight: bold;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .report-title {
      font-size: 16px;
      font-weight: 900;
      color: #1e40af;
      text-transform: uppercase;
      margin: 2px 0;
    }
    .sub-title {
      font-size: 9px;
      font-weight: 700;
      color: #0f172a;
    }
    .meta-ribbon {
      margin-top: 4px;
      font-size: 8.5px;
      font-weight: bold;
      color: #1e40af;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }
    .section-title {
      background: #1e40af;
      color: #ffffff;
      padding: 3px 6px;
      font-size: 9.5px;
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 3px;
      margin: 7px 0 4px 0;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      font-size: 8.5px;
    }
    table.data-table th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 3px 5px;
      text-align: left;
      font-weight: bold;
      color: #334155;
    }
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 3px 5px;
      vertical-align: middle;
    }
    .badge {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 7.5px;
    }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-info { background: #e0f2fe; color: #0369a1; }
    .badge-warning { background: #fef9c3; color: #854d0e; }
    .cert-box {
      border: 1.5px solid #16a34a;
      background: #f0fdf4;
      border-radius: 5px;
      padding: 6px 8px;
      margin-top: 8px;
    }
    .footer-signatures {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .footer-signatures td {
      width: 33.3%;
      text-align: center;
      vertical-align: bottom;
      padding: 0 5px;
    }
    .sign-space { height: 35px; }
    .sign-line {
      border-top: 1px solid #475569;
      padding-top: 2px;
      font-size: 8px;
      font-weight: bold;
      text-transform: uppercase;
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <div class="header-box">
    <div class="govt-heading">Ministry of Education &bull; Government of India</div>
    <div class="report-title">Unified District Information System for Education Plus (UDISE+)</div>
    <div class="sub-title">Data Capture Format (DCF) Comprehensive Compliance Summary Booklet</div>
    <div class="meta-ribbon">
      UDISE CODE: <strong>{{ $profile->udise_code ?? '27200100142' }}</strong> &bull; ACADEMIC YEAR: <strong>{{ $academicYear }}</strong> &bull; STATUS: <strong>{{ strtoupper($submission->status ?? 'VALIDATED') }}</strong>
    </div>
  </div>

  <!-- Section 1: School Profile -->
  <div class="section-title">Section 1: School Profile & Institutional Identification</div>
  <table class="data-table">
    <tr>
      <th style="width: 20%;">School Name:</th>
      <td style="width: 30%; font-weight: bold;">{{ $school->name }}</td>
      <th style="width: 20%;">UDISE Code (11-Digit):</th>
      <td style="width: 30%; font-weight: bold; color: #1e40af;">{{ $profile->udise_code ?? '27200100142' }}</td>
    </tr>
    <tr>
      <th>School Category:</th>
      <td>{{ $profile->school_category ?? 'Higher Secondary (1-12)' }}</td>
      <th>Management Group:</th>
      <td>{{ $profile->management_group ?? 'Private Unaided (Recognized)' }}</td>
    </tr>
    <tr>
      <th>Affiliation Board (Sec / Sr Sec):</th>
      <td>{{ $profile->affiliation_board_secondary ?? 'CBSE' }} ({{ $profile->affiliation_no_secondary ?? '2130842' }})</td>
      <th>School Type / Co-ed:</th>
      <td>{{ $profile->type_of_school ?? 'Co-educational' }}</td>
    </tr>
    <tr>
      <th>Medium of Instruction:</th>
      <td>1. {{ $profile->medium_of_instruction_1 ?? 'English' }} | 2. {{ $profile->medium_of_instruction_2 ?? 'Hindi' }}</td>
      <th>Classes Operational:</th>
      <td>{{ $profile->lowest_class ?? 'Class 1' }} to {{ $profile->highest_class ?? 'Class 12' }}</td>
    </tr>
    <tr>
      <th>Head of School:</th>
      <td>{{ $profile->head_of_school_name ?? $school->principal_name }} ({{ $profile->head_of_school_type ?? 'Principal' }})</td>
      <th>Nodal Officer (UDISE+):</th>
      <td>{{ $profile->nodal_officer_name ?? 'Vikram Deshmukh' }} (Mob: {{ $profile->nodal_officer_mobile ?? '9822012345' }})</td>
    </tr>
  </table>

  <!-- Section 2: Physical Facilities -->
  <div class="section-title">Section 2: Physical Facilities, Equipment & Digital Infrastructure</div>
  <table class="data-table">
    <tr>
      <th style="width: 20%;">Total Classrooms:</th>
      <td style="width: 30%;">{{ $facility->total_classrooms_instructional ?? 24 }} (Good: {{ $facility->classrooms_good_condition ?? 20 }}, Minor Rep: {{ $facility->classrooms_minor_repair ?? 4 }})</td>
      <th style="width: 20%;">Building Status:</th>
      <td style="width: 30%;">{{ $facility->building_status ?? 'Owned' }} &bull; Wall: {{ $facility->boundary_wall_type ?? 'Pucca' }}</td>
    </tr>
    <tr>
      <th>Drinking Water:</th>
      <td>{{ $facility->drinking_water_available ? 'Available (Functional RO Plant)' : 'No' }}</td>
      <th>Electricity / Solar:</th>
      <td>{{ $facility->electricity_available ? 'Functional Grid Connection + Solar Installed' : 'No' }}</td>
    </tr>
    <tr>
      <th>Boys Toilets (Total / CWSN):</th>
      <td>{{ $facility->boys_toilets_total ?? 12 }} Functional / {{ $facility->boys_cwsn_toilets ?? 2 }} CWSN</td>
      <th>Girls Toilets (Total / CWSN):</th>
      <td>{{ $facility->girls_toilets_total ?? 14 }} Functional / {{ $facility->girls_cwsn_toilets ?? 2 }} CWSN (Incinerator: Yes)</td>
    </tr>
    <tr>
      <th>Library / Books:</th>
      <td>Available &bull; Total Books: {{ $facility->total_library_books ?? 4250 }}</td>
      <th>Laboratories:</th>
      <td>Science Lab, Computer Lab & Atal Tinkering Lab (ATL)</td>
    </tr>
    <tr>
      <th>Computers & Smart Classes:</th>
      <td>{{ $facility->total_functional_desktops ?? 48 }} Desktops | {{ $facility->smart_classrooms_projectors ?? 14 }} Smart Projector Classrooms</td>
      <th>Internet Facility:</th>
      <td>{{ $facility->internet_type ?? 'Fiber Broadband' }} (Speed: {{ $facility->internet_speed_mbps ?? 150 }} Mbps)</td>
    </tr>
  </table>

  <!-- Section 3: Teachers Registry -->
  <div class="section-title">Section 3: Teaching Staff Registry & National Teacher Codes</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 18%;">National Code</th>
        <th style="width: 24%;">Teacher Name</th>
        <th style="width: 10%;">Gender</th>
        <th style="width: 14%;">Designation</th>
        <th style="width: 20%;">Qualifications</th>
        <th style="width: 14%;">ICT Trained</th>
      </tr>
    </thead>
    <tbody>
      @foreach($teachers as $t)
        <tr>
          <td style="font-family: monospace; font-weight: bold; color: #1e40af;">{{ $t->national_teacher_code }}</td>
          <td style="font-weight: bold;">{{ $t->teacher->first_name }} {{ $t->teacher->last_name }}</td>
          <td>{{ $t->teacher->gender }}</td>
          <td>{{ $t->cadre_designation }}</td>
          <td>{{ $t->academic_qualification }} ({{ $t->professional_qualification }})</td>
          <td><span class="badge badge-success">YES</span></td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <!-- Section 4: Students Registry & PEN -->
  <div class="section-title">Section 4: Student Details & Permanent Education Number (PEN) Summary</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 18%;">National PEN</th>
        <th style="width: 12%;">Roll / Adm</th>
        <th style="width: 24%;">Student Name</th>
        <th style="width: 14%;">Class & Div</th>
        <th style="width: 10%;">Gender</th>
        <th style="width: 12%;">Category</th>
        <th style="width: 10%;">CWSN</th>
      </tr>
    </thead>
    <tbody>
      @foreach($students as $s)
        <tr>
          <td style="font-family: monospace; font-weight: bold; color: #1e40af;">{{ $s->pen }}</td>
          <td>#{{ $s->student->roll_number }}</td>
          <td style="font-weight: bold;">{{ $s->student->first_name }} {{ $s->student->last_name }}</td>
          <td>{{ $s->student->schoolClass->name ?? 'Class 10' }} - {{ $s->student->section->name ?? 'A' }}</td>
          <td>{{ $s->student->gender }}</td>
          <td><span class="badge badge-info">{{ $s->social_category }}</span></td>
          <td>
            @if($s->is_cwsn)
              <span class="badge badge-warning">CWSN</span>
            @else
              <span>-</span>
            @endif
          </td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <!-- Certification Banner -->
  <div class="cert-box">
    <div style="font-weight: bold; font-size: 9px; color: #15803d; text-transform: uppercase;">Official Declaration & Certification by Head of Institution</div>
    <div style="font-size: 8px; color: #166534; margin-top: 2px;">
      Certified that the information provided in this UDISE+ Data Capture Format (DCF) for the academic year {{ $academicYear }} has been thoroughly audited against school registers and authenticated under official guidelines.
      Acknowledgement No: <strong>{{ $submission->dcf_acknowledgement_number ?? 'UDISE/24-25/MH/27200100142/ACK-88912' }}</strong>.
    </div>
  </div>

  <!-- Signatures -->
  <table class="footer-signatures">
    <tr>
      <td>
        <div class="sign-space"></div>
        <div class="sign-line">UDISE+ Nodal Officer</div>
        <div style="font-size: 7.5px; color: #64748b;">Data Verification Officer</div>
      </td>
      <td>
        <div class="sign-space"></div>
        <div class="sign-line">Institutional Stamp / Seal</div>
        <div style="font-size: 7.5px; color: #64748b;">Delhi Public Academy</div>
      </td>
      <td>
        <div class="sign-space" style="font-family: cursive; font-size: 13px; font-weight: bold; color: #1e40af; line-height: 35px;">
          {{ $profile->head_of_school_name ?? $school->principal_name }}
        </div>
        <div class="sign-line">Principal / Head of Institution</div>
        <div style="font-size: 7.5px; color: #64748b;">Authorized Signatory</div>
      </td>
    </tr>
  </table>

</body>
</html>
