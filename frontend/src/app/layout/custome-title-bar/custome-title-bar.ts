import {
    Component,
    ElementRef,
    HostListener,
    signal,
    ViewChild,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WindowServicee } from '../../services/window-servicee';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { QueryByName } from '../../../../wailsjs/go/service/FileHandler';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    from,
    switchMap,
    tap,
    of,
} from 'rxjs';
import { SearchService } from '../../services/search-service';
import { ItemInfo, SearchResultItem } from '../../shared/models/model';

@Component({
    selector: 'app-custome-title-bar',
    imports: [
        Sidebar,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
    ],
    templateUrl: './custome-title-bar.html',
    styleUrl: './custome-title-bar.scss',
})
export class CustomeTitleBar {
    protected isFullscreen!: WritableSignal<boolean>;
    @ViewChild('autoComplete') autoCompleteResult!: ElementRef;
    isSidebarVisible: boolean = false;
    isResultVisible = signal<boolean>(false);

    query = signal('');
    isLoading = signal(false);
    debouncedQuery = signal('');
    readonly DEBOUNCE_TIME = 500;
    searchControl = new FormControl('');
    // searchResults = signal<SearchResult[]>([]);

    constructor(
        private windowService: WindowServicee,
        private elementRef: ElementRef,
        protected search: SearchService
    ) {
        this.isFullscreen = this.windowService.getIsFullscreen();
        this.search.getAddr();
        this.search.getImgPath();
    }

    @HostListener('document:click', ['$event'])
    clicikout(event: Event) {
        const isInsideComponent = this.elementRef.nativeElement.contains(event.target);

        if (!isInsideComponent) {
            this.isResultVisible.set(true);
        }
    }

    showAuto() {
        this.isResultVisible.set(false);
    }

    ngOnInit(): void {
        if (this.search.query()) {
            this.searchControl.setValue(this.search.query(), { emitEvent: false});
        }

        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.DEBOUNCE_TIME),
                distinctUntilChanged(),
                // filter((query): query is string => !!query && query.length >= 0),

                // tap((query) => {
                //     this.isLoading.set(true);
                //     this.debouncedQuery.set(query);
                // }),
                switchMap((query) => {
                    if (!query || query.length == 0) {
                        // this.searchResults.set([]);
                        this.search.addSearchResults([]);
                        this.debouncedQuery.set('');
                        this.isResultVisible.set(true);
                        this.isLoading.set(false);
                        return of(this.search.searchResults());
                    }

                    if (query === this.query()) {
                        this.isResultVisible.set(true);
                        // return of(this.searchResults());
                        return of(this.search.searchResults());
                    }

                    this.search.query.set(query as string);
                    this.isLoading.set(true);
                    this.debouncedQuery.set(query);
                    return from(QueryByName(query)).pipe(
                        catchError((error) => {
                            this.isLoading.set(true);
                            console.error('Search API Error:', error);
                            // return of([]);
                            return of(this.search.searchResults());
                        })
                    );
                })
            )
            .subscribe((results: SearchResultItem[]) => {
                this.search.addSearchResults(results);

                // this.searchResults.set(results);
                this.isResultVisible.set(false);
                this.isLoading.set(false);
                console.log(this.search.searchResults());
            });
    }

    async searchItemById(el: SearchResultItem) {
        const itemData = await this.search.selectItem(el);
        this.search.currentItem.set(itemData as ItemInfo);
        this.isResultVisible.set(true);
    }

    showSidebar() {
        this.isSidebarVisible = true;
    }

    hideSidebar() {
        this.isSidebarVisible = false;
    }

    protected enterWidgetMode() {
        this.windowService.enterWidgetMode();
    }

    protected windowClose() {
        this.windowService.windowClose();
    }

    protected windowFullscreen() {
        this.windowService.windowFullscreen();
    }

    protected windowUnfullscreen() {
        this.windowService.windowUnfullscreen();
    }

    protected windowMinimise() {
        this.windowService.windowMinimise();
    }
}
