import { useEffect } from 'react';

export type Appearance = 'light';

const applyLightTheme = () => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

export function initializeTheme() {
    applyLightTheme();
}

export function useAppearance() {
    useEffect(() => {
        applyLightTheme();
    }, []);

    return { appearance: 'light' as const } as const;
}
