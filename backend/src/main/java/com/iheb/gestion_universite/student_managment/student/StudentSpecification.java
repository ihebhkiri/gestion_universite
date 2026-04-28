package com.iheb.gestion_universite.student_managment.student;

import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class StudentSpecification {

    public static Specification<StudentEntity> withFilters(String keyword, Long academicYearId, Long programId, String status) {
        return (root, query, cb) -> {
            // Ensure distinct results to prevent duplicates from joins
            query.distinct(true);

            Predicate predicate = cb.conjunction();

            // 1. Search by Keyword (CIN, firstName, lastName)
            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Predicate cinPredicate = cb.like(cb.lower(root.get("cin")), likePattern);
                Predicate firstNamePredicate = cb.like(cb.lower(root.get("firstName")), likePattern);
                Predicate lastNamePredicate = cb.like(cb.lower(root.get("lastName")), likePattern);
                predicate = cb.and(predicate, cb.or(cinPredicate, firstNamePredicate, lastNamePredicate));
            }

            // 2. Filter by AcademicYear, Program, or Status
            // If any of these are provided, we MUST join with enrollments
            if (academicYearId != null || programId != null || StringUtils.hasText(status)) {
                Join<StudentEntity, StudentEnrollmentEntity> enrollmentsJoin = root.join("enrollments", JoinType.INNER);

                if (academicYearId != null) {
                    predicate = cb.and(predicate, cb.equal(enrollmentsJoin.get("group").get("academicClass").get("academicYear").get("id"), academicYearId));
                }

                if (programId != null) {
                    predicate = cb.and(predicate, cb.equal(enrollmentsJoin.get("group").get("academicClass").get("program").get("id"), programId));
                }

                if (StringUtils.hasText(status)) {
                    try {
                        EnrollmentStatus enrollmentStatus = EnrollmentStatus.valueOf(status.toUpperCase());
                        predicate = cb.and(predicate, cb.equal(enrollmentsJoin.get("status"), enrollmentStatus));
                    } catch (IllegalArgumentException e) {
                        // Ignore invalid status
                    }
                }
            }

            return predicate;
        };
    }
}
