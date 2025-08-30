/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { generateImageVariation } from './services/geminiService';
import ImageCard from './components/PolaroidCard';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import ImagePreviewModal from './components/ImagePreviewModal';
import { RANDOM_PROMPTS, StylePreset } from './lib/prompts';
import PromptEnhancers from './components/PromptEnhancers';


const NUM_VARIATIONS = 4;

export interface GeneratedImage {
    status: 'pending' | 'done' | 'error';
    url?: string;
    error?: string;
}

const primaryButtonClasses = "font-permanent-marker text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0";
const secondaryButtonClasses = "font-permanent-marker text-xl text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";

function App() {
    const [subjectImage, setSubjectImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [appState, setAppState] = useState<'idle' | 'image-uploaded' | 'generating' | 'results-shown'>('idle');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSubjectImage(reader.result as string);
                setAppState('image-uploaded');
                setGeneratedImages([]); // Clear previous results
                setPrompt(''); // Clear prompt
                setNegativePrompt(''); // Clear negative prompt
                setShowAdvanced(false); // Hide advanced options
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateClick = async () => {
        if (!subjectImage || !prompt.trim()) return;

        setIsGenerating(true);
        setAppState('generating');
        
        const initialImages: GeneratedImage[] = Array(NUM_VARIATIONS).fill({ status: 'pending' });
        setGeneratedImages(initialImages);

        const generationPromises = initialImages.map((_, index) => 
            generateImageVariation(subjectImage, prompt, negativePrompt)
                .then(resultUrl => ({ status: 'done', url: resultUrl } as GeneratedImage))
                .catch(err => {
                    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                    console.error(`Failed to generate variation ${index + 1}:`, err);
                    return { status: 'error', error: errorMessage } as GeneratedImage;
                })
        );
        
        const results = await Promise.all(generationPromises);

        setGeneratedImages(results);
        setIsGenerating(false);
        setAppState('results-shown');
    };

    const handleRegenerateVariation = async (index: number) => {
        if (!subjectImage || !prompt.trim() || generatedImages[index]?.status === 'pending') return;
        
        console.log(`Regenerating variation for index ${index}...`);
        
        // Close modal if it's open for the image being regenerated
        if(selectedImageIndex === index) {
            setSelectedImageIndex(null);
        }

        setGeneratedImages(prev => {
            const newImages = [...prev];
            newImages[index] = { status: 'pending' };
            return newImages;
        });

        try {
            const resultUrl = await generateImageVariation(subjectImage, prompt, negativePrompt);
            setGeneratedImages(prev => {
                const newImages = [...prev];
                newImages[index] = { status: 'done', url: resultUrl };
                return newImages;
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImages(prev => {
                const newImages = [...prev];
                newImages[index] = { status: 'error', error: errorMessage };
                return newImages;
            });
            console.error(`Failed to regenerate variation for index ${index}:`, err);
        }
    };
    
    const handleReset = () => {
        setSubjectImage(null);
        setGeneratedImages([]);
        setPrompt('');
        setAppState('idle');
    };

    const handleDownloadIndividualImage = (index: number) => {
        const image = generatedImages[index];
        if (image?.status === 'done' && image.url) {
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `background-weaver-variation-${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const successfulImages = generatedImages.filter(img => img.status === 'done' && img.url);

        if (successfulImages.length === 0) return;

        await Promise.all(successfulImages.map(async (image, index) => {
            if (image.url) {
                try {
                    const response = await fetch(image.url);
                    const blob = await response.blob();
                    const originalIndex = generatedImages.findIndex(img => img.url === image.url);
                    zip.file(`variation-${originalIndex + 1}.jpg`, blob);
                } catch (error) {
                    console.error(`Failed to fetch image ${index} for zipping:`, error);
                }
            }
        }));

        if (Object.keys(zip.files).length > 0) {
            zip.generateAsync({ type: "blob" }).then(content => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "background-weaver-pack.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    };

    const handleSurpriseMe = () => {
        const randomPrompt = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
        setPrompt(randomPrompt);
    };

    const handleStyleClick = (style: StylePreset) => {
        setPrompt(prev => prev ? `${prev}, ${style.prompt}` : style.prompt);
    };
    
    const openImageModal = (index: number) => {
        if(generatedImages[index]?.status === 'done') {
            setSelectedImageIndex(index);
        }
    }

    return (
        <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center p-4 pb-24 overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
            
            <div className="z-10 flex flex-col items-center w-full max-w-5xl mx-auto flex-1">
                <header className="text-center my-10 md:my-16">
                    <h1 className="text-6xl md:text-8xl font-caveat font-bold text-neutral-100">AI Background Weaver</h1>
                    <p className="font-permanent-marker text-neutral-300 mt-2 text-xl tracking-wide">Weave the perfect scene for your creations.</p>
                </header>

                <AnimatePresence mode="wait">
                    {appState === 'idle' && (
                        <motion.div
                             key="idle"
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -20 }}
                             transition={{ duration: 0.5 }}
                             className="flex flex-col items-center w-full max-w-md"
                        >
                            <label htmlFor="file-upload" className="cursor-pointer group w-full transform hover:scale-105 transition-transform duration-300">
                                 <ImageCard 
                                     status="done"
                                     isUploadCard={true}
                                 />
                            </label>
                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                            <p className="mt-8 font-permanent-marker text-neutral-500 text-center max-w-xs text-lg">
                                Upload a character, product, or any subject to begin.
                            </p>
                        </motion.div>
                    )}

                    {appState === 'image-uploaded' && subjectImage && (
                        <motion.div
                            key="image-uploaded"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center gap-6 w-full max-w-lg"
                        >
                            <div className="w-full max-w-sm">
                                <img src={subjectImage} alt="Uploaded subject" className="rounded-lg shadow-lg w-full h-auto object-contain" />
                            </div>
                            <div className="w-full space-y-4">
                                <div className="relative w-full">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the background you want to create... e.g., 'a mystical forest at night, glowing mushrooms'"
                                        className="w-full h-24 p-3 pr-12 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 placeholder:text-neutral-500 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-200"
                                        aria-label="Background prompt"
                                    />
                                    <button
                                        onClick={handleSurpriseMe}
                                        className="absolute top-3 right-3 p-1.5 bg-neutral-700/50 rounded-full text-neutral-300 hover:bg-neutral-700 hover:text-yellow-300 transition-all duration-200 transform hover:scale-110"
                                        aria-label="Surprise me with a random prompt"
                                        title="Surprise me!"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                            <path d="M14.5 9a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM12 11.5a.5.5 0 00-.5-.5h-1a.5.5 0 000 1h1a.5.5 0 00.5-.5zM9.5 14a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM11 9.5a.5.5 0 00-.5-.5h-1a.5.5 0 000 1h1a.5.5 0 00.5-.5z" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <PromptEnhancers onStyleClick={handleStyleClick} />

                                <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <textarea
                                            value={negativePrompt}
                                            onChange={(e) => setNegativePrompt(e.target.value)}
                                            placeholder="What to avoid... e.g., 'trees, daytime, text'"
                                            className="w-full h-20 p-3 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 placeholder:text-neutral-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-200"
                                            aria-label="Negative prompt"
                                        />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">
                                    {showAdvanced ? '[-] Hide' : '[+]'} Advanced Options
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <button onClick={handleReset} className={secondaryButtonClasses}>
                                    Different Photo
                                </button>
                                <button onClick={handleGenerateClick} disabled={!prompt.trim() || isGenerating} className={primaryButtonClasses}>
                                    {isGenerating ? 'Weaving...' : 'Generate'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {(appState === 'generating' || appState === 'results-shown') && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {generatedImages.map((image, index) => (
                                    <ImageCard
                                        key={index}
                                        status={image.status}
                                        imageUrl={image.url}
                                        error={image.error}
                                        onClick={() => openImageModal(index)}
                                        onRegenerate={() => handleRegenerateVariation(index)}
                                        onDownload={() => handleDownloadIndividualImage(index)}
                                    />
                                ))}
                            </div>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                {appState === 'results-shown' && (
                                    <>
                                        <button onClick={handleReset} className={secondaryButtonClasses}>
                                            New Project
                                        </button>
                                         <button 
                                            onClick={handleDownloadAll} 
                                            className={primaryButtonClasses}
                                            disabled={generatedImages.every(img => img.status !== 'done')}
                                        >
                                            Download All
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="fixed bottom-24 right-4 z-40 md:bottom-6 md:right-6">
                 <button
                    onClick={() => setIsChatOpen(true)}
                    className="bg-yellow-400 text-black rounded-full p-4 shadow-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                    aria-label="Open Creative Assistant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12m16 8l-2.293-2.293a1 1 0 00-1.414 0L14 16l2.293-2.293a1 1 0 000-1.414L14 10" />
                    </svg>
                </button>
            </div>

            <Footer />

            <AnimatePresence>
                {isChatOpen && <ChatAssistant onClose={() => setIsChatOpen(false)} />}
            </AnimatePresence>
            
            <AnimatePresence>
            {selectedImageIndex !== null && generatedImages[selectedImageIndex] && (
                <ImagePreviewModal
                    image={generatedImages[selectedImageIndex]}
                    onClose={() => setSelectedImageIndex(null)}
                    onRegenerate={() => handleRegenerateVariation(selectedImageIndex)}
                    onDownload={() => handleDownloadIndividualImage(selectedImageIndex)}
                />
            )}
            </AnimatePresence>
        </main>
    );
}

export default App;