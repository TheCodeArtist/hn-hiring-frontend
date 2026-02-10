import { Injectable, signal, computed } from '@angular/core';
import { Job } from '../models/job.model';
import { JobService } from './job.service';

const STORAGE_KEY = 'comparison-jobs';

@Injectable({ providedIn: 'root' })
export class ComparisonService {
  private readonly _jobIds = signal<string[]>(this.loadFromStorage());

  readonly count = computed(() => this._jobIds().length);
  readonly jobIds = computed(() => [...this._jobIds()]);
  readonly showComparisonView = signal(false);

  readonly jobs = computed(() => {
    const ids = this._jobIds();
    const allJobs = this.jobService.jobsSignal();
    const byId = new Map(allJobs.map(j => [j.id, j]));
    return ids.map(id => byId.get(id)).filter((j): j is Job => j != null);
  });

  readonly canCompare = computed(() => this._jobIds().length >= 2);

  constructor(private jobService: JobService) {}

  addJob(job: Job): void {
    const ids = this._jobIds();
    if (ids.includes(job.id)) return;
    this._jobIds.set([...ids, job.id]);
    this.persist();
  }

  removeJob(jobId: string): void {
    const ids = this._jobIds().filter(id => id !== jobId);
    this._jobIds.set(ids);
    this.persist();
    // Don't auto-close comparison view when 1 job remains (user can now add more)
    // Only close if no jobs remain
    if (ids.length === 0) {
      this.showComparisonView.set(false);
    }
  }

  getJobs(): Job[] {
    return this.jobs();
  }

  getCount(): number {
    return this.count();
  }

  isInComparison(jobId: string): boolean {
    return this._jobIds().includes(jobId);
  }

  clearAll(): void {
    this._jobIds.set([]);
    this.persist();
    this.showComparisonView.set(false);
  }

  reorderJobs(newOrder: Job[]): void {
    this._jobIds.set(newOrder.map(j => j.id));
    this.persist();
  }

  openComparisonView(): void {
    if (this._jobIds().length >= 1) {
      this.showComparisonView.set(true);
    }
  }

  closeComparisonView(): void {
    this.showComparisonView.set(false);
  }

  private loadFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._jobIds()));
    } catch {
      // Graceful degradation if localStorage unavailable
    }
  }
}
