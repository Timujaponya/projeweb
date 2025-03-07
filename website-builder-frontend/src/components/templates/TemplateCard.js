import React from 'react';
import { Link } from 'react-router-dom';

const TemplateCard = ({ template }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <img 
        src={template.previewImage} 
        alt={template.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{template.name}</h3>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            {template.category}
          </span>
        </div>
        <p className="text-gray-600 mb-4 h-12 overflow-hidden">
          {template.description.substring(0, 80)}...
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">${template.price}</span>
          <Link
            to={`/templates/${template._id}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;