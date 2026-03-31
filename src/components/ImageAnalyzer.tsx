import React, { useState } from 'react';
import { Upload, Brain, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { analyzeTrafficSituation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { theme } = useTheme();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeTrafficSituation(image, 'image/png');
      setAnalysis(result);
    } catch (err) {
      setError(t('aiError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-tertiary)] p-4 lg:p-8 rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-500/10">
      <div className="flex items-center gap-4 mb-6 lg:mb-8">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-xl lg:rounded-2xl flex items-center justify-center">
          <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-[var(--text-primary)] font-bold text-lg lg:text-xl">{t('aiAssistant')}</h3>
          <p className="text-[var(--text-secondary)] text-xs lg:text-sm">{t('aiDescription')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            className={`aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden ${
              image ? 'border-blue-500/50' : 'border-[var(--border)] hover:border-gray-600'
            }`}
          >
            {image ? (
              <>
                <img src={image} alt="Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-black px-6 py-2 rounded-full font-bold">
                    {t('changeImage')}
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[var(--text-secondary)]" />
                </div>
                <div className="text-center">
                  <label className="cursor-pointer text-blue-500 font-bold hover:underline">
                    {t('uploadImage')}
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">PNG, JPG up to 10MB</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
              !image || loading 
                ? 'bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('analyzing')}
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                {t('analyzeSituation')}
              </>
            )}
          </button>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-2xl flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 min-h-[300px] border border-[var(--border)]">
          {analysis ? (
            <div className={`prose max-w-none prose-sm ${theme === 'dark' ? 'prose-invert' : ''}`}>
              <h4 className="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500" />
                {t('analysisResult')}
              </h4>
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40">
              <ImageIcon className="w-12 h-12 text-[var(--text-secondary)]" />
              <p className="text-[var(--text-secondary)] font-medium">
                {t('analysisResult')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
