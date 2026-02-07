import { Component } from '@angular/core';
import { JobListComponent } from './components/job-list/job-list.component';
import { ComparisonViewComponent } from './components/comparison-view/comparison-view.component';
import { ComparisonService } from './services/comparison.service';

@Component({
  selector: 'app-root',
  imports: [JobListComponent, ComparisonViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(public comparison: ComparisonService) {}
}
