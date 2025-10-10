import { lazyLoad } from '../utils/lazyLoad';

// Authentication Pages
export const ZamIOLandingPage = lazyLoad(() => import('../pages/Landing/LandingPage'));
export const SignIn = lazyLoad(() => import('../pages/Authentication/SignIn'));
export const SignUp = lazyLoad(() => import('../pages/Authentication/SignUp'));
export const VerifyEmail = lazyLoad(() => import('../pages/Authentication/VerifyEmail'));
export const ForgotPassword = lazyLoad(() => import('../pages/Authentication/Password/ForgotPassword'));
export const ConfirmPasswordOTP = lazyLoad(() => import('../pages/Authentication/Password/ConfirmPasswordOTP'));
export const NewPassword = lazyLoad(() => import('../pages/Authentication/Password/NewPassword'));
export const AdminCompleteProfile = lazyLoad(() => import('../pages/Authentication/Onboarding/AdminCompleteProfile'));

// Dashboard and Main Pages
export const Dashboard = lazyLoad(() => import('../pages/Dashboard/Dashboard'));
export const AudioMatch = lazyLoad(() => import('../pages/Project/AudioMatch'));

// Artist Management
export const AllArtistsPage = lazyLoad(() => import('../pages/ArtistManagement/AllArtistsPge'));
export const ArtistDetails = lazyLoad(() => import('../pages/Admin/Artists/ArtistDetails'));
export const AddArtist = lazyLoad(() => import('../pages/Admin/Artists/AddArtist'));
export const UploadTrack = lazyLoad(() => import('../pages/Admin/Artists/UploadTrack'));

// Station Management
export const AllStationsPage = lazyLoad(() => import('../pages/StationManagement/AllStationsPage'));
export const StationDetails = lazyLoad(() => import('../pages/Admin/Stations/StationDetails'));

// Publisher Management
export const AllPublishersPage = lazyLoad(() => import('../pages/PublisherManagement/AllPublishersPage'));
export const PublisherDetails = lazyLoad(() => import('../pages/Admin/Publishers/PublisherDetails'));

// Song & Detection Management
export const ArtistTracksView = lazyLoad(() => import('../pages/Song&DetectionManagement/SongManager'));
export const AdminTrackDetails = lazyLoad(() => import('../pages/Song&DetectionManagement/TrackDetails'));

// Fan Management
export const AllFansPage = lazyLoad(() => import('../pages/FanManagement/AllFansPage'));

// Disputes
export const DisputesList = lazyLoad(() => import('../pages/Disputes/DisputesList'));
export const DisputeDetails = lazyLoad(() => import('../pages/Disputes/DisputeDetails'));

// Royalties
export const RoyaltiesList = lazyLoad(() => import('../pages/Royalties/RoyaltiesList'));
export const ArtistRoyaltyDetails = lazyLoad(() => import('../pages/Royalties/ArtistRoyaltyDetails'));
export const PartnerOps = lazyLoad(() => import('../pages/Royalties/PartnerOps'));
export const PartnerOpsWizard = lazyLoad(() => import('../pages/Royalties/PartnerOpsWizard'));

// Analytics
export const PlatformAnalytics = lazyLoad(() => import('../pages/PlatformAnalytics/PlatformAnalytics'));

// Partners
export const PartnersList = lazyLoad(() => import('../pages/Partners/PartnersList'));
export const PartnerDetail = lazyLoad(() => import('../pages/Partners/PartnerDetail'));

// Admin Management
export const UserManagementDashboard = lazyLoad(() => import('../pages/Admin/UserManagement/UserManagementDashboard'));
export const StaffManagementDashboard = lazyLoad(() => import('../pages/Admin/StaffManagement/StaffManagementDashboard'));
export const KycReviewDashboard = lazyLoad(() => import('../pages/Admin/UserManagement/KycReviewDashboard'));
export const AuditLogViewer = lazyLoad(() => import('../pages/Admin/UserManagement/AuditLogViewer'));
export const SystemHealthDashboard = lazyLoad(() => import('../pages/Admin/SystemHealth/SystemHealthDashboard'));
export const RoyaltyManagementDashboard = lazyLoad(() => import('../pages/Admin/RoyaltyManagement/RoyaltyManagementDashboard'));
export const FinancialOversightDashboard = lazyLoad(() => import('../pages/Admin/RoyaltyManagement/FinancialOversightDashboard'));

// Settings and Profile
export const Settings = lazyLoad(() => import('../pages/Settings/Settings'));
export const EditProfile = lazyLoad(() => import('../pages/Profile/EditProfile'));

// Development and Testing
export const SharedPackageTest = lazyLoad(() => import('../pages/SharedPackageTest'));