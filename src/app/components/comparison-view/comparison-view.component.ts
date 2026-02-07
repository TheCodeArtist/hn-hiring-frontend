import { Component, signal, computed, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComparisonService } from '../../services/comparison.service';
import { Job } from '../../models/job.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { CompanyLogo } from '../company-logo/company-logo';

type FieldDef = { key: string; label: string; multi: boolean };
type SectionDef = { icon: string; title: string; fields: FieldDef[] };
type ScrollInfo = { 
  canScrollLeft: boolean; 
  canScrollRight: boolean; 
  hasOverflow: boolean;
  visibleRange: string;
};
type HighlightMode = 'none' | 'commons' | 'differences';

@Component({
  selector: 'app-comparison-view',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    CompanyLogo
  ],
  templateUrl: './comparison-view.component.html',
  styleUrls: ['./comparison-view.component.scss']
})
export class ComparisonViewComponent implements OnInit, OnDestroy, AfterViewInit {
  private breakpointObserver = inject(BreakpointObserver);
  private resizeSubscription: { unsubscribe: () => void } | null = null;
  private readonly HIGHLIGHT_MODE_KEY = 'comparison-highlight-mode';

  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  readonly isMobile = signal(false);
  readonly mobileOffset = signal(0);
  readonly scrollInfo = signal<ScrollInfo>({ 
    canScrollLeft: false, 
    canScrollRight: false,
    hasOverflow: false,
    visibleRange: '1-0'
  });
  readonly highlightMode = signal<HighlightMode>(this.loadHighlightMode());

  private readonly clampedMobileOffset = computed(() => {
    const jobs = this.comparison.jobs();
    const maxOffset = Math.max(0, jobs.length - 2);
    return Math.min(this.mobileOffset(), maxOffset);
  });

  readonly displayedJobs = computed(() => {
    const jobs = this.comparison.jobs();
    if (this.isMobile()) {
      const offset = this.clampedMobileOffset();
      return jobs.slice(offset, offset + 2);
    }
    return jobs;
  });

  readonly showLeftArrow = computed(() => this.isMobile() && this.clampedMobileOffset() > 0);
  readonly showRightArrow = computed(() => {
    if (!this.isMobile()) return false;
    const jobs = this.comparison.jobs();
    return this.clampedMobileOffset() < Math.max(0, jobs.length - 2);
  });

  readonly sections: SectionDef[] = [
    { icon: 'work', title: 'Positions', fields: [{ key: 'job_titles', label: 'Job Titles', multi: true }] },
    { icon: 'description', title: 'About the Company', fields: [{ key: 'summary', label: 'Summary', multi: false }] },
    {
      icon: 'info',
      title: 'Job Details',
      fields: [
        { key: 'locations', label: 'Location', multi: true },
        { key: 'remote_policy', label: 'Remote Policy', multi: false },
        { key: 'job_type', label: 'Job Type', multi: false },
        { key: 'compensation', label: 'Compensation', multi: false },
        { key: 'experience_level', label: 'Experience Level', multi: true },
        { key: 'visa_sponsorship', label: 'Visa Sponsorship', multi: false }
      ]
    },
    { icon: 'code', title: 'Tech Stack', fields: [{ key: 'tech_stack', label: 'Tech Stack', multi: true }] },
    {
      icon: 'contact_mail',
      title: 'How to Apply',
      fields: [
        { key: 'contact_email', label: 'Contact Email', multi: false },
        { key: 'apply_links', label: 'Apply Links', multi: true },
        { key: 'hn_link', label: 'Original HN Post', multi: false },
        { key: 'username', label: 'Posted by', multi: false }
      ]
    }
  ];

