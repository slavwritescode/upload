const normalizeProvider = (provider) => {
    const charactersToRemove = [
        ' ',
        ' ',
        '.',
        ',',
        '?',
        '!',
        '%',
        '-',
        '"',
        '_',
        "'",
        "'",
        "'",
        '/',
        '\\',
        ':',
        '(',
        ')',
        '#',
        '@',
        //'&'
    ]
    let providerNormalized = provider.toString().toLowerCase().trim();
    charactersToRemove.map(c => providerNormalized = providerNormalized.replaceAll(c, ''));
    // The following line is because I must remove the & but I'd keep it somehow...
    providerNormalized = providerNormalized.replaceAll('&', '_');

    return providerNormalized;
}
export default normalizeProvider;