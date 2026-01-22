import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export function useCurrentUrl() {
    const router = inject(Router);

    return toSignal(
        router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e: NavigationEnd) => e.urlAfterRedirects)
        ),
        {
            initialValue: router.url,
        }
    );
}
