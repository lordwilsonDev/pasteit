/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GeneratedImage } from '../App';

interface ImagePreviewModalProps {
    image: GeneratedImage;
    onClose: () => void;
    onRegenerate: () => void;
    onDownload: () => void;
}

const ImagePreviewModal = ({ image, onClose, onRegenerate, onDownload }: ImagePreviewModalProps) => {

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    if (image.status !== 'done' || !image.url) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Image Preview"
        >
            <motion.div
                className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={image.url}
                    alt="Enlarged generated variation"
                    className="object-contain w-full h-full rounded-lg shadow-2xl"
                />

                <div className="absolute bottom-4 flex items-center justify-center gap-4 bg-black/30 backdrop-blur-md p-3 rounded-full">
                    <button
                        onClick={onDownload}
                        className="p-3 bg-yellow-400 text-black rounded-full hover:bg-yellow-300 transition-colors transform hover:scale-110 duration-200"
                        aria-label="Download image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                    <button
                        onClick={onRegenerate}
                        className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors transform hover:scale-110 duration-200"
                        aria-label="Regenerate image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.42.71a5.002 5.002 0 00-8.479-1.554H10a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.42-.71a5.002 5.002 0 008.479 1.554H10a1 1 0 110 2h6a1 1 0 011 1v6a1 1 0 01-1 1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                 <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors"
                    aria-label="Close preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </motion.div>
        </motion.div>
    );
};

export default ImagePreviewModal;
