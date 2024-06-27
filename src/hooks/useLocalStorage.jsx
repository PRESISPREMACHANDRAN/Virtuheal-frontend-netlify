import { useState, useEffect } from "react";

/**
 * Retrieves the value from localStorage or returns the initial value.
 * Handles server-side rendering (SSR) for Next.js.
 *
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {*} initValue - The initial value to use if none is found in localStorage.
 * @returns {*} - The value from localStorage or the initial value.
 */
const getLocalValue = (key, initValue) => {
    // SSR Next.js
    if (typeof window === 'undefined') return initValue;

    // if a value is already stored
    const localValue = JSON.parse(localStorage.getItem(key));
    if (localValue) return localValue;

    // return result of a function
    if (initValue instanceof Function) return initValue();

    return initValue;
}

/**
 * Custom hook to manage state with localStorage.
 *
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {*} initValue - The initial value to use if none is found in localStorage.
 * @returns {[any, function]} - The current state value and a function to update it.
 */
const useLocalStorage = (key, initValue) => {
    const [value, setValue] = useState(() => {
        return getLocalValue(key, initValue);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value])

    return [value, setValue];
}

export default useLocalStorage;
