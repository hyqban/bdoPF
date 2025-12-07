import { Component, computed } from '@angular/core';
import { SearchService } from '../../services/search-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-bread-crumbs',
    imports: [MatIconModule],
    templateUrl: './bread-crumbs.html',
    styleUrl: './bread-crumbs.scss',
})
export class BreadCrumbs {
    showItem = computed(() => this.search.breadCrumbs);

    constructor(protected search: SearchService) {}
}
