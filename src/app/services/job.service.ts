import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Job } from '../models/job.model';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'jobs.json';  // Static file served from public folder
  private jobsSubject = new BehaviorSubject<Job[]>([]);
  public jobs$ = this.jobsSubject.asObservable();
  /** Signal of current jobs for reactive consumption (e.g. comparison). */
  readonly jobsSignal = toSignal(this.jobsSubject.asObservable(), { initialValue: [] as Job[] });

  constructor(private http: HttpClient) {}

  loadJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl).pipe(
      map(jobs => jobs.filter(job => job.company_name !== null)),
      tap(jobs => this.jobsSubject.next(jobs))
    );
  }

  /** Returns current in-memory job list (for comparison resolution). */
  getCurrentJobs(): Job[] {
    return this.jobsSubject.getValue();
  }
}