  constructor(
    public comparison: ComparisonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.resizeSubscription = this.breakpointObserver
      .observe('(max-width: 768px)')
      .subscribe(state => {
        this.isMobile.set(state.matches);
        if (!state.matches) this.mobileOffset.set(0);
      });
    const missing = this.comparison.jobIds().length - this.comparison.jobs().length;
    if (missing > 0) {
      this.snackBar.open(
        `${missing} job(s) in your comparison are no longer available and were removed.`,
        undefined,
        { duration: 5000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
    }
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Initial scroll state check
    setTimeout(() => this.updateScrollState(), 100);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Update scroll state when viewport is resized
    this.updateScrollState();
  }

  onScroll(event: Event): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;

    const canScrollLeft = el.scrollLeft > 1;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
    const hasOverflow = el.scrollWidth > el.clientWidth;

    // Calculate visible column range
    let visibleRange = '1-0';
    if (hasOverflow) {
      const labelColumnWidth = 220; // matches CSS
      const jobColumnWidth = 280; // matches CSS
      const scrollPos = el.scrollLeft;
      const viewportWidth = el.clientWidth - labelColumnWidth;
      
      // Calculate which columns are visible
      const firstVisibleCol = Math.floor(scrollPos / jobColumnWidth) + 1;
      const lastVisibleCol = Math.min(
        Math.ceil((scrollPos + viewportWidth) / jobColumnWidth),
        this.comparison.jobs().length
      );
      
      visibleRange = `${firstVisibleCol}-${lastVisibleCol}`;
    }

    this.scrollInfo.set({ canScrollLeft, canScrollRight, hasOverflow, visibleRange });
  }

  mobilePrev(): void {
    this.mobileOffset.update(o => Math.max(0, o - 1));
  }

  mobileNext(): void {
    const jobs = this.comparison.jobs();
    const maxOffset = Math.max(0, jobs.length - 2);
    this.mobileOffset.update(o => Math.min(maxOffset, o + 1));
  }

  scrollLeft(): void {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;
    
    const jobColumnWidth = 280; // matches CSS
    const scrollAmount = jobColumnWidth;
    
    el.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;
    
    const jobColumnWidth = 280; // matches CSS
    const scrollAmount = jobColumnWidth;
    
    el.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }

  backToJobs(): void {
    this.comparison.closeComparisonView();
  }

  getFieldValue(job: Job, key: string): string | string[] {
    if (key === 'hn_link') {
      return `https://news.ycombinator.com/item?id=${job.id}`;
    }
    const v = (job as unknown as Record<string, unknown>)[key];
    if (v === null || v === undefined) return '';
    if (key === 'visa_sponsorship') {
      if (v === true) return 'Yes';
      if (v === false) return 'No';
      return String(v);
    }
    if (Array.isArray(v)) return v as string[];
    return String(v);
  }

  getSingleValue(job: Job, key: string): string {
    const v = this.getFieldValue(job, key);
    return Array.isArray(v) ? (v.length ? v[0] : '') : (v as string);
  }

  getArrayValues(job: Job, key: string): string[] {
    const v = this.getFieldValue(job, key);
    return Array.isArray(v) ? v : (v ? [v as string] : []);
  }

  getMaxLength(key: string): number {
    const jobs = this.comparison.jobs();
    let max = 0;
    for (const job of jobs) {
      const arr = this.getArrayValues(job, key);
      max = Math.max(max, arr.length);
    }
    return max || 1;
  }

  getValueAt(job: Job, key: string, index: number): string {
    const arr = this.getArrayValues(job, key);
    return arr[index] ?? '';
  }

  /** Values that appear in 2+ jobs for this field (for highlighting). */
  getCommonValues(key: string): Set<string> {
    const jobs = this.comparison.jobs();
    const counts = new Map<string, number>();
    for (const job of jobs) {
      const arr = this.getArrayValues(job, key);
      const seen = new Set<string>();
      for (const s of arr) {
        const n = (s || '').trim();
        if (!n) continue;
        if (!seen.has(n)) {
          seen.add(n);
          counts.set(n, (counts.get(n) ?? 0) + 1);
        }
      }
    }
    const common = new Set<string>();
    counts.forEach((c, val) => {
      if (c >= 2) common.add(val);
    });
    return common;
  }

  /** Values that appear in only 1 job for this field (for highlighting differences). */
  getDifferentValues(key: string): Set<string> {
    const jobs = this.comparison.jobs();
    const counts = new Map<string, number>();
    for (const job of jobs) {
      const arr = this.getArrayValues(job, key);
      const seen = new Set<string>();
      for (const s of arr) {
        const n = (s || '').trim();
        if (!n) continue;
        if (!seen.has(n)) {
          seen.add(n);
          counts.set(n, (counts.get(n) ?? 0) + 1);
        }
      }
    }
    const different = new Set<string>();
    counts.forEach((c, val) => {
      if (c === 1) different.add(val);
    });
    return different;
  }

  isCommonSingle(key: string, job: Job): boolean {
    const val = (this.getSingleValue(job, key) || '').trim();
    if (!val) return false;
    const jobs = this.comparison.jobs();
    let count = 0;
    for (const j of jobs) {
      if ((this.getSingleValue(j, key) || '').trim() === val) count++;
    }
    return count >= 2;
  }

  isDifferentSingle(key: string, job: Job): boolean {
    const val = (this.getSingleValue(job, key) || '').trim();
    if (!val) return false;
    const jobs = this.comparison.jobs();
    let count = 0;
    for (const j of jobs) {
      if ((this.getSingleValue(j, key) || '').trim() === val) count++;
    }
    return count === 1;
  }

  onHighlightModeChange(mode: HighlightMode): void {
    this.highlightMode.set(mode);
    this.saveHighlightMode(mode);
  }

  private loadHighlightMode(): HighlightMode {
    try {
      const stored = localStorage.getItem(this.HIGHLIGHT_MODE_KEY);
      if (stored === 'none' || stored === 'commons' || stored === 'differences') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'none';
  }

  private saveHighlightMode(mode: HighlightMode): void {
    try {
      localStorage.setItem(this.HIGHLIGHT_MODE_KEY, mode);
    } catch {
      // Ignore localStorage errors
    }
  }

  removeJob(job: Job): void {
    const name = job.company_name ?? 'this job';
    const data: ConfirmDialogData = {
      title: 'Remove from comparison',
      message: `Are you sure you want to remove <strong>${name}</strong> from comparison?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmWarn: true
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '400px' }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.comparison.removeJob(job.id);
        this.snackBar.open(`Removed ${name} from comparison`, undefined, {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        // Update scroll indicators after DOM updates
        setTimeout(() => this.updateScrollState(), 100);
      }
    });
  }

  removeAll(): void {
    const data: ConfirmDialogData = {
      title: 'Remove all',
      message: 'Remove all jobs from comparison?',
      confirmText: 'Remove All',
      cancelText: 'Cancel',
      confirmWarn: true
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '400px' }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.comparison.clearAll();
        this.snackBar.open('All jobs removed from comparison', undefined, {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  range(n: number): number[] {
    return Array.from({ length: Math.max(0, n) }, (_, i) => i);
  }

  onColumnDrop(event: CdkDragDrop<Job[]>): void {
    const jobs = [...this.comparison.jobs()];
    moveItemInArray(jobs, event.previousIndex, event.currentIndex);
    this.comparison.reorderJobs(jobs);
    // Update scroll indicators after reorder
    setTimeout(() => this.updateScrollState(), 100);
  }

  async openJobDetail(job: Job): Promise<void> {
    const { JobDetailDialogComponent } = await import('../job-detail-dialog/job-detail-dialog.component');
    this.dialog.open(JobDetailDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: job
    });
  }
}
