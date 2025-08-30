/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { LOADING_MESSAGES } from '../lib/prompts';

type ImageStatus = 'pending' | 'done' | 'error';

interface ImageCardProps {
    imageUrl?: string;
    status: ImageStatus;
    error?: string;
    onRegenerate?: () => void;
    onDownload?: () => void;
    onClick?: () => void;
    isUploadCard?: boolean;
}

const LoadingDisplay = () => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                return LOADING_MESSAGES[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-center p-4">
            <svg className="animate-spin h-8 w-8 text-neutral-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-neutral-300 mt-4 font-medium transition-opacity duration-500">{message}</p>
        </div>
    );
};


const ErrorDisplay = ({ error, onRegenerate }: { error?: string; onRegenerate?: () => void }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/50 backdrop-blur-sm text-center p-4">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-bold text-neutral-100 mb-2">Sorry, something went wrong.</p>
        {error && <code className="text-xs text-red-200 bg-red-900/60 rounded px-2 py-1 max-w-full text-wrap break-words mb-4">{error}</code>}
        {onRegenerate && (
            <button
                onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                className="font-permanent-marker text-sm text-center text-black bg-yellow-400 py-2 px-4 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 z-10"
            >
                Try Again
            </button>
        )}
    </div>
);

const UploadPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-neutral-500 group-hover:text-neutral-300 transition-colors duration-300 border-2 border-dashed border-neutral-700 group-hover:border-neutral-500 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className="font-permanent-marker text-xl">Upload Subject</span>
    </div>
);

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, status, error, onRegenerate, onDownload, onClick, isUploadCard = false }) => {
    
    const isClickable = !isUploadCard && status === 'done' && onClick;

    return (
        <motion.div 
            className={cn(
                "aspect-square w-full bg-neutral-900 shadow-lg flex-grow relative overflow-hidden rounded-lg group",
                isClickable && "cursor-pointer"
            )}
            onClick={isClickable ? onClick : undefined}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={isClickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
            aria-label={isClickable ? "View larger image" : "Generated image container"}
        >
            {isUploadCard ? (
                <UploadPlaceholder />
            ) : (
                <>
                    {status === 'done' && imageUrl && (
                        <>
                             <div className={cn(
                                "absolute top-2 right-2 z-20 flex flex-col gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                            )}>
                                {onDownload && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDownload(); }}
                                        className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                                        aria-label={`Download image`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                )}
                                {onRegenerate && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                                        className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                                        aria-label={`Regenerate image`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.42.71a5.002 5.002 0 00-8.479-1.554H10a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.42-.71a5.002 5.002 0 008.479 1.554H10a1 1 0 110 2h6a1 1 0 011 1v6a1 1 0 01-1 1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <img
                                key={imageUrl}
                                src={imageUrl}
                                alt="Generated variation"
                                className="w-full h-full object-cover"
                            />
                        </>
                    )}
                    {status === 'pending' && <LoadingDisplay />}
                    {status === 'error' && <ErrorDisplay error={error} onRegenerate={onRegenerate} />}
                </>
            )}
        </motion.div>
    );
};

export default ImageCard;