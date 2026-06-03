import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GetBanStatusServiceProxy, BanStatusDto } from '../../app/shared/api/service-proxies';
import { LocalizePipe } from '../../app/shared/pipes/localization.pipe';

@Component({
  selector: 'app-banned',
  standalone: true,
  imports: [CommonModule, LocalizePipe],
  templateUrl: './banned.component.html',
  styleUrl: './banned.component.css'
})
export class BannedComponent implements OnInit {
  banStatus?: BanStatusDto;
  loading = true;
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getBanStatusService: GetBanStatusServiceProxy
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      if (this.userId) {
        this.getBanStatusService.banStatus(this.userId).subscribe({
          next: (status) => {
            this.banStatus = status;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
