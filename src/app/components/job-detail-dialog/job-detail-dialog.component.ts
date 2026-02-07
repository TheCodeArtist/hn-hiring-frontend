import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Job } from '../../models/job.model';
import { ComparisonService } from '../../services/comparison.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { CompanyLogo } from '../company-logo/company-logo';

@Component({
  selector: 'app-job-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CompanyLogo
  ],
  templateUrl: './job-detail-dialog.component.html',
  styleUrls: ['./job-detail-dialog.component.scss']
})
export class JobDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<JobDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public job: Job,
    private comparison: ComparisonService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  isInComparison(): boolean {
    return this.comparison.isInComparison(this.job.id);
  }

  toggleCompare(): void {
    if (this.comparison.isInComparison(this.job.id)) {
      const name = this.job.company_name ?? 'this job';
      const data: ConfirmDialogData = {
        title: 'Remove from comparison',
        message: `Are you sure you want to remove <strong>${name}</strong> from comparison?`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        confirmWarn: true
      };
      this.dialog.open(ConfirmDialogComponent, { data, width: '400px' }).afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.comparison.removeJob(this.job.id);
          this.snackBar.open(`Removed ${name} from comparison`, undefined, {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
    } else {
      this.comparison.addJob(this.job);
      this.snackBar.open(`Added ${this.job.company_name ?? 'job'} to comparison`, undefined, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  getHnLink(): string {
    return `https://news.ycombinator.com/item?id=${this.job.id}`;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
