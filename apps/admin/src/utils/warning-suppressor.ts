// ============================================
// WARNING SUPPRESSOR v2 — À ajouter dans main.tsx
// Suppress annoying Ant Design + React Router warnings in dev
// ============================================

export function suppressWarnings() {
    if (process.env.NODE_ENV === 'development') {
        const originalError = console.error;
        const originalWarn = console.warn;

        // Keywords à ignorer
        const IGNORED_PATTERNS = [
            'findDOMNode',
            'ResizeObserver',
            'useForm',
            '[antd: Menu]',
            'children is deprecated',
            'tip only work in',
            'v7_startTransition',
            'v7_relativeSplatPath',
            'v6DeprecationWarnings',
            'Instance created by',
            'Warning:',
        ];

        const shouldIgnore = (value: any): boolean => {
            if (!value) return false;
            const str = String(value);
            return IGNORED_PATTERNS.some(pattern => str.includes(pattern));
        };

        // Override console.error (React warnings come through here)
        console.error = function(...args: any[]) {
            // Check all arguments for ignored patterns
            const shouldSuppress = args.some(arg => shouldIgnore(arg));
            if (!shouldSuppress) {
                originalError.apply(console, args);
            }
        };

        // Override console.warn
        console.warn = function(...args: any[]) {
            const shouldSuppress = args.some(arg => shouldIgnore(arg));
            if (!shouldSuppress) {
                originalWarn.apply(console, args);
            }
        };
    }
}

export default suppressWarnings;