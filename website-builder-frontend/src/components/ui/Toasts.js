import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // CSS geçiş süresi sonrası kaldır
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-400';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-md border-l-4 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
      } ${getBackgroundColor()}`}
    >
      <div className="flex justify-between items-center">
        <div className="font-medium">{message}</div>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="text-gray-500 hover:text-gray-700 ml-4 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;