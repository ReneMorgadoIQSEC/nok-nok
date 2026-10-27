import { Component, computed, EventEmitter, HostListener, inject, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
})
export class Header {
  @Output() onMenuClick = new EventEmitter<boolean>();
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  emailFirstLetter = computed(() => this.authService.email.charAt(0).toUpperCase());
  navbarVisible = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
        filter((url) => url.startsWith('/home/')),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeNavbar());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.navbarVisible()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      this.closeNavbar();
      return;
    }

    if (target.closest('app-navbar') || target.closest('.header__menu')) {
      return;
    }

    this.closeNavbar();
  }

  toggleNavbar() {
    this.navbarVisible.set(!this.navbarVisible());
    this.onMenuClick.emit(this.navbarVisible());
  }

  private closeNavbar() {
    this.navbarVisible.set(false);
    this.onMenuClick.emit(false);
  }
}