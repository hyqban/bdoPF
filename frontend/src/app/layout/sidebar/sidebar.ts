import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { I18nService } from '../../services/i18n-service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, MatIconModule, RouterLinkActive],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
    constructor(protected i18n: I18nService) {}

    idx = signal<number>(1);

    changeIdx(idx: number) {
        this.idx.set(idx);
    }
}
