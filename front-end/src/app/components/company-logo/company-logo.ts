import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getCompanyLogoUrl, getCompanyInitials } from '../../utils/logo-url.util';

@Component({
  selector: 'app-company-logo',
  imports: [CommonModule],
  templateUrl: './company-logo.html',
  styleUrl: './company-logo.scss',
  standalone: true
})
export class CompanyLogo implements OnInit {
  @Input() companyName: string | null = null;
  @Input() companyWebsite?: string | null;
  @Input() applyLinks?: string[];
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  logoUrl: string | null = null;
  fallbackUrl: string | null = null;
  showInitials = false;
  initials = '?';
  imageError = false;
  fallbackError = false;

  ngOnInit() {
    const logoData = getCompanyLogoUrl(
      this.companyName,
      this.companyWebsite,
      this.applyLinks
    );

    if (logoData) {
      this.logoUrl = logoData.primary;
      this.fallbackUrl = logoData.fallback;
    } else {
      this.showInitials = true;
    }

    this.initials = getCompanyInitials(this.companyName);
  }

  onImageError() {
    if (!this.imageError && this.fallbackUrl) {
      // Try fallback URL
      this.imageError = true;
      this.logoUrl = this.fallbackUrl;
    } else {
      // Show initials if both fail
      this.fallbackError = true;
      this.showInitials = true;
    }
  }

  onImageLoad() {
    this.showInitials = false;
  }
}
