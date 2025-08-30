/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';
import { STYLE_PRESETS, StylePreset } from '../lib/prompts';

interface PromptEnhancersProps {
    onStyleClick: (style: StylePreset) => void;
}

const PromptEnhancers: React.FC<PromptEnhancersProps> = ({ onStyleClick }) => {
    return (
        <div className="w-full">
            <p className="text-sm text-neutral-400 mb-2">Or, add a style:</p>
            <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((style) => (
                    <motion.button
                        key={style.name}
                        onClick={() => onStyleClick(style)}
                        className="px-3 py-1 bg-neutral-700/50 text-neutral-300 text-sm rounded-full hover:bg-neutral-700 hover:text-white transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {style.name}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default PromptEnhancers;
