import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import ColorPicker from '../inputs/ColorPicker';
import FontSelector from '../inputs/FontSelector';
import LayoutSelector from '../inputs/LayoutSelector';
import ContentEditor from '../inputs/ContentEditor';
import PreviewPane from './PreviewPane';
import Toast from '../ui/Toast';

const CustomizerEditor = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();

  const [site, setSite] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [customizations, setCustomizations] = useState({
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#ffffff',
      text: '#1f2937'
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Roboto'
    },
    layout: 'default',
    content: {}
  });

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await axios.get(`/api/sites/${siteId}`);
        setSite(res.data.data);
        setTemplate(res.data.data.template);
        
        // If site has customizations, load them
        if (res.data.data.customizations) {
          setCustomizations(res.data.data.customizations);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.error || 'Site yüklenirken bir hata oluştu';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        setLoading(false);
        // Redirect if error or not found
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };

    fetchSite();
  }, [siteId, navigate]);

  const showToast = (message, type = 'success', duration = 5000) => {
    setToast({ show: true, message, type });
    if (duration) {
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, duration);
    }
  };

  const handleCustomizationChange = (category, key, value) => {
    setCustomizations(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleLayoutChange = (layout) => {
    setCustomizations(prev => ({
      ...prev,
      layout
    }));
  };

  const handleContentChange = (newContent) => {
    setCustomizations(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.put(`/api/sites/${siteId}`, {
        customizations
      });
      setSaving(false);
      showToast('Değişiklikler başarıyla kaydedildi', 'success');
    } catch (err) {
      console.error(err);
      setSaving(false);
      const errorMsg = err.response?.data?.error || 'Değişiklikler kaydedilirken bir hata oluştu';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };
  
  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const result = await axios.put(`/api/sites/${siteId}/publish`);
      setPublishing(false);
      showToast('Siteniz başarıyla yayınlandı!', 'success');
      
      // Site URL'sini göster
      if (result.data && result.data.url) {
        setTimeout(() => {
          if (confirm(`Siteniz yayınlandı! Görmek ister misiniz?\n\n${result.data.url}`)) {
            window.open(result.data.url, '_blank');
          }
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setPublishing(false);
      const errorMsg = err.response?.data?.error || 'Site yayınlanırken bir hata oluştu';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!site || !template) return <div className="text-center py-8"><p className="text-red-600">Site bulunamadı</p><button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Panele Dön</button></div>;

  return (
    <div className="flex h-screen">
      {/* Toast notification */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: '' })} />}
      
      {/* Sidebar with controls */}
      <div className="w-80 bg-gray-100 border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Sitenizi Özelleştirin</h2>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Renkler</h3>
            <ColorPicker
              label="Ana Renk"
              value={customizations.colors.primary}
              onChange={(value) => handleCustomizationChange('colors', 'primary', value)}
            />
            <ColorPicker
              label="İkincil Renk"
              value={customizations.colors.secondary}
              onChange={(value) => handleCustomizationChange('colors', 'secondary', value)}
            />
            <ColorPicker
              label="Metin Rengi"
              value={customizations.colors.text}
              onChange={(value) => handleCustomizationChange('colors', 'text', value)}
            />
            <ColorPicker
              label="Arka Plan Rengi"
              value={customizations.colors.background}
              onChange={(value) => handleCustomizationChange('colors', 'background', value)}
            />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Yazı Tipleri</h3>
            <FontSelector
              label="Başlık Yazı Tipi"
              value={customizations.fonts.heading}
              options={template.customizableOptions.fonts}
              onChange={(value) => handleCustomizationChange('fonts', 'heading', value)}
            />
            <FontSelector
              label="Gövde Yazı Tipi"
              value={customizations.fonts.body}
              options={template.customizableOptions.fonts}
              onChange={(value) => handleCustomizationChange('fonts', 'body', value)}
            />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Düzen</h3>
            <LayoutSelector
              value={customizations.layout}
              options={template.customizableOptions.layouts}
              onChange={handleLayoutChange}
            />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">İçerik</h3>
            <ContentEditor
              templateStructure={template.structure}
              content={customizations.content}
              onChange={handleContentChange}
            />
          </div>
          
          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </>
              ) : 'Değişiklikleri Kaydet'}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              {publishing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yayınlanıyor...
                </>
              ) : 'Yayınla'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Preview pane */}
      <div className="flex-1 overflow-auto">
        <PreviewPane
          template={template}
          customizations={customizations}
        />
      </div>
    </div>
  );
};

export default CustomizerEditor;