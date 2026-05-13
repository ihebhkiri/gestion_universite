import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '../../../core/constant/loader-context';
import { environment } from '../../../../environments/environment';
import { StudentPage } from '../models/student-course.model';
import { StudentPayment, StudentPaymentQueryParams, StudentPaymentSummary } from '../models/student-payment.model';

@Injectable({
  providedIn: 'root',
})
export class StudentPaymentsService {
  private readonly http = inject(HttpClient);
  private readonly paymentsUrl = `${environment.apiUrl}students/me/payments`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  getMyPayments(params: StudentPaymentQueryParams): Observable<StudentPage<StudentPayment>> {
    return this.http.get<StudentPage<StudentPayment>>(this.paymentsUrl, {
      params: this.buildParams(params),
      context: this.localLoaderContext,
    });
  }

  getPaymentSummary(): Observable<StudentPaymentSummary> {
    return this.http.get<StudentPaymentSummary>(`${this.paymentsUrl}/summary`, {
      context: this.localLoaderContext,
    });
  }

  private buildParams(query: StudentPaymentQueryParams): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('size', query.size);

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.fromDate) {
      params = params.set('fromDate', query.fromDate);
    }

    if (query.toDate) {
      params = params.set('toDate', query.toDate);
    }

    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    return params;
  }
}
