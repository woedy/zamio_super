# Implementation Plan

- [x] 1. Add verification code field to User model

  - Add verification_code field to User model for storing 4-digit codes
  - Create database migration to add the new field
  - Update existing email_token field to support both codes and tokens
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Update email verification backend logic

  - [x] 2.1 Modify email verification task to generate both code and token

    - Update send_email_verification_task to generate 4-digit code alongside token
    - Store both verification code and token in user record
    - Set expiration time for both methods (15 min for code, 60 min for token)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 Create code verification endpoint

    - Add API endpoint to verify 4-digit codes
    - Implement code validation with proper error handling
    - Clear verification data after successful verification
    - _Requirements: 3.4, 5.2, 5.3_

  - [x] 2.3 Update existing token verification endpoint

    - Ensure existing link verification continues to work
    - Maintain backward compatibility with current system
    - _Requirements: 5.3, 10.1, 10.2_

- [x] 3. Update password reset backend logic

  - [x] 3.1 Modify password reset task to generate both code and token

    - Update send_password_reset_email_task to generate 4-digit code alongside token
    - Store both reset code and token in user record
    - Set expiration time for both methods
    - _Requirements: 13.1, 13.2_

  - [x] 3.2 Create password reset code verification endpoint

    - Add API endpoint to verify password reset codes
    - Implement password update with code verification
    - Clear reset data after successful password change
    - _Requirements: 13.2, 13.3_

- [x] 4. Update email templates to include both methods

  - [x] 4.1 Enhance email verification template

    - Update HTML template to display both verification code and link
    - Update plain text template to include both options
    - Make code prominent and easy to read
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.2 Enhance password reset email template

    - Update HTML template to display both reset code and link
    - Update plain text template to include both options
    - Add security notice about password reset request
    - _Requirements: 13.1, 4.1, 4.2_

- [x] 5. Add resend functionality

  - [x] 5.1 Create resend verification endpoint

    - Add API endpoint to resend verification emails
    - Implement basic rate limiting (max 3 resends per hour)
    - Generate new code and token on resend
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 5.2 Create resend password reset endpoint

    - Add API endpoint to resend password reset emails
    - Apply same rate limiting as verification resends
    - Generate new reset code and token on resend
    - _Requirements: 12.1, 12.2, 13.1_

- [x] 6. Create simple frontend code input component

  - Create basic 4-digit code input component for frontends
  - Add automatic submission when all 4 digits are entered
  - Include basic error handling and loading states
  - Make component reusable across all ZamIO applications
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Update frontend verification flows

  - [x] 7.1 Update zamio_frontend email verification

    - Add code input option to existing verification page
    - Update verification API calls to support code verification
    - Add resend button with basic cooldown
    - _Requirements: 7.1, 1.1, 1.5_

  - [x] 7.2 Update zamio_frontend password reset

    - Add code input option to password reset flow
    - Update password reset API calls to support code verification
    - Add resend functionality to password reset
    - _Requirements: 7.1, 13.1, 13.2_

- [x] 8. Update other frontend applications

  - [x] 8.1 Update zamio_admin verification flows

    - Apply same verification enhancements as zamio_frontend
    - Ensure admin users can use both verification methods
    - _Requirements: 7.2_

  - [x] 8.2 Update zamio_stations verification flows

    - Apply same verification enhancements as zamio_frontend
    - Ensure station users can use both verification methods
    - _Requirements: 7.3_

  - [x] 8.3 Update zamio_publisher verification flows

    - Apply same verification enhancements as zamio_frontend
    - Ensure publisher users can use both verification methods
    - _Requirements: 7.4_

- [x] 9. Add basic testing


  - Write unit tests for new code verification endpoints
  - Test email template generation with both methods
  - Test resend functionality and rate limiting
  - Verify backward compatibility with existing token system
  - _Requirements: All requirements validation_
