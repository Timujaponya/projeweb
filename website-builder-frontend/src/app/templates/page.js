// filepath: /home/timucin/website-builder/website-builder-frontend/src/app/templates/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import api from '@/utils/api';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/api/templates');
        setTemplates(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Şablonlar yüklenirken hata:', err);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) return <div className="text-center py-10">Şablonlar yükleniyor...</div>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Şablonlar</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template._id} className="border rounded-lg overflow-hidden shadow-lg">
              {/* Template card content */}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <Link 
                  href={`/dashboard/create-site?templateId=${template._id}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Bu Şablonu Kullan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}