<<<<<<< HEAD
import { useState, useCallback, useEffect } from 'react';
=======
import { useState, useCallback, useEffect, ReactNode } from 'react';
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
import { createPortal } from 'react-dom';
import Toast, { ToastType } from './Toast';

export interface ToastItem {
    id: string;
<<<<<<< HEAD
    message: string;
=======
    message: ReactNode;
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    type: ToastType;
    duration?: number;
}

let toastCounter = 0;
<<<<<<< HEAD
let addToastExternal: ((message: string, type: ToastType, duration?: number) => void) | null = null;

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
=======
let addToastExternal: ((message: ReactNode, type: ToastType, duration?: number) => void) | null = null;

export const showToast = (message: ReactNode, type: ToastType = 'info', duration: number = 3000) => {
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    if (addToastExternal) {
        addToastExternal(message, type, duration);
    } else {
        console.warn('ToastContainer not mounted');
    }
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

<<<<<<< HEAD
    const addToast = useCallback((message: string, type: ToastType, duration?: number) => {
=======
    const addToast = useCallback((message: ReactNode, type: ToastType, duration?: number) => {
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        const id = `toast-${Date.now()}-${toastCounter++}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        addToastExternal = addToast;
        return () => {
            addToastExternal = null;
        };
    }, [addToast]);

    return createPortal(
        <div className="fixed top-24 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
            <div className="flex flex-col gap-3 pointer-events-auto">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </div>,
        document.body
    );
};

export default ToastContainer;
