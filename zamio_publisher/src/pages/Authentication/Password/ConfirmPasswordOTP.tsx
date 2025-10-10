import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnhancedPasswordReset } from '../../../components/verification/EnhancedPasswordReset';

const ConfirmPasswordOTP = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const handleResetSuccess = () => {
    navigate('/sign-in', { 
      state: { 
        successMessage: 'Password reset successfully! You can now log in with your new password.' 
      } 
    });
  };

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h2 className="text-5xl font-bold text-white text-center mb-8">
          ZamIO Publishers
        </h2>

        <EnhancedPasswordReset
          email={email}
          onResetSuccess={handleResetSuccess}
          initialMethod="code"
          showMethodSelection={true}
        />
      </div>
    </div>
  );
};

export default ConfirmPasswordOTP;
