'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPage() {
    const t = useTranslations('Upload'); // You'll need translations
    const router = useRouter();
    const { user, isLoaded } = useUser();
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
                setMessage('File uploaded successfully! It will be processed shortly.');
                setFile(null);
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

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    const isPro = user?.publicMetadata?.plan === 'pro';

    if (!isPro) {
        return (
            <div className="min-h-screen bg-black text-white p-8 pt-24 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Pro Plan Required</h1>
                <p className="text-zinc-400 mb-8 max-w-md">
                    Document uploading is an exclusive feature for Pro users. Upgrade your plan to upload and analyze your own aviation documents.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-full hover:bg-cyan-400 transition-colors"
                >
                    Go Back Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    Upload Documents
                </h1>
                <p className="text-zinc-400 mb-8">
                    Upload your PDF manuals or charts to include them in your personal knowledge base.
                </p>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                    <div className="border-2 border-dashed border-zinc-700 rounded-xl p-12 flex flex-col items-center justify-center hover:border-cyan-500/50 transition-colors group">
                        <div className="p-4 bg-zinc-800 rounded-full mb-4 group-hover:bg-cyan-900/20 transition-colors">
                            <Upload className="w-8 h-8 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                        </div>

                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />

                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-lg font-medium text-white hover:text-cyan-400 transition-colors mb-2"
                        >
                            {file ? file.name : 'Click to select a PDF'}
                        </label>
                        <p className="text-sm text-zinc-500">
                            Max size: 10MB. Supported formats: PDF
                        </p>
                    </div>

                    {file && (
                        <div className="mt-6 flex items-center justify-between bg-zinc-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-cyan-500" />
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="mt-6 p-4 bg-green-900/20 border border-green-900/50 rounded-lg flex items-center gap-3 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span>{message}</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mt-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            <span>{message}</span>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="mt-8 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Document'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
