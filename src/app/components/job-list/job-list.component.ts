import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { JobService } from '../../services/job.service';
import { ThemeService } from '../../services/theme.service';
import { ComparisonService } from '../../services/comparison.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { Job } from '../../models/job.model';
import { TechStackExpressionParser } from '../../utils/tech-stack-expression-parser';
import { CompanyLogo } from '../company-logo/company-logo';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatBadgeModule,
    CompanyLogo
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'compare',
    'company_name',
    'job_titles',
    'locations',
    'remote_policy',
    'tech_stack'
  ];
  
  dataSource: MatTableDataSource<Job> = new MatTableDataSource<Job>();
  isLoading = true;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  
  // Filter values
  companyFilter = '';
  jobTitleFilter = '';
  locationFilter = '';
  remotePolicyFilter = '';
  techStackFilter = '';
  visaSponsorshipFilter = '';
  
  remotePolicyOptions = ['', 'Remote', 'Hybrid', 'Onsite'];
  visaSponsorshipOptions = ['', 'True', 'False', 'Not specified'];
  
  // Tech stack filter validation
  techStackFilterIsValid = true;
  techStackErrorMessage = '';
  
  private techStackParser = new TechStackExpressionParser();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private jobService: JobService,
    public themeService: ThemeService,
    public comparison: ComparisonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.loadJobs();
    this.setupFilterPredicate();
  }
  
  ngAfterViewInit(): void {
    // Paginator will be null initially because it's in an *ngIf block
    // We'll connect it after data loads in loadJobs()
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  loadJobs(): void {
    console.log('loadJobs() called');
    this.isLoading = true;
    this.jobService.loadJobs().subscribe({
      next: (jobs) => {
        console.log('Jobs received:', jobs.length, 'jobs');
        this.dataSource.data = jobs;
        this.isLoading = false;
        console.log('isLoading set to false');
        
        // Important: Wait for view to update before connecting paginator
        this.cdr.detectChanges();
        
        // Now connect paginator and sort after the view is rendered
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.paginator._intl.itemsPerPageLabel = 'Items per page:';
          this.paginator._intl.getRangeLabel = this.getCustomRangeLabel.bind(this);
        }
        
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
        
        this.updatePageSizeOptions();
        console.log('Paginator connected:', !!this.paginator);
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (job: Job, filter: string) => {
      const filters = JSON.parse(filter);
      
      // Company name filter
      const companyMatch = !filters.company || 
        (job.company_name?.toLowerCase() ?? '').includes(filters.company.toLowerCase());
      
      // Job titles filter (check if any title matches)
      const jobTitleMatch = !filters.jobTitle || 
        (job.job_titles?.some(title => 
          title?.toLowerCase().includes(filters.jobTitle.toLowerCase())
        ) ?? false);
      
      // Locations filter (check if any location matches)
      const locationMatch = !filters.location || 
        (job.locations?.some(loc => 
          loc?.toLowerCase().includes(filters.location.toLowerCase())
        ) ?? false);
      
      // Remote policy filter (exact match)
      const remotePolicyMatch = !filters.remotePolicy || 
        job.remote_policy === filters.remotePolicy;
      
      // Tech stack filter with expression support (AND, OR, NOT, parentheses)
      let techStackMatch = true;
      if (filters.techStack) {
        const parseResult = this.techStackParser.parse(filters.techStack);
        if (parseResult.expression) {
          techStackMatch = parseResult.expression.evaluate(job.tech_stack || []);
        }
      }
      
      // Visa sponsorship filter
      let visaSponsorshipMatch = true;
      if (filters.visaSponsorship) {
        if (filters.visaSponsorship === 'True') {
          visaSponsorshipMatch = job.visa_sponsorship === true;
        } else if (filters.visaSponsorship === 'False') {
          visaSponsorshipMatch = job.visa_sponsorship === false;
        } else if (filters.visaSponsorship === 'Not specified') {
          visaSponsorshipMatch = 
            job.visa_sponsorship === 'Not specified' || 
            job.visa_sponsorship === null || 
            job.visa_sponsorship === undefined ||
            job.visa_sponsorship === '';
        }
      }
      
      return companyMatch && jobTitleMatch && locationMatch && 
             remotePolicyMatch && techStackMatch && visaSponsorshipMatch;
    };
  }
  
  applyFilters(): void {
    // Validate tech stack filter expression
    if (this.techStackFilter) {
      const parseResult = this.techStackParser.parse(this.techStackFilter);
      this.techStackFilterIsValid = parseResult.isValid;
      this.techStackErrorMessage = parseResult.errorMessage || '';
    } else {
      this.techStackFilterIsValid = true;
      this.techStackErrorMessage = '';
    }
    
    const filterValue = JSON.stringify({
      company: this.companyFilter,
      jobTitle: this.jobTitleFilter,
      location: this.locationFilter,
      remotePolicy: this.remotePolicyFilter,
      techStack: this.techStackFilter,
      visaSponsorship: this.visaSponsorshipFilter
    });
    
    this.dataSource.filter = filterValue;
    
    // Reset to first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    
    // Update page size options when filtered data changes
    this.updatePageSizeOptions();
    
    // Ensure paginator is properly connected
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  
  clearFilters(): void {
    this.companyFilter = '';
    this.jobTitleFilter = '';
    this.locationFilter = '';
    this.remotePolicyFilter = '';
    this.techStackFilter = '';
    this.visaSponsorshipFilter = '';
    this.applyFilters();
  }
  
  hasActiveFilters(): boolean {
    return !!(
      this.companyFilter ||
      this.jobTitleFilter ||
      this.locationFilter ||
      this.remotePolicyFilter ||
      this.techStackFilter ||
      this.visaSponsorshipFilter
    );
  }
  
  async openJobDetail(job: Job): Promise<void> {
    const { JobDetailDialogComponent } = await import('../job-detail-dialog/job-detail-dialog.component');
    this.dialog.open(JobDetailDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: job
    });
  }
  
  async showTechStackHelp(event: Event): Promise<void> {
    event.stopPropagation();
    const { TechStackHelpDialogComponent } = await import('../tech-stack-help-dialog/tech-stack-help-dialog.component');
    this.dialog.open(TechStackHelpDialogComponent, {
      width: '900px',
      maxHeight: '90vh'
    });
  }
  
  onPageChange(): void {
    // Trigger change detection to refresh the table
    this.cdr.detectChanges();
  }
  
  updatePageSizeOptions(): void {
    // Get the current filtered data length
    const dataLength = this.dataSource.filteredData?.length || this.dataSource.data?.length || 0;
    
    // Base page size options
    const baseOptions = [5, 10, 25, 50, 100];
    
    // Add "All" option (represented by the total count) if there's data
    if (dataLength > 0) {
      // Only add if it's not already in the list and is greater than the largest base option
      if (!baseOptions.includes(dataLength) && dataLength > baseOptions[baseOptions.length - 1]) {
        this.pageSizeOptions = [...baseOptions, dataLength];
      } else if (dataLength <= baseOptions[baseOptions.length - 1]) {
        // If total is less than max base option, still add it
        this.pageSizeOptions = [...baseOptions, dataLength];
      } else {
        this.pageSizeOptions = baseOptions;
      }
    } else {
      this.pageSizeOptions = baseOptions;
    }
  }
  
  toggleCompare(job: Job, event: Event): void {
    event.stopPropagation();
    if (this.comparison.isInComparison(job.id)) {
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
        }
      });
    } else {
      this.comparison.addJob(job);
      this.snackBar.open(`Added ${job.company_name ?? 'job'} to comparison`, undefined, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  openComparison(): void {
    if (this.comparison.canCompare()) {
      this.comparison.openComparisonView();
    }
  }

  getCustomRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return `0 of ${length}`;
    }
    
    // Check if showing all items
    if (pageSize >= length) {
      return `All ${length} items`;
    }
    
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    
    return `${startIndex + 1} - ${endIndex} of ${length}`;
  }
}
