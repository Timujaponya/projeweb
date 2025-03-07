import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TemplateCard from '../templates/TemplateCard';
import HeroSection from '../layout/HeroSection';
import FeaturesSection from '../layout/FeaturesSection';
import PricingSection from '../layout/PricingSection';

const Home = () => {
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTemplates = async () => {
      try {
        const res = await axios.get('/api/templates?featured=true&limit=6');
        setFeaturedTemplates(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchFeaturedTemplates();
  }, []);

  return (
    <>
      <HeroSection 
        title="Create Your Custom Website Today"
        subtitle="Choose from our beautiful templates and customize them to fit your needs"
        ctaText="Browse Templates"
        ctaLink="/templates"
      />
      
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Templates</h2>
        
        {loading ? (
          <p className="text-center">Loading templates...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTemplates.map(template => (
              <TemplateCard key={template._id} template={template} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            to="/templates" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            View All Templates
          </Link>
        </div>
      </div>
      
      <FeaturesSection />
      <PricingSection />
    </>
  );
};

export default Home;