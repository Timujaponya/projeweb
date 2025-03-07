import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import TemplatePreview from './TemplatePreview';
import PaymentModal from '../payment/PaymentModal';

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await axios.get(`/api/templates/${id}`);
        setTemplate(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load template');
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handlePurchase = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { redirect: `/templates/${id}` } });
      return;
    }
    
    setShowPaymentModal(true);
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (error) return <p className="text-center py-8 text-red-500">{error}</p>;
  if (!template) return <p className="text-center py-8">Template not found</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <TemplatePreview template={template} />
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-2">{template.name}</h1>
            <div className="flex items-center mb-4">
              <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded mr-2">
                {template.category}
              </span>
            </div>
            
            <p className="text-gray-700 mb-6">{template.description}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Customizable Features:</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Colors: {template.customizableOptions.colors.join(', ')}</li>
                <li>Fonts: {template.customizableOptions.fonts.join(', ')}</li>
                <li>Layouts: {template.customizableOptions.layouts.join(', ')}</li>
              </ul>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${template.price}</span>
                <button
                  onClick={handlePurchase}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Purchase Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showPaymentModal && (
        <PaymentModal
          template={template}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default TemplateDetail;