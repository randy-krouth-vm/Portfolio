import { useEffect, useRef } from 'react';

export function useWheelScale(
    initial = 1,
    min = 0.6,
    max = 1.4,
    step = 0.05
) {
    const scale = useRef(initial);

    useEffect(() => {
        const root = document.getElementById('root');

        const applyScale = () => {
            if (root) {
                root.style.transform = `scale(${scale.current})`;
                root.style.transformOrigin = 'top center';
            }
        };

        const onWheel = (e) => {
            if (!e.ctrlKey) return;

            scale.current += e.deltaY < 0 ? step : -step;
            scale.current = Math.max(min, Math.min(max, scale.current));

            applyScale();
        };

        const onKeyDown = (e) => {
            if (e.ctrlKey && e.key === '0') {

                scale.current = initial;
                applyScale();
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [initial, min, max, step]);
}

