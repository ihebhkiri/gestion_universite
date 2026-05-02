import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {
  CreateExamPayload,
  CreateGradePayload,
  CreateGradeResponse,
  Exam,
  GradebookDetailsResponse,
  GradeRecord,
  GradeStats,
  SaveDraftGradesPayload,
  SaveDraftGradesResponse,
  UpdateGradePayload
} from '../models/grade-management.model';

@Injectable({
  providedIn: 'root'
})
export class GradeManagementApiService {
  private readonly gradeApiUrl = `${environment.apiUrl}admin/grade-management`;
  private readonly teacherGradeApiUrl = `${environment.apiUrl}teachers`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getExamsByCourse(courseId: number): Observable<Exam[]> {
    const params = new HttpParams().set('courseId', courseId);
    return this.http.get<Exam[]>(`${this.gradeApiUrl}/exams`, {
      params,
      context: this.localLoaderContext
    });
  }

  getExamDetails(examId: number): Observable<GradebookDetailsResponse> {
    return this.http.get<BackendGradebookDetailsResponse>(`${this.gradeApiUrl}/exams/${examId}`, {
      context: this.localLoaderContext
    }).pipe(map(response => this.mapDetails(response)));
  }

  createExam(payload: CreateExamPayload): Observable<GradebookDetailsResponse> {
    return this.http.post<BackendGradebookDetailsResponse>(`${this.gradeApiUrl}/exams`, payload, {
      context: this.localLoaderContext
    }).pipe(map(response => this.mapDetails(response)));
  }

  getStats(examId: number): Observable<GradeStats> {
    return this.http.get<BackendGradeStats>(`${this.gradeApiUrl}/exams/${examId}/stats`, {
      context: this.localLoaderContext
    }).pipe(map(stats => this.mapStats(stats)));
  }

  createGrade(examId: number, payload: CreateGradePayload): Observable<CreateGradeResponse> {
    return this.http.post<CreateGradeResponse>(`${this.teacherGradeApiUrl}/exams/${examId}/grades`, payload, {
      context: this.localLoaderContext
    });
  }

  updateGrade(recordId: number, payload: UpdateGradePayload): Observable<GradebookDetailsResponse> {
    return this.http.put<BackendGradebookDetailsResponse>(`${this.gradeApiUrl}/records/${recordId}`, payload, {
      context: this.localLoaderContext
    }).pipe(map(response => this.mapDetails(response)));
  }

  saveDraftGrades(payload: SaveDraftGradesPayload): Observable<SaveDraftGradesResponse> {
    const backendPayload = {
      records: payload.grades
        .filter(grade => grade.recordId !== null && grade.recordId !== undefined)
        .map(grade => ({
          recordId: grade.recordId,
          score: grade.score,
          comment: grade.comment ?? null,
          status: grade.status ?? 'DRAFT'
        }))
    };

    return this.http.put<BackendGradebookDetailsResponse>(`${this.gradeApiUrl}/exams/${payload.examId}/records`, backendPayload, {
      context: this.localLoaderContext
    }).pipe(map(response => {
      const details = this.mapDetails(response);
      return {
        records: details.records,
        stats: details.stats
      };
    }));
  }

  validateGrade(recordId: number): Observable<GradebookDetailsResponse> {
    return this.http.patch<BackendGradebookDetailsResponse>(`${this.gradeApiUrl}/records/${recordId}/validate`, {}, {
      context: this.localLoaderContext
    }).pipe(map(response => this.mapDetails(response)));
  }

  publishExam(examId: number): Observable<GradebookDetailsResponse> {
    return this.http.patch<BackendGradebookDetailsResponse>(`${this.gradeApiUrl}/exams/${examId}/publish`, {}, {
      context: this.localLoaderContext
    }).pipe(map(response => this.mapDetails(response)));
  }

  private mapDetails(response: BackendGradebookDetailsResponse): GradebookDetailsResponse {
    return {
      exam: response.exam,
      records: response.records.map(record => this.mapRecord(response.exam.id, response.exam.weight ?? null, record)),
      stats: response.stats ? this.mapStats(response.stats) : null
    };
  }

  private mapRecord(examId: number, coefficient: number | null, record: BackendGradeRecord): GradeRecord {
    return {
      id: record.id,
      examId,
      studentId: record.studentId,
      matricule: record.studentMatricule,
      studentName: record.studentName,
      groupName: record.groupName,
      score: record.score,
      coefficient,
      status: record.status,
      comment: record.comment,
      gradedAt: record.gradedAt,
      updatedAt: record.updatedAt
    };
  }

  private mapStats(stats: BackendGradeStats): GradeStats {
    return {
      totalStudents: stats.totalStudents,
      gradedCount: stats.gradedCount,
      notGradedCount: stats.notGradedCount,
      draftCount: stats.draftCount,
      validatedCount: stats.validatedCount,
      publishedCount: stats.publishedCount,
      averageScore: stats.classAverage,
      minScore: stats.lowestScore,
      maxScore: stats.highestScore,
      successRate: stats.passRate
    };
  }
}

interface BackendGradebookDetailsResponse {
  exam: Exam;
  records: BackendGradeRecord[];
  stats: BackendGradeStats | null;
}

interface BackendGradeRecord {
  id: number;
  studentId: number;
  studentMatricule: string | null;
  studentName: string;
  groupName: string | null;
  score: number | null;
  maxScore: number | null;
  comment: string | null;
  status: GradeRecord['status'];
  gradedAt: string | null;
  updatedAt: string | null;
}

interface BackendGradeStats {
  totalStudents: number;
  gradedCount: number;
  notGradedCount: number;
  draftCount: number;
  validatedCount: number;
  publishedCount: number;
  passCount: number;
  failCount: number;
  completionRate: number;
  passRate: number;
  classAverage: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  maxScore: number | null;
  passThreshold: number | null;
}
