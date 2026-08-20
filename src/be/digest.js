const canonicalize = (value) => {
    if (value === undefined || value === null) {
        return 'null';
    }

    if (Array.isArray(value)) {
        return `[${value.map(canonicalize).join(',')}]`;
    }

    if (typeof value === 'object') {
        const entries = Object.keys(value)
            .sort()
            .map((key) => `${key}:${canonicalize(value[key])}`);
        return `{${entries.join(',')}}`;
    }

    return JSON.stringify(value);
};

const fnv1a = (text, seed) => {
    let hash = seed;

    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(36);
};

export const digest = (value) => {
    const canonical = canonicalize(value);
    return `${canonical.length.toString(36)}.${fnv1a(canonical, 0x811c9dc5)}.${fnv1a(canonical, 0x9e3779b9)}`;
};
