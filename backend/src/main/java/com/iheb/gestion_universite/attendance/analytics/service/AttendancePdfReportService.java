package com.iheb.gestion_universite.attendance.analytics.service;

import com.iheb.gestion_universite.attendance.analytics.dto.AbsenceRiskStatus;
import com.iheb.gestion_universite.attendance.analytics.dto.AttendanceAiReportData;
import com.iheb.gestion_universite.attendance.analytics.dto.GroupAttendanceSummaryResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.LatenessStatus;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentCourseAttendanceRiskResponse;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AttendancePdfReportService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm", Locale.FRENCH);

    private static final Color DARK_BLUE = new Color(0, 30, 72);
    private static final Color DARK_GREY = new Color(48, 55, 65);
    private static final Color MEDIUM_GREY = new Color(105, 112, 123);
    private static final Color LIGHT_GREY = new Color(245, 247, 250);
    private static final Color BORDER_GREY = new Color(218, 224, 232);
    private static final Color GREEN = new Color(22, 128, 86);
    private static final Color ORANGE = new Color(197, 103, 24);
    private static final Color RED = new Color(190, 18, 60);

    private static final List<String> SECTION_TITLES = List.of(
            "R\u00e9sum\u00e9 ex\u00e9cutif",
            "Indicateurs cl\u00e9s de pr\u00e9sence",
            "Analyse des risques d'absence par mati\u00e8re",
            "Suivi des retards",
            "Causes possibles",
            "Recommandations",
            "Actions sugg\u00e9r\u00e9es",
            "Conclusion courte"
    );

    public byte[] createPdf(String aiReportContent, AttendanceAiReportData reportData) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 42, 42, 58, 62);
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            writer.setPageEvent(new ReportFooter());
            document.open();

            addHeader(document);
            addKpiSection(document, reportData);
            addAbsenceRiskTable(document, reportData);
            addLatenessTable(document, reportData);
            addAiSections(document, aiReportContent);

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new IllegalStateException("Unable to create attendance AI PDF report", ex);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to generate attendance AI PDF report", ex);
        }
    }

    private void addHeader(Document document) throws DocumentException {
        Paragraph title = new Paragraph("Rapport IA de Pr\u00e9sence", font(22, Font.BOLD, DARK_BLUE));
        title.setSpacingAfter(4);
        document.add(title);

        Paragraph subtitle = new Paragraph(
                "Analyse automatique des tendances d'assiduit\u00e9",
                font(11.5f, Font.NORMAL, MEDIUM_GREY)
        );
        subtitle.setSpacingAfter(8);
        document.add(subtitle);

        Paragraph generationDate = new Paragraph(
                "Date de g\u00e9n\u00e9ration : " + LocalDateTime.now().format(DATE_FORMATTER),
                font(9.5f, Font.NORMAL, MEDIUM_GREY)
        );
        generationDate.setSpacingAfter(18);
        document.add(generationDate);

        addSectionDivider(document);
    }

    private void addKpiSection(Document document, AttendanceAiReportData reportData) throws DocumentException {
        addSectionTitle(document, "Indicateurs cl\u00e9s");

        GroupAttendanceSummaryResponse summary = reportData.summary();
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6);
        table.setSpacingAfter(18);
        table.setWidths(new float[]{1, 1, 1});

        addKpiCell(table, "Taux de pr\u00e9sence", formatPercent(summary.presenceRate()), GREEN);
        addKpiCell(table, "Taux d'absence", formatPercent(summary.absenceRate()), RED);
        addKpiCell(table, "Taux de retard", formatPercent(summary.lateRate()), ORANGE);
        addKpiCell(table, "Total \u00e9tudiants", String.valueOf(summary.totalStudents()), DARK_BLUE);
        addKpiCell(table, "Total s\u00e9ances", String.valueOf(summary.totalSessions()), DARK_BLUE);
        addKpiCell(table, "Risques par mati\u00e8re", String.valueOf(countAbsenceRisks(reportData)), RED);

        document.add(table);
    }

    private void addAbsenceRiskTable(Document document, AttendanceAiReportData reportData) throws DocumentException {
        addSectionTitle(document, "Analyse des risques d'absence par mati\u00e8re");

        List<StudentCourseAttendanceRiskResponse> risks = reportData.studentCourseRisks()
                .stream()
                .filter(risk -> risk.absenceStatus() != AbsenceRiskStatus.NORMAL)
                .toList();

        if (risks.isEmpty()) {
            addInfoBox(document, "Aucun risque d'absence par mati\u00e8re n'est disponible dans les donn\u00e9es calcul\u00e9es.");
            return;
        }

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6);
        table.setSpacingAfter(18);
        table.setWidths(new float[]{2.4f, 2.4f, 1.1f, 1.1f, 1.1f, 1.2f, 1.8f});

        addHeaderCell(table, "\u00c9tudiant");
        addHeaderCell(table, "Mati\u00e8re");
        addHeaderCell(table, "Volume");
        addHeaderCell(table, "Abs.");
        addHeaderCell(table, "Limite");
        addHeaderCell(table, "Reste");
        addHeaderCell(table, "Statut");

        for (StudentCourseAttendanceRiskResponse risk : risks) {
            addBodyCell(table, valueOrUnavailable(risk.studentName()), DARK_GREY, 8.2f);
            addBodyCell(table, courseLabel(risk), DARK_GREY, 8.2f);
            addBodyCell(table, risk.courseHourlyVolume() == null ? "N/A" : risk.courseHourlyVolume() + "h", DARK_GREY, 8.2f);
            addBodyCell(table, String.valueOf(risk.absenceCount()), RED, 8.2f);
            addBodyCell(table, risk.absenceStatus() == AbsenceRiskStatus.NOT_CALCULABLE ? "N/A" : String.valueOf(risk.absenceLimitSessions()), DARK_GREY, 8.2f);
            addBodyCell(table, risk.absenceStatus() == AbsenceRiskStatus.NOT_CALCULABLE ? "N/A" : String.valueOf(risk.remainingBeforeElimination()), DARK_GREY, 8.2f);
            addBodyCell(table, risk.absenceStatus().name(), absenceStatusColor(risk.absenceStatus()), 8.2f);
        }

        document.add(table);
    }

    private void addLatenessTable(Document document, AttendanceAiReportData reportData) throws DocumentException {
        addSectionTitle(document, "Suivi des retards");

        List<StudentCourseAttendanceRiskResponse> latenessRows = reportData.studentCourseRisks()
                .stream()
                .filter(risk -> risk.latenessStatus() == LatenessStatus.BLAME_RECOMMENDED
                        || risk.latenessStatus() == LatenessStatus.FREQUENT_LATENESS)
                .toList();

        if (latenessRows.isEmpty()) {
            addInfoBox(document, "Aucun suivi disciplinaire li\u00e9 aux retards n'est recommand\u00e9 dans les donn\u00e9es calcul\u00e9es.");
            return;
        }

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6);
        table.setSpacingAfter(18);
        table.setWidths(new float[]{2.8f, 2.8f, 1.2f, 2.1f});

        addHeaderCell(table, "\u00c9tudiant");
        addHeaderCell(table, "Mati\u00e8re");
        addHeaderCell(table, "Retards");
        addHeaderCell(table, "Statut retard");

        for (StudentCourseAttendanceRiskResponse risk : latenessRows) {
            addBodyCell(table, valueOrUnavailable(risk.studentName()), DARK_GREY, 8.8f);
            addBodyCell(table, courseLabel(risk), DARK_GREY, 8.8f);
            addBodyCell(table, String.valueOf(risk.lateCount()), ORANGE, 8.8f);
            addBodyCell(table, risk.latenessStatus().name(), latenessStatusColor(risk.latenessStatus()), 8.8f);
        }

        document.add(table);
    }

    private void addAiSections(Document document, String aiReportContent) throws DocumentException {
        Map<String, String> sections = splitSections(aiReportContent);

        for (String title : SECTION_TITLES) {
            addSectionTitle(document, title);
            renderSectionBody(document, sections.getOrDefault(title, "information non disponible"));
        }
    }

    private Map<String, String> splitSections(String aiReportContent) {
        Map<String, StringBuilder> sectionBuilders = new LinkedHashMap<>();
        String currentTitle = null;

        for (String line : safeText(aiReportContent).split("\\R")) {
            String matchedTitle = matchSectionTitle(line);
            if (matchedTitle != null) {
                currentTitle = matchedTitle;
                sectionBuilders.putIfAbsent(currentTitle, new StringBuilder());
                continue;
            }

            if (currentTitle == null && !line.isBlank()) {
                currentTitle = SECTION_TITLES.get(0);
                sectionBuilders.putIfAbsent(currentTitle, new StringBuilder());
            }

            if (currentTitle != null) {
                sectionBuilders.get(currentTitle).append(line).append('\n');
            }
        }

        Map<String, String> sections = new LinkedHashMap<>();
        for (Map.Entry<String, StringBuilder> entry : sectionBuilders.entrySet()) {
            sections.put(entry.getKey(), cleanMarkdown(entry.getValue().toString()).trim());
        }
        return sections;
    }

    private String matchSectionTitle(String line) {
        String normalizedLine = normalizeTitle(line);
        for (String title : SECTION_TITLES) {
            if (normalizedLine.equals(normalizeTitle(title))) {
                return title;
            }
        }
        return null;
    }

    private void renderSectionBody(Document document, String body) throws DocumentException {
        String cleanedBody = cleanMarkdown(body);
        StringBuilder paragraph = new StringBuilder();

        for (String rawLine : cleanedBody.split("\\R")) {
            String line = cleanMarkdown(rawLine).trim();

            if (line.isBlank()) {
                addTextParagraph(document, paragraph);
                continue;
            }

            String bullet = extractListItem(line);
            if (bullet != null) {
                addTextParagraph(document, paragraph);
                addBullet(document, bullet);
                continue;
            }

            if (!paragraph.isEmpty()) {
                paragraph.append(' ');
            }
            paragraph.append(line);
        }

        addTextParagraph(document, paragraph);
    }

    private void addTextParagraph(Document document, StringBuilder text) throws DocumentException {
        if (text.isEmpty()) {
            return;
        }

        Paragraph paragraph = new Paragraph(text.toString(), font(10.5f, Font.NORMAL, DARK_GREY));
        paragraph.setLeading(15);
        paragraph.setSpacingAfter(9);
        document.add(paragraph);
        text.setLength(0);
    }

    private void addBullet(Document document, String text) throws DocumentException {
        Paragraph paragraph = new Paragraph();
        paragraph.setIndentationLeft(14);
        paragraph.setLeading(14);
        paragraph.setSpacingAfter(5);
        paragraph.add(new Chunk("\u2022 ", font(10.5f, Font.BOLD, DARK_BLUE)));
        paragraph.add(new Chunk(text, font(10.5f, Font.NORMAL, DARK_GREY)));
        document.add(paragraph);
    }

    private String extractListItem(String line) {
        String trimmed = line.trim();
        if (trimmed.matches("^[-*+]\\s+.+")) {
            return trimmed.replaceFirst("^[-*+]\\s+", "").trim();
        }
        if (trimmed.matches("^\\d+[.)]\\s+.+")) {
            return trimmed.replaceFirst("^\\d+[.)]\\s+", "").trim();
        }
        return null;
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        Paragraph paragraph = new Paragraph(title, font(14, Font.BOLD, DARK_BLUE));
        paragraph.setSpacingBefore(4);
        paragraph.setSpacingAfter(6);
        document.add(paragraph);
    }

    private void addSectionDivider(Document document) throws DocumentException {
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        divider.setSpacingAfter(18);

        PdfPCell cell = new PdfPCell(new Phrase(""));
        cell.setFixedHeight(1.2f);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBackgroundColor(DARK_BLUE);
        divider.addCell(cell);

        document.add(divider);
    }

    private void addKpiCell(PdfPTable table, String label, String value, Color valueColor) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(11);
        cell.setUseAscender(true);
        cell.setUseDescender(true);
        cell.setBackgroundColor(LIGHT_GREY);
        cell.setBorderColor(BORDER_GREY);

        Paragraph labelParagraph = new Paragraph(label, font(8.5f, Font.BOLD, MEDIUM_GREY));
        labelParagraph.setSpacingAfter(5);
        cell.addElement(labelParagraph);

        Paragraph valueParagraph = new Paragraph(value, font(17, Font.BOLD, valueColor));
        cell.addElement(valueParagraph);

        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String label) {
        PdfPCell cell = new PdfPCell(new Phrase(label, font(8.3f, Font.BOLD, DARK_BLUE)));
        cell.setPadding(7);
        cell.setBackgroundColor(LIGHT_GREY);
        cell.setBorderColor(BORDER_GREY);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String value, Color color, float fontSize) {
        PdfPCell cell = new PdfPCell(new Phrase(value, font(fontSize, Font.NORMAL, color)));
        cell.setPadding(7);
        cell.setBorderColor(BORDER_GREY);
        table.addCell(cell);
    }

    private void addInfoBox(Document document, String text) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6);
        table.setSpacingAfter(18);

        PdfPCell cell = new PdfPCell(new Phrase(text, font(10, Font.NORMAL, MEDIUM_GREY)));
        cell.setPadding(12);
        cell.setBorderColor(BORDER_GREY);
        cell.setBackgroundColor(LIGHT_GREY);
        table.addCell(cell);

        document.add(table);
    }

    private int countAbsenceRisks(AttendanceAiReportData reportData) {
        return (int) reportData.studentCourseRisks()
                .stream()
                .filter(risk -> risk.absenceStatus() == AbsenceRiskStatus.AT_RISK
                        || risk.absenceStatus() == AbsenceRiskStatus.LIMIT_REACHED
                        || risk.absenceStatus() == AbsenceRiskStatus.ELIMINATED)
                .count();
    }

    private String courseLabel(StudentCourseAttendanceRiskResponse risk) {
        if (risk.courseCode() == null || risk.courseCode().isBlank()) {
            return valueOrUnavailable(risk.courseTitle());
        }
        return risk.courseCode() + " - " + valueOrUnavailable(risk.courseTitle());
    }

    private Color absenceStatusColor(AbsenceRiskStatus status) {
        return switch (status) {
            case NORMAL -> GREEN;
            case AT_RISK, LIMIT_REACHED -> ORANGE;
            case ELIMINATED -> RED;
            case NOT_CALCULABLE -> MEDIUM_GREY;
        };
    }

    private Color latenessStatusColor(LatenessStatus status) {
        return switch (status) {
            case NO_DELAY -> GREEN;
            case MINOR_DELAY, BLAME_RECOMMENDED -> ORANGE;
            case FREQUENT_LATENESS -> RED;
        };
    }

    private String cleanMarkdown(String value) {
        return safeText(value)
                .replaceAll("(?m)^\\s{0,3}#{1,6}\\s*", "")
                .replace("**", "")
                .replace("__", "")
                .replace("`", "")
                .replaceAll("\\[(.+?)]\\((.+?)\\)", "$1")
                .trim();
    }

    private String normalizeTitle(String value) {
        String cleaned = cleanMarkdown(value)
                .replaceAll("^\\d+[.)]\\s*", "")
                .replaceAll(":$", "")
                .trim();

        String normalized = Normalizer.normalize(cleaned, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized.toLowerCase(Locale.FRENCH);
    }

    private String formatPercent(double value) {
        return String.format(Locale.FRENCH, "%.2f %%", value);
    }

    private String valueOrUnavailable(String value) {
        return value == null || value.isBlank() ? "information non disponible" : value;
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

    private Font font(float size, int style, Color color) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, BaseFont.WINANSI, size, style);
        font.setColor(color);
        return font;
    }

    private static class ReportFooter extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, BaseFont.WINANSI, 8, Font.NORMAL);
            footerFont.setColor(MEDIUM_GREY);

            Phrase footer = new Phrase(
                    "G\u00e9n\u00e9r\u00e9 automatiquement par le syst\u00e8me de gestion universitaire",
                    footerFont
            );
            ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_CENTER,
                    footer,
                    (document.left() + document.right()) / 2,
                    document.bottom() - 24,
                    0
            );

            Phrase pageNumber = new Phrase("Page " + writer.getPageNumber(), footerFont);
            ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_RIGHT,
                    pageNumber,
                    document.right(),
                    document.bottom() - 24,
                    0
            );
        }
    }
}
