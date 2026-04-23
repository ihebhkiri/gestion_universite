package com.iheb.gestion_universite.admin.dashboard;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AdminDashboardResponse(
        Summary summary,
        List<EnrollmentChartPoint> enrollmentChart,
        List<RecentEnrollment> recentEnrollments,
        List<UpcomingExam> upcomingExams,
        List<DepartmentStat> departmentStats,
        List<ActivityItem> activityFeed,
        List<UpcomingEvent> upcomingEvents,
        List<AlertItem> alerts
) {

    public record Summary(
            long totalStudents,
            long totalTeachers,
            long totalCourses,
            Double attendanceRate,
            boolean attendanceAvailable
    ) {
    }

    public record EnrollmentChartPoint(
            String label,
            long value
    ) {
    }

    public record RecentEnrollment(
            Long id,
            String studentName,
            String studentMatricule,
            String groupName,
            String status,
            LocalDate enrollmentDate
    ) {
    }

    public record UpcomingExam(
            String title,
            String courseName,
            LocalDate startDate,
            LocalDate endDate,
            long daysUntil
    ) {
    }

    public record DepartmentStat(
            Long id,
            String code,
            String name,
            long teachers,
            long programs
    ) {
    }

    public record ActivityItem(
            String type,
            String title,
            String description,
            Instant occurredAt
    ) {
    }

    public record UpcomingEvent(
            String title,
            String description,
            LocalDate date,
            String kind
    ) {
    }

    public record AlertItem(
            String severity,
            String title,
            String message
    ) {
    }
}
