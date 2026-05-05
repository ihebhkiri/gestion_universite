import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {AnnouncementLike} from '../announcement-ui.types';

@Component({
  selector: 'app-announcement-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-hero-slider.component.html',
  styleUrl: './announcement-hero-slider.component.scss'
})
export class AnnouncementHeroSliderComponent implements OnChanges, OnDestroy {
  @Input() announcements: AnnouncementLike[] | null = [];
  @Input() autoplayMs = 5200;
  @Output() viewDetails = new EventEmitter<AnnouncementLike>();

  activeIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;

  get slides(): AnnouncementLike[] {
    const featured = (this.announcements ?? []).filter(item => {
      const priority = `${item.priority ?? ''}`.toUpperCase();
      const type = `${item.type ?? ''}`.toUpperCase();
      return item.pinned || item.urgent || type === 'URGENT' || priority === 'HIGH' || priority === 'CRITICAL';
    });
    return featured.length ? featured.slice(0, 6) : (this.announcements ?? []).slice(0, 3);
  }

  get active(): AnnouncementLike | null {
    return this.slides[this.activeIndex] ?? null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['announcements']) {
      this.activeIndex = Math.min(this.activeIndex, Math.max(this.slides.length - 1, 0));
      this.restart();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  next(): void {
    if (!this.slides.length) return;
    this.activeIndex = (this.activeIndex + 1) % this.slides.length;
  }

  prev(): void {
    if (!this.slides.length) return;
    this.activeIndex = (this.activeIndex - 1 + this.slides.length) % this.slides.length;
  }

  goTo(index: number): void {
    this.activeIndex = index;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  private restart(): void {
    this.clearTimer();
    if (this.slides.length < 2) return;
    this.timer = setInterval(() => {
      if (!this.paused) this.next();
    }, this.autoplayMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
