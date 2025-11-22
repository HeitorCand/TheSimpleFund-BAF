import React from 'react';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ 
  isOpen, 
  onClose, 
  userRole 
}) => {
  if (!isOpen) return null;

  const getMessage = () => {
    if (userRole === 'CONSULTOR') {
      return {
        title: 'Access Denied',
        message: 'Your request to become a consultant was rejected. Please contact support for more information.',
        icon: '❌'
      };
    } else if (userRole === 'INVESTIDOR') {
      return {
        title: 'Access Denied',
        message: 'Your account was rejected by the administrator. Please contact support for more information.',
        icon: '❌'
      };
    } else {
      return {
        title: 'Access Denied',
        message: 'Your account was rejected. Please contact support for more information.',
        icon: '❌'
      };
    }
  };

  const { title, message, icon } = getMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">{icon}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full bg-[#fa7f7f]-600 text-white px-4 py-2 rounded hover:bg-[#fa7f7f]-700 transition-colors"
            >
              I Understand
            </button>
            <a
              href="mailto:suporte@verosolutions.com"
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedModal;