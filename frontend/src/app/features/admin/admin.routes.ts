import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: "", redirectTo: "dashboard", pathMatch: "full",
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./user_managment/pages/user/user.component').then(m => m.UserComponent)
  }, {
    path: 'students',
    loadComponent: () => import('./student-managment/pages/students-managment/students-managment.component').then(m => m.StudentsManagmentComponent)
  }, {
    path: 'enrollments',
    loadComponent: () => import('./enrollment-management/enrollment-management.component').then(m => m.EnrollmentManagementComponent)
  }, {
    path: 'groups',
    loadComponent: () => import('./student-managment/pages/group-management/group-management.component').then(m => m.GroupManagementComponent)
  }, {
    path: 'teachers',
    loadComponent: () => import('./teacher-managment/pages/teacher-management/teacher-management.component').then(m => m.TeacherManagementComponent)
  }, {
    path: 'departments',
    loadComponent: () => import('./department-managment/pages/department-managment/department-managment.component').then(m => m.DepartmentManagmentComponent)
  }, {
    path: 'specialities',
    loadComponent: () => import('./speciality-managment/pages/speciality-managment/speciality-managment.component').then(m => m.SpecialityManagmentComponent)
  }, {
    path: 'programs',
    loadComponent: () => import('./program-managment/pages/program-managment/program-managment.component').then(m => m.ProgramManagmentComponent)
  }, {
    path: 'academic-years',
    loadComponent: () => import('./academic-year-managment/pages/academic-year-management/academic-year-management.component').then(m => m.AcademicYearManagementComponent)
  }, {
    path: 'classes',
    loadComponent: () => import('./academic-class-managment/pages/academic-class-management/academic-class-management.component').then(m => m.AcademicClassManagementComponent)
  }, {
    path: 'subjects',
    loadComponent: () => import('./subject-managment/pages/subject-managment/subject-managment.component').then(m => m.SubjectManagmentComponent)
  }, {
    path: 'courses',
    loadComponent: () => import('./course-managment/pages/course-management/course-management.component').then(m => m.CourseManagementComponent)
  }, {
    path: 'semesters',
    loadComponent: () => import('./semester-managment/pages/semester-managment/semester-managment.component').then(m => m.SemesterManagmentComponent)
  }, {
    path: 'timetable',
    loadComponent: () => import('./timetable-management/pages/timetable-container/timetable-container.component').then(m => m.TimetableContainerComponent)
  }

]
