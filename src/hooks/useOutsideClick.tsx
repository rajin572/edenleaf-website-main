// hooks/useOutsideClick.ts
import { useEffect, RefObject } from 'react';

const useOutsideClick = (
    ref: RefObject<HTMLElement>,
    callback: () => void
) => {
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [ref, callback]);
};

export default useOutsideClick;
