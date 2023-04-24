import 'intl-polyfill';
import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { LocalizationProvider, ReactLocalization } from '@fluent/react';

// Store all translations as a simple object which is available 
// synchronously and bundled with the rest of the code.
const RESOURCES = {
    'fr': new FluentResource('hello = Salut le monde !'),
    'en-US': new FluentResource('hello = Hello, world!'),
    'pl': new FluentResource('hello = Witaj świecie!'),
};

// A generator function responsible for building the sequence 
// of FluentBundle instances in the order of user's language
// preferences.
function* generateBundles(userLocales) {
    // Choose locales that are best for the user.
    const currentLocales = negotiateLanguages(
        userLocales,
        ['fr', 'en-US', 'pl'],
        { defaultLocale: 'en-US' }
    );

    for (const locale of currentLocales) {
        const bundle = new FluentBundle(locale);
        bundle.addResource(RESOURCES[locale]);
        yield bundle;
    }
}

// The ReactLocalization instance stores and caches the sequence of generated
// bundles. You can store it in your app's state.
export const l10n = new ReactLocalization(generateBundles(navigator.languages));
