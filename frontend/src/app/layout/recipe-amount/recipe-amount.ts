import { Component, Input, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RecipeAmountInterface } from '../../shared/models/model';
import { SearchService } from '../../services/search-service';

@Component({
    selector: 'app-recipe-amount',
    imports: [MatIconModule, MatIconModule, ReactiveFormsModule],
    templateUrl: './recipe-amount.html',
    styleUrl: './recipe-amount.scss',
})
export class RecipeAmount implements OnInit {
    constructor(protected search: SearchService) {}
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
    @Input() recipeAmount!: WritableSignal<RecipeAmountInterface>;

    form = new FormGroup({
        requiredInput: new FormControl(''),
        optionalInput: new FormControl(''),
    });

    close() {
        this.recipeAmount.update((el) => ({
            ...el,
            open: false,
            items: [],
        }));
    }
}
