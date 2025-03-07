import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateCard from '../templates/TemplateCard';
import FilterSidebar from '../templates/FilterSidebar';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    sortBy: 'newest'
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Build query params
        let queryString = '';
        if (filters.category) {
          queryString += `category=${filters.category}&`;
        }
        queryString += `priceMin=${filters.priceRange[0]}&priceMax=${filters.priceRange[1]}&sort=${filters.sortBy}`;
        
        const res = await axios.get(`/api/templates?${queryString}`);
        setTemplates(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse Templates</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
        
        <div className="flex-1">
          {loading ? (
            <p className="text-center">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-center">No templates found matching your criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map(template => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Templates;