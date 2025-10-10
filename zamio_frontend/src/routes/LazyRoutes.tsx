import { lazyLoad } from '../utils/lazyLoad';

// Authentication Pages
export const ZamIOLandingPage = lazyLoad(() => import('../pages/Landing/LandingPage'));
export const SignIn = lazyLoad(() => import('../pages/Authentication/SignIn'));
export const SignUp = lazyLoad(() => import('../pages/Authentication/SignUp'));
export const VerifyEmail = lazyLoad(() => import('../pages/Authentication/VerifyEmail'));
export const ForgotPassword = lazyLoad(() => import('../pages/Authentication/Password/ForgotPassword'));
export const ConfirmPasswordOTP = lazyLoad(() => import('../pages/Authentication/Password/ConfirmPasswordOTP'));
export const NewPassword = lazyLoad(() => import('../pages/Authentication/Password/NewPassword'));
export const EnhancedArtistOnboarding = lazyLoad(() => import('../pages/Authentication/Onboarding/EnhancedArtistOnboarding'));

// Dashboard and Main Pages
export const ArtistDashboard = lazyLoad(() => import('../pages/Dashboard/Dashboard'));
export const SongManager = lazyLoad(() => import('../pages/MusicUploadManagement/SongManager'));
export const UploadTrack = lazyLoad(() => import('../pages/MusicUploadManagement/UploadTrack'));
export const NonBlockingUploadTrack = lazyLoad(() => import('../pages/MusicUploadManagement/NonBlockingUploadTrack'));
export const TractDetails = lazyLoad(() => import('../pages/MusicUploadManagement/TrackDetails'));
export const EditTractDetails = lazyLoad(() => import('../pages/MusicUploadManagement/EditSong'));
export const CoverUploader = lazyLoad(() => import('../pages/MusicUploadManagement/UploadCoverArt'));
export const TrackContributors = lazyLoad(() => import('../pages/MusicUploadManagement/Contributors'));
export const AddContributor = lazyLoad(() => import('../pages/MusicUploadManagement/AddContributors'));
export const AddAlbum = lazyLoad(() => import('../pages/MusicUploadManagement/AddAlbum'));
export const EditAlbum = lazyLoad(() => import('../pages/MusicUploadManagement/EditAlbum'));

// Analytics and Reporting
export const MatchLogViewer = lazyLoad(() => import('../pages/PlaylogsMatchLog/FullDetectionTable'));
export const ArtistAnalyticsPage = lazyLoad(() => import('../pages/PlatformAnalytics/ArtistAnalyticsPage'));
export const RoyaltyDashboard = lazyLoad(() => import('../pages/PaymentsOversight/ViewPaymentHistory'));

// User Management
export const NotificationCenter = lazyLoad(() => import('../pages/NotificationCenter/NotificationCenter'));
export const LegalCompliancePage = lazyLoad(() => import('../pages/LegalCompliance/LegalComplains'));
export const EducationSupport = lazyLoad(() => import('../pages/TechSupport/HelpSupport'));
export const FeedbackReviewsPage = lazyLoad(() => import('../pages/FeedbackReview/FeedbackReview'));
export const ArtistProfilePage = lazyLoad(() => import('../pages/Profile/ArtistProfile'));
export const EditProfile = lazyLoad(() => import('../pages/Profile/EditProfile'));
export const Settings = lazyLoad(() => import('../pages/Settings/Settings'));

// Development and Testing (can be excluded in production)
export const ComponentShowcase = lazyLoad(() => import('../components/ComponentShowcase'));
export const ComponentTest = lazyLoad(() => import('../components/ComponentTest'));
export const SharedPackageTest = lazyLoad(() => import('../pages/SharedPackageTest'));