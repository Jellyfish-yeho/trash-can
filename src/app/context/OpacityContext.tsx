"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface OpacityContextType {
    opacity: number;
    setOpacity: (v: number) => void;
}

const OpacityContext = createContext<OpacityContextType>({
    opacity: 100,
    setOpacity: () => {},
});

export function OpacityProvider({ children }: { children: React.ReactNode }) {
    const [opacity, setOpacityState] = useState(100);

    useEffect(() => {
        const saved = localStorage.getItem("content-opacity");
        if (saved !== null) setOpacityState(Number(saved));
    }, []);

    function setOpacity(v: number) {
        setOpacityState(v);
        localStorage.setItem("content-opacity", String(v));
    }

    return (
        <OpacityContext.Provider value={{ opacity, setOpacity }}>
            {children}
        </OpacityContext.Provider>
    );
}

export function useOpacity() {
    return useContext(OpacityContext);
}