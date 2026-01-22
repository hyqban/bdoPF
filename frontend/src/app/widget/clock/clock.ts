import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
    selector: 'widget-clock',
    imports: [CommonModule],
    templateUrl: './clock.html',
    styleUrl: './clock.scss',
})
export class Clock {
    currentTime = signal(new Date());

    constructor() {
        this.startClock();
    }

    private startClock() {
        const update = () => {
            const now = new Date();
            this.currentTime.set(now);
            setTimeout(update, 1000 - now.getMilliseconds());
        };
        update();
    }
}
