import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SiteCard from './SiteCard';
import EmptyState from '../common/EmptyState';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await axios.get('/api/sites');
        setSites(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load your sites');
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const handleDeleteSite = async (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await axios.delete(`/api/sites/${siteId}`);
        // Remove from state
        setSites(sites.filter(site => site._id !== siteId));
      } catch (err) {
        console.error(err);
        // Show error message
      }
    }
  };

  if (loading) return <p className="text-center py-8">Loading your sites...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Websites</h1>
        <Link
          to="/templates"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Create New Website
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {!loading && sites.length === 0 ? (
        <EmptyState
          title="No websites yet"
          description="You haven't created any websites yet. Start by choosing a template."
          ctaText="Browse Templates"
          ctaLink="/templates"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <SiteCard
              key={site._id}
              site={site}
              onDelete={() => handleDeleteSite(site._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;