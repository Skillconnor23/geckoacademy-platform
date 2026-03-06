import type { MonthlyReportData } from './monthly-progress-report';
import type { MonthlyReportLabels } from './report-labels';

const BRAND_COLOR = '#7daf41';
const BORDER_COLOR = '#e5e7eb';

/** Build natural-language summary paragraphs from data and labels. */
function buildSummaryParagraphs(data: MonthlyReportData, labels: MonthlyReportLabels): string[] {
  const paragraphs: string[] = [];
  if (data.attendanceTotalSessions > 0) {
    const pct = Math.round(data.attendanceRate * 100);
    paragraphs.push(
      labels.summaryAttendance
        .replace('{pct}', String(pct))
        .replace('{present}', String(data.attendancePresentLate))
        .replace('{total}', String(data.attendanceTotalSessions))
    );
  }
  if (data.quizAttemptsCount > 0 && data.averageQuizScore != null) {
    paragraphs.push(
      labels.summaryQuiz
        .replace('{score}', String(data.averageQuizScore))
        .replace('{count}', String(data.quizAttemptsCount))
    );
  }
  if (data.homeworkTotal > 0) {
    const pct = Math.round((data.homeworkCompletionRate ?? 0) * 100);
    paragraphs.push(
      labels.summaryHomework
        .replace('{pct}', String(pct))
        .replace('{completed}', String(data.homeworkCompleted))
        .replace('{total}', String(data.homeworkTotal))
    );
  }
  if (data.readingCompletionsCount > 0) {
    paragraphs.push(
      labels.summaryReading.replace('{count}', String(data.readingCompletionsCount))
    );
  }
  if (data.participationAvg != null) {
    paragraphs.push(
      labels.summaryParticipation.replace(
        '{value}',
        String(Math.round(data.participationAvg))
      )
    );
  }
  if (paragraphs.length === 0) {
    return [labels.noActivity];
  }
  paragraphs.push(labels.summaryAreasToImprove);
  return paragraphs;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Generate branded HTML for the monthly progress report (print-optimized, A4). */
export function renderMonthlyReportHtml(
  data: MonthlyReportData,
  labels: MonthlyReportLabels,
  logoDataUrl: string | null
): string {
  const attendancePct = Math.round(data.attendanceRate * 100);
  const homeworkPct =
    data.homeworkCompletionRate != null
      ? Math.round(data.homeworkCompletionRate * 100)
      : null;
  const participationStr =
    data.participationAvg != null ? `${Math.round(data.participationAvg)}/5` : '—';
  const summaryParagraphs = buildSummaryParagraphs(data, labels);
  const footerText = labels.footerGenerated
    .replace('{month}', data.monthLabel)
    .replace('{name}', data.studentName);

  const logoImg =
    logoDataUrl != null
      ? `<img src="${escapeAttr(logoDataUrl)}" alt="" width="40" height="40" style="width:40px;height:40px;object-fit:contain;display:block;" />`
      : '<span style="font-weight:700;font-size:18px;color:#fff;">G</span>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(labels.reportTitle)} – ${escapeHtml(data.studentName)} – ${escapeHtml(data.monthLabel)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1f2937; background: #fff; margin: 0; padding: 28px 36px; font-size: 14px; line-height: 1.55; }
    @media print {
      body { padding: 20px 28px; }
      @page { size: A4; margin: 16mm; }
      .section { break-inside: avoid; }
      .card { break-inside: avoid; }
    }
    .header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 3px solid ${BRAND_COLOR}; }
    .logo-wrap { width: 56px; height: 56px; min-width: 56px; background: ${BRAND_COLOR}; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .brand { font-size: 22px; font-weight: 700; color: #1f2937; letter-spacing: -0.02em; }
    .report-title { font-size: 14px; color: #6b7280; margin-top: 4px; font-weight: 500; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #374151; margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 1px solid ${BORDER_COLOR}; }
    .card { border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; background: #fafafa; }
    .card-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 14px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; }
    .label { color: #6b7280; font-size: 13px; }
    .value { font-weight: 500; color: #1f2937; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
    .metric { border: 1px solid ${BORDER_COLOR}; border-radius: 10px; padding: 14px; text-align: center; background: #fff; }
    .metric-value { font-size: 22px; font-weight: 700; color: ${BRAND_COLOR}; }
    .metric-label { font-size: 11px; color: #6b7280; margin-top: 6px; }
    .summary-text { margin: 0 0 12px 0; line-height: 1.6; color: #374151; }
    .summary-text:last-child { margin-bottom: 0; }
    .notes { white-space: pre-wrap; margin-bottom: 10px; font-size: 13px; color: #374151; }
    .notes-list { margin: 0; padding-left: 20px; }
    .recommended { margin-top: 14px; padding-top: 14px; border-top: 1px dashed ${BORDER_COLOR}; font-size: 13px; color: #6b7280; }
    .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid ${BORDER_COLOR}; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo-wrap" aria-hidden="true">${logoImg}</div>
    <div>
      <div class="brand">${escapeHtml(labels.brandName)}</div>
      <div class="report-title">${escapeHtml(labels.reportTitle)}</div>
    </div>
  </header>

  <section class="section">
    <h1 class="section-title">${escapeHtml(labels.studentInfo)}</h1>
    <div class="card">
      <div class="grid-2">
        <div><span class="label">${escapeHtml(labels.studentName)}</span><br/><span class="value">${escapeHtml(data.studentName)}</span></div>
        <div><span class="label">${escapeHtml(labels.class)}</span><br/><span class="value">${escapeHtml(data.className ?? '—')}</span></div>
        <div><span class="label">${escapeHtml(labels.teacher)}</span><br/><span class="value">${escapeHtml(data.teacherName ?? '—')}</span></div>
        <div><span class="label">${escapeHtml(labels.reportingMonth)}</span><br/><span class="value">${escapeHtml(data.monthLabel)}</span></div>
        ${data.schoolName ? `<div><span class="label">${escapeHtml(labels.school ?? 'School')}</span><br/><span class="value">${escapeHtml(data.schoolName)}</span></div>` : ''}
      </div>
    </div>
  </section>

  <section class="section">
    <h1 class="section-title">${escapeHtml(labels.performanceMetrics)}</h1>
    <div class="card">
      <div class="card-title">${escapeHtml(labels.thisMonth)}</div>
      <div class="metrics">
        <div class="metric">
          <div class="metric-value">${attendancePct}%</div>
          <div class="metric-label">${escapeHtml(labels.attendance)}</div>
          <div class="metric-label">${data.attendancePresentLate}/${data.attendanceTotalSessions} ${escapeHtml(labels.sessions)}</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.averageQuizScore != null ? data.averageQuizScore + '%' : '—'}</div>
          <div class="metric-label">${escapeHtml(labels.avgQuizScore)}</div>
          <div class="metric-label">${data.quizAttemptsCount} ${escapeHtml(labels.attempts)}</div>
        </div>
        <div class="metric">
          <div class="metric-value">${homeworkPct != null ? homeworkPct + '%' : '—'}</div>
          <div class="metric-label">${escapeHtml(labels.homeworkCompletion)}</div>
          <div class="metric-label">${data.homeworkCompleted}/${data.homeworkTotal} ${escapeHtml(labels.completed)}</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.readingCompletionsCount}</div>
          <div class="metric-label">${escapeHtml(labels.readingCompleted)}</div>
        </div>
        <div class="metric">
          <div class="metric-value">${participationStr}</div>
          <div class="metric-label">${escapeHtml(labels.participationAvg)}</div>
        </div>
      </div>
    </div>
  </section>

  ${
    summaryParagraphs.length > 0
      ? `
  <section class="section">
    <h1 class="section-title">${escapeHtml(labels.summary)}</h1>
    <div class="card">
      ${summaryParagraphs.map((p) => `<p class="summary-text">${escapeHtml(p)}</p>`).join('\n      ')}
    </div>
  </section>
  `
      : ''
  }

  ${
    data.teacherNotes.length > 0
      ? `
  <section class="section">
    <h1 class="section-title">${escapeHtml(labels.teacherFeedback)}</h1>
    <div class="card">
      <ul class="notes-list">
        ${data.teacherNotes.map((n) => `<li class="notes">${escapeHtml(n)}</li>`).join('')}
      </ul>
      <p class="recommended">${escapeHtml(labels.recommendedNextSteps)}</p>
    </div>
  </section>
  `
      : ''
  }

  <div class="footer">
    ${escapeHtml(footerText)}
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
