<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState, useEffect, ReactNode } from 'react';
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
<<<<<<< HEAD
    message: string;
=======
    message: ReactNode;
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast = ({ id, message, type, duration = 3000, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Exciting entrance
        requestAnimationFrame(() => setIsVisible(true));

        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300); // Wait for transition
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    const getIcon = () => {
<<<<<<< HEAD
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info': default: return <Info className="w-5 h-5 text-blue-500" />;
=======
        const iconProps = { className: "w-[18px] h-[18px]", strokeWidth: 1.5 };
        switch (type) {
            case 'success': return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-500`} />;
            case 'error': return <XCircle {...iconProps} className={`${iconProps.className} text-red-500`} />;
            case 'warning': return <AlertTriangle {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
            case 'info': default: return <Info {...iconProps} className={`${iconProps.className} text-blue-500`} />;
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success': return 'border-green-100 dark:border-green-900/30 bg-white dark:bg-base-100';
            case 'error': return 'border-red-100 dark:border-red-900/30 bg-white dark:bg-base-100';
            case 'warning': return 'border-yellow-100 dark:border-yellow-900/30 bg-white dark:bg-base-100';
            case 'info': default: return 'border-blue-100 dark:border-blue-900/30 bg-white dark:bg-base-100';
        }
    };

    return (
        <div
<<<<<<< HEAD
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform ${getStyles()} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ minWidth: '300px' }}
        >
            {getIcon()}
            <p className="flex-1 text-sm font-medium text-gray-700 dark:text-base-content">{message}</p>
            <button
                onClick={() => { setIsVisible(false); setTimeout(() => onClose(id), 300); }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                <X className="w-4 h-4" />
=======
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl shadow-lg border transition-all duration-300 transform ${getStyles()} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} min-w-[240px]`}
        >
            {getIcon()}
            <div className="flex-1 text-[13px] font-medium text-gray-700 dark:text-gray-200">{message}</div>
            <button
                onClick={() => { setIsVisible(false); setTimeout(() => onClose(id), 300); }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5"
                aria-label="Close"
            >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
            </button>
        </div>
    );
};

export default Toast;
