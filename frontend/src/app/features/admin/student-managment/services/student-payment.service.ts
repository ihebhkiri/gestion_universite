import {HttpClient, HttpContext, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {StudentPaymentHistory, StudentPaymentSummary} from '../models/student-payment.model';

@Injectable({
  providedIn: 'root'
})
export class StudentPaymentService {
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getPaymentSummary(studentId: number): Observable<StudentPaymentSummary> {
    return this.http.get<StudentPaymentSummary>(`${environment.apiUrl}students/${studentId}/payments/summary`, {
      context: this.localLoaderContext
    });
  }

  getPaymentHistory(studentId: number): Observable<StudentPaymentHistory[]> {
    return this.http.get<StudentPaymentHistory[]>(`${environment.apiUrl}students/${studentId}/payments`, {
      context: this.localLoaderContext
    });
  }

  registerMonthlyPaymentAndDownloadReceipt(studentId: number): Observable<HttpResponse<Blob>> {
    return this.http.post(`${environment.apiUrl}students/${studentId}/payments/monthly-600/receipt`, null, {
      context: this.localLoaderContext,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
