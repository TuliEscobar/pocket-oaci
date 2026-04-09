'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('File uploaded successfully!');
                setFile(null);
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                    setMessage('');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Upload failed');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An unexpected error occurred');
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md relative shadow-2xl shadow-cyan-500/10"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-2">Upload Document</h2>
                            <p className="text-zinc-400 text-sm mb-6">
                                Upload PDF manuals to your knowledge base.
                            </p>

                            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center hover:border-cyan-500/50 transition-colors group bg-zinc-950/50">
                                <div className="p-3 bg-zinc-800 rounded-full mb-4 group-hover:bg-cyan-900/20 transition-colors">
                                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                                </div>

                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="modal-file-upload"
                                />

                                <label
                                    htmlFor="modal-file-upload"
                                    className="cursor-pointer text-sm font-medium text-white hover:text-cyan-400 transition-colors mb-1"
                                >
                                    {file ? file.name : 'Click to select PDF'}
                                </label>
                                <p className="text-xs text-zinc-500">Max 10MB</p>
                            </div>

                            {status === 'success' && (
                                <div className="mt-4 p-3 bg-green-900/20 border border-green-900/50 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{message}</span>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{message}</span>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="mt-6 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload'
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
