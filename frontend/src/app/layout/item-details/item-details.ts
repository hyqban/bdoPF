import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SearchService } from '../../services/search-service';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { I18nService } from '../../services/i18n-service';
import { Amount } from '../amount/amount';
@Component({
    selector: 'app-item-details',
    imports: [MatCardModule, MatTabsModule, Amount],
    templateUrl: './item-details.html',
    styleUrl: './item-details.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetails {
    constructor(protected search: SearchService, protected i18n: I18nService) {}
}
