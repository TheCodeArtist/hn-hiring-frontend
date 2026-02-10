import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmWarn?: boolean;
  // For two-option dialogs (e.g., "Remove this job" vs "Remove all and exit")
  secondaryAction?: {
    text: string;
    result: string;
    warn?: boolean;
  };
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p [innerHTML]="data.message"></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.cancelText ?? 'Cancel' }}</button>
      @if (data.secondaryAction) {
        <button 
          mat-raised-button 
          [color]="data.secondaryAction.warn ? 'warn' : 'primary'" 
          (click)="onSecondaryAction()"
          style="margin-left: 8px;">
          {{ data.secondaryAction.text }}
        </button>
      }
      <button 
        mat-raised-button 
        [color]="data.confirmWarn ? 'warn' : 'primary'" 
        (click)="onConfirm()"
        style="margin-left: 8px;">
        {{ data.confirmText ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
    p {
      margin: 0;
      line-height: 1.5;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onSecondaryAction(): void {
    this.dialogRef.close(this.data.secondaryAction?.result);
  }
}
