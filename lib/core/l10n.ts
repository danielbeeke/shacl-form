import 'intl-polyfill';
import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { ReactLocalization } from '@fluent/react';

const RESOURCES = {
    'fr': new FluentResource('hello = Salut le monde !'),
    'en-US': new FluentResource('hello = Hello, world!'),
    'pl': new FluentResource('hello = Witaj świecie!'),
}

function* generateBundles(userLocales: ReadonlyArray<string>) {
    const currentLocales = negotiateLanguages(
        userLocales,
        ['fr', 'en-US', 'pl'],
        { defaultLocale: 'en-US' }
    );

    for (const locale of currentLocales) {
        const bundle = new FluentBundle(locale)
        bundle.addResource(RESOURCES[locale as keyof typeof RESOURCES])
        yield bundle
    }
}

export const l10n = new ReactLocalization(generateBundles(navigator.languages))
