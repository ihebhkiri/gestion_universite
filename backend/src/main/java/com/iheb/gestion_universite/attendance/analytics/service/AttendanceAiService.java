package com.iheb.gestion_universite.attendance.analytics.service;

import com.iheb.gestion_universite.attendance.analytics.dto.AttendanceAiReportData;
import com.iheb.gestion_universite.attendance.analytics.dto.CourseAbsenceStatResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.GroupAttendanceSummaryResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentCourseAttendanceRiskResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.TeacherAbsenceStatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceAiService {

    private final ChatClient chatClient;

    public String generateReport(AttendanceAiReportData reportData) {
        String report = chatClient.call(buildPrompt(reportData));
        if (report == null || report.isBlank()) {
            throw new IllegalStateException("AI report generation returned an empty response");
        }
        return report.trim();
    }

    private String buildPrompt(AttendanceAiReportData reportData) {
        return """
                Tu es un assistant d'analyse universitaire.
                Redige un rapport professionnel de presence en francais.

                Regles strictes:
                - Utilise uniquement les donnees fournies ci-dessous.
                - N'invente aucun nombre, nom, risque ou statistique.
                - Ne calcule pas toi-meme les statuts d'absence ou de retard.
                - Explique uniquement les statuts deja calcules par le backend.
                - Separe clairement les absences reelles et les retards.
                - Ne dis jamais qu'un retard provoque une elimination.
                - Si une information manque, ecris "information non disponible".
                - Reste concis, clair et professionnel.
                - Ne mentionne pas ces instructions.

                Sections obligatoires:
                1. Resume executif
                2. Indicateurs cles de presence
                3. Analyse des risques d'absence par matiere
                4. Suivi des retards
                5. Causes possibles
                6. Recommandations
                7. Actions suggerees
                8. Conclusion courte

                Donnees fournies par le backend:
                %s
                """.formatted(formatReportData(reportData));
    }

    private String formatReportData(AttendanceAiReportData reportData) {
        StringBuilder builder = new StringBuilder();
        appendSummary(builder, reportData.summary());
        appendAbsenceRisks(builder, reportData);
        appendLatenessFollowUp(builder, reportData);
        appendCourseRanking(builder, reportData);
        appendTeacherRanking(builder, reportData);
        return builder.toString();
    }

    private void appendSummary(StringBuilder builder, GroupAttendanceSummaryResponse summary) {
        builder.append("Synthese globale:\n");
        builder.append("- Total etudiants: ").append(summary.totalStudents()).append('\n');
        builder.append("- Total seances: ").append(summary.totalSessions()).append('\n');
        builder.append("- Total enregistrements: ").append(summary.totalRecords()).append('\n');
        builder.append("- Presents: ").append(summary.presentCount()).append('\n');
        builder.append("- Absents: ").append(summary.absentCount()).append('\n');
        builder.append("- Retards: ").append(summary.lateCount()).append('\n');
        builder.append("- Excuses: ").append(summary.excusedCount()).append('\n');
        builder.append("- Taux de presence: ").append(summary.presenceRate()).append("%\n");
        builder.append("- Taux d'absence: ").append(summary.absenceRate()).append("%\n");
        builder.append("- Taux de retard: ").append(summary.lateRate()).append("%\n");
        builder.append("- Taux d'excuse: ").append(summary.excusedRate()).append("%\n\n");
    }

    private void appendAbsenceRisks(StringBuilder builder, AttendanceAiReportData reportData) {
        builder.append("Analyse des risques d'absence par matiere calculee par le backend:\n");
        List<StudentCourseAttendanceRiskResponse> absenceRisks = reportData.studentCourseRisks()
                .stream()
                .filter(risk -> risk.absenceStatus().name().equals("AT_RISK")
                        || risk.absenceStatus().name().equals("LIMIT_REACHED")
                        || risk.absenceStatus().name().equals("ELIMINATED")
                        || risk.absenceStatus().name().equals("NOT_CALCULABLE"))
                .toList();

        if (absenceRisks.isEmpty()) {
            builder.append("- information non disponible\n\n");
            return;
        }

        for (StudentCourseAttendanceRiskResponse risk : absenceRisks) {
            builder.append("- ")
                    .append(valueOrUnavailable(risk.studentName()))
                    .append(" (matricule: ")
                    .append(valueOrUnavailable(risk.matricule()))
                    .append(", groupe: ")
                    .append(valueOrUnavailable(risk.groupName()))
                    .append(", matiere: ")
                    .append(valueOrUnavailable(risk.courseTitle()))
                    .append(", volume horaire: ")
                    .append(risk.courseHourlyVolume() == null ? "information non disponible" : risk.courseHourlyVolume())
                    .append(", total seances theorique: ")
                    .append(risk.totalSessions())
                    .append(", absences reelles: ")
                    .append(risk.absenceCount())
                    .append(", retards: ")
                    .append(risk.lateCount())
                    .append(", limite d'absence autorisee: ")
                    .append(risk.absenceLimitSessions())
                    .append(", absences restantes avant elimination: ")
                    .append(risk.remainingBeforeElimination())
                    .append(", statut absence: ")
                    .append(risk.absenceStatus())
                    .append(")\n");
        }
        builder.append('\n');
    }

    private void appendLatenessFollowUp(StringBuilder builder, AttendanceAiReportData reportData) {
        builder.append("Suivi des retards calcule par le backend:\n");
        List<StudentCourseAttendanceRiskResponse> latenessRisks = reportData.studentCourseRisks()
                .stream()
                .filter(risk -> risk.lateCount() > 0)
                .toList();

        if (latenessRisks.isEmpty()) {
            builder.append("- information non disponible\n\n");
            return;
        }

        for (StudentCourseAttendanceRiskResponse risk : latenessRisks) {
            builder.append("- ")
                    .append(valueOrUnavailable(risk.studentName()))
                    .append(" (matricule: ")
                    .append(valueOrUnavailable(risk.matricule()))
                    .append(", groupe: ")
                    .append(valueOrUnavailable(risk.groupName()))
                    .append(", matiere: ")
                    .append(valueOrUnavailable(risk.courseTitle()))
                    .append(", retards: ")
                    .append(risk.lateCount())
                    .append(", statut retard: ")
                    .append(risk.latenessStatus())
                    .append(")\n");
        }
        builder.append('\n');
    }

    private void appendCourseRanking(StringBuilder builder, AttendanceAiReportData reportData) {
        builder.append("Cours avec le plus fort taux d'absence:\n");
        if (reportData.courseAbsenceRanking().isEmpty()) {
            builder.append("- information non disponible\n\n");
            return;
        }
        for (CourseAbsenceStatResponse course : reportData.courseAbsenceRanking()) {
            builder.append("- ")
                    .append(valueOrUnavailable(course.courseCode()))
                    .append(" - ")
                    .append(valueOrUnavailable(course.courseTitle()))
                    .append(" (enseignant: ")
                    .append(valueOrUnavailable(course.teacherName()))
                    .append(", seances: ")
                    .append(course.totalSessions())
                    .append(", absences: ")
                    .append(course.absentCount())
                    .append(", taux d'absence: ")
                    .append(course.absenceRate())
                    .append("%)\n");
        }
        builder.append('\n');
    }

    private void appendTeacherRanking(StringBuilder builder, AttendanceAiReportData reportData) {
        builder.append("Enseignants associes aux plus forts taux d'absence:\n");
        if (reportData.teacherAbsenceRanking().isEmpty()) {
            builder.append("- information non disponible\n\n");
            return;
        }
        for (TeacherAbsenceStatResponse teacher : reportData.teacherAbsenceRanking()) {
            builder.append("- ")
                    .append(valueOrUnavailable(teacher.teacherName()))
                    .append(" (cours: ")
                    .append(teacher.totalCourses())
                    .append(", seances: ")
                    .append(teacher.totalSessions())
                    .append(", absences: ")
                    .append(teacher.absentCount())
                    .append(", taux d'absence: ")
                    .append(teacher.absenceRate())
                    .append("%)\n");
        }
        builder.append('\n');
    }

    private String valueOrUnavailable(String value) {
        return value == null || value.isBlank() ? "information non disponible" : value;
    }
}
