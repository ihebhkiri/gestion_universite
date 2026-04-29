package com.iheb.gestion_universite.teaching.teacher;

import com.iheb.gestion_universite.teaching.teacher_assignment.TeacherAssignmentEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;

public class TeacherSpecification {

    private TeacherSpecification() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String search;
        private Long departmentId;
        private String status;
        private Long specialityId;
        private Long subjectId;
        private LocalDate hiredFrom;
        private LocalDate hiredTo;

        public Builder search(String search) {
            this.search = search;
            return this;
        }

        public Builder departmentId(Long departmentId) {
            this.departmentId = departmentId;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder specialityId(Long specialityId) {
            this.specialityId = specialityId;
            return this;
        }

        public Builder subjectId(Long subjectId) {
            this.subjectId = subjectId;
            return this;
        }

        public Builder hiredFrom(LocalDate hiredFrom) {
            this.hiredFrom = hiredFrom;
            return this;
        }

        public Builder hiredTo(LocalDate hiredTo) {
            this.hiredTo = hiredTo;
            return this;
        }

        public Specification<TeacherEntity> build() {
            return (root, query, cb) -> {
                query.distinct(true);
                Predicate predicate = cb.conjunction();

                if (StringUtils.hasText(search)) {
                    String pattern = "%" + search.trim().toLowerCase() + "%";
                    Predicate firstName = cb.like(cb.lower(root.get("firstName")), pattern);
                    Predicate lastName = cb.like(cb.lower(root.get("lastName")), pattern);
                    Predicate cin = cb.like(cb.lower(root.get("cin")), pattern);
                    Predicate matricule = cb.like(cb.lower(root.get("matricule")), pattern);
                    Predicate email = cb.like(cb.lower(root.get("user").get("email")), pattern);
                    predicate = cb.and(predicate, cb.or(firstName, lastName, cin, matricule, email));
                }

                if (departmentId != null) {
                    predicate = cb.and(predicate, cb.equal(root.get("department").get("id"), departmentId));
                }

                if (StringUtils.hasText(status)) {
                    try {
                        TeacherStatus teacherStatus = TeacherStatus.valueOf(status.toUpperCase());
                        predicate = cb.and(predicate, cb.equal(root.get("status"), teacherStatus));
                    } catch (IllegalArgumentException ignored) {
                        // Invalid status filters are ignored to keep the endpoint tolerant.
                    }
                }

                if (specialityId != null) {
                    predicate = cb.and(predicate, cb.equal(root.get("speciality").get("id"), specialityId));
                }

                if (subjectId != null) {
                    Join<TeacherEntity, TeacherAssignmentEntity> assignments = root.join("assignments", JoinType.INNER);
                    predicate = cb.and(predicate, cb.equal(assignments.get("course").get("subject").get("id"), subjectId));
                }

                if (hiredFrom != null) {
                    predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("hireDate"), hiredFrom));
                }

                if (hiredTo != null) {
                    predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("hireDate"), hiredTo));
                }

                return predicate;
            };
        }
    }
}
