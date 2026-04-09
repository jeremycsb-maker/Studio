/**
 * Sanitizes a value, providing a fallback and cleaning up corrupted template literals.
 */
export const sanitize = (val, fallback = '') => {
    if (val === 'undefined' || val === 'null' || val === null || val === undefined) return fallback;
    if (typeof val !== 'string') return val || fallback;
    
    // Strip literal "undefined" or "null" prefix if it was corrupted by a template literal
    let cleaned = val.trim();
    if (cleaned.startsWith('undefined')) cleaned = cleaned.substring(9).trim();
    if (cleaned.startsWith('null')) cleaned = cleaned.substring(4).trim();
    
    return cleaned || fallback;
};

/**
 * Deeply merges two objects.
 */
export const deepMerge = (target, source) => {
    const output = { ...target };
    if (source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                output[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
};
