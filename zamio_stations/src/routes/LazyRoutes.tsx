import { lazyLoad } from '../utils/lazyLoad';

// Authentication Pages
export const ZamIOLandingPage = lazyLoad(() => import('../pages/Landing/LandingPage'));
export const SignIn = lazyLoad(() => import('../pages/Authentication/SignIn'));
export const SignUp = lazyLoad(() => import('../pages/Authentication/SignUp'));
export const VerifyEmail = lazyLoad(() => import('../pages/Authentication/VerifyEmail'));

// Onboarding Pages
export const CompleteProfile = lazyLoad(() => import('../pages/Authentication/Onboarding/CompleteProfile'));
export const PaymentInfo = lazyLoad(() => import('../pages/Authentication/Onboarding/PaymentInfo'));
export const AddStaff = lazyLoad(() => import('../pages/Authentication/Onboarding/AddStaff'));

// Dashboard
export const StationDashboard2 = lazyLoad(() => import('../pages/Dashboard/StationDashboard2'));

// Station Management
export const StationProfilePage = lazyLoad(() => import('../pages/StationManagement/StationProfile'));
export const StationStaffManagement = lazyLoad(() => import('../pages/StationManagement/StationStaffManagement'));
export const StationCompliance = lazyLoad(() => import('../pages/StationManagement/StationCompliance'));
export const PlaylogManagement = lazyLoad(() => import('../pages/StationManagement/PlaylogManagement'));

// Match and Dispute Management
export const MatchLogViewer = lazyLoad(() => import('../pages/MatchLogViewer/FullDetectionTable'));
export const AllDisputeMatches = lazyLoad(() => import('../pages/MatchDisputeManagement/AllDisputeMatch'));
export const DisputeDetails = lazyLoad(() => import('../pages/MatchDisputeManagement/DisputeDetails'));

// Complaint Management
export const ComplaintsList = lazyLoad(() => import('../pages/ComplaintManagement/ComplaintsList'));
export const ComplaintDetails = lazyLoad(() => import('../pages/ComplaintManagement/ComplaintDetails'));
export const CreateComplaint = lazyLoad(() => import('../pages/ComplaintManagement/CreateComplaint'));

// Playground/Testing
export const RadioStreamMonitor = lazyLoad(() => import('../pages/PlayGround/RadioStreamMonitor'));
export const AudioFileMatcher = lazyLoad(() => import('../pages/PlayGround/AudioFileMatcher'));

// User Management
export const NotificationCenter = lazyLoad(() => import('../pages/NotificationCenter/NotificationCenter'));
export const EducationSupport = lazyLoad(() => import('../pages/Education&Support/HelpSupport'));

// Settings and Profile
export const Settings = lazyLoad(() => import('../pages/Settings/Settings'));
export const EditProfile = lazyLoad(() => import('../pages/Profile/EditProfile'));

// Development and Testing
export const SharedPackageTest = lazyLoad(() => import('../pages/SharedPackageTest'));