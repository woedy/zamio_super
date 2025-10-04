import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnhancedEmailVerification } from '../../components/verification/EnhancedEmailVerification';

const VerifyEmail = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const handleVerificationSuccess = () => {
    navigate('/sign-in', { 
      state: { 
        successMessage: 'Email verified successfully! You can now log in.' 
      } 
    });
  };

  if (!email) {
    navigate('/sign-up');
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h2 className="text-5xl font-bold text-white text-center mb-8">
          ZamIO
        </h2>

        <EnhancedEmailVerification
          email={email}
          onVerificationSuccess={handleVerificationSuccess}
          initialMethod="code"
          showMethodSelection={true}
        />
      </div>
    </div>
  );
};

export default VerifyEmail;
