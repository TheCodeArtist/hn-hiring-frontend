import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-tech-stack-help-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './tech-stack-help-dialog.component.html',
  styleUrls: ['./tech-stack-help-dialog.component.scss']
})
export class TechStackHelpDialogComponent {
  basicExamples = [
    { query: 'Python', description: 'Find jobs with Python' },
    { query: 'React', description: 'Find jobs with React' },
    { query: '"Machine Learning"', description: 'Find jobs with "Machine Learning" (exact phrase)' }
  ];

  operatorExamples = [
    { 
      operator: 'AND',
      query: 'Python AND Django',
      description: 'Jobs that have BOTH Python AND Django'
    },
    {
      operator: 'OR',
      query: 'Python OR Ruby',
      description: 'Jobs that have EITHER Python OR Ruby (or both)'
    },
    {
      operator: 'NOT',
      query: 'Python AND NOT Django',
      description: 'Jobs with Python but WITHOUT Django'
    },
    {
      operator: 'Parentheses',
      query: '(Python OR Ruby) AND React',
      description: 'Jobs with React AND (Python OR Ruby)'
    }
  ];

  complexExamples = [
    {
      title: 'Backend Developer',
      query: '(Python OR Node) AND PostgreSQL AND NOT Java',
      description: 'Python or Node.js backend with PostgreSQL, excluding Java'
    },
    {
      title: 'Full-Stack Developer',
      query: '(React OR Vue OR Angular) AND (Python OR Node OR Ruby)',
      description: 'Frontend framework + backend language'
    },
    {
      title: 'Data Science',
      query: 'Python AND ("Machine Learning" OR "Deep Learning" OR TensorFlow)',
      description: 'Python data science with ML frameworks'
    },
    {
      title: 'Cloud-Native',
      query: '(Kubernetes OR Docker) AND (Go OR Rust)',
      description: 'Modern cloud-native stack'
    },
    {
      title: 'Mobile Development',
      query: '("React Native" OR Flutter OR Swift) AND NOT "Objective-C"',
      description: 'Modern mobile development, excluding Objective-C'
    }
  ];

  precedenceRules = [
    { priority: '1 (Highest)', operator: 'Parentheses ()', example: '(A OR B) AND C' },
    { priority: '2', operator: 'NOT', example: 'NOT A' },
    { priority: '3', operator: 'AND', example: 'A AND B' },
    { priority: '4 (Lowest)', operator: 'OR', example: 'A OR B' }
  ];

  tips = [
    'All searches are case-insensitive: "python" = "Python" = "PYTHON"',
    'Partial matching works: "Post" matches "PostgreSQL"',
    'Use quotes for multi-word terms: "Machine Learning"',
    'Use parentheses to control evaluation order',
    'Operators can be lowercase: "and", "or", "not"',
    'Combine positive and negative: "React AND NOT jQuery"'
  ];

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a snackbar notification here
      console.log('Copied to clipboard:', text);
    });
  }
}
