import { lazyLoad } from '../utils/lazyLoad';

// Authentication Pages
export const ZamIOLandingPage = lazyLoad(() => import('../pages/Landing/LandingPage'));
export const SignIn = lazyLoad(() => import('../pages/Authentication/SignIn'));
export const SignUp = lazyLoad(() => import('../pages/Authentication/SignUp'));
export const VerifyEmail = lazyLoad(() => import('../pages/Authentication/VerifyEmail'));

// Onboarding Pages
export const CompleteProfile = lazyLoad(() => import('../pages/Authentication/Onboarding/CompleteProfile'));
export const RevenueSplit = lazyLoad(() => import('../pages/Authentication/Onboarding/RevenueSplit'));
export const LinkArtist = lazyLoad(() => import('../pages/Authentication/Onboarding/LinkArtist'));
export const PaymentInfo = lazyLoad(() => import('../pages/Authentication/Onboarding/PaymentInfo'));

// Dashboard
export const Dashboard = lazyLoad(() => import('../pages/Dashboard/Dashboard'));

// Artist Management
export const AllArtists = lazyLoad(() => import('../pages/ManageArtists/AllArtists'));
export const ArtistDetails = lazyLoad(() => import('../pages/ManageArtists/ArtistDetails'));

// Contract Management
export const AllArtistsContracts = lazyLoad(() => import('../pages/ContractManagement/AllArtistsContracts'));
export const ContractDetails = lazyLoad(() => import('../pages/ContractManagement/ContractDetails'));
export const AddContract = lazyLoad(() => import('../pages/ContractManagement/AddContract'));

// Royalties
export const AllArtistsRoyalties = lazyLoad(() => import('../pages/Royalties/AllArtistsRoyalties'));
export const ArtistRoyaltiesDetail = lazyLoad(() => import('../pages/Royalties/ArtistRoyaltiesDetail'));

// Disputes
export const DisputesList = lazyLoad(() => import('../pages/Disputes/DisputesList'));
export const DisputeDetails = lazyLoad(() => import('../pages/Disputes/DisputeDetails'));

// Match Logs
export const MatchLogViewer = lazyLoad(() => import('../pages/PlaylogsMatchLog/FullDetectionTable'));

// User Management
export const NotificationCenter = lazyLoad(() => import('../pages/NotificationCenter/NotificationCenter'));
export const EducationSupport = lazyLoad(() => import('../pages/Education&Support/HelpSupport'));

// Profile and Settings
export const PublisherProfile = lazyLoad(() => import('../pages/Profile/PublisherProfile'));
export const Settings = lazyLoad(() => import('../pages/Settings/Settings'));
export const EditProfile = lazyLoad(() => import('../pages/Profile/EditProfile'));

// Development and Testing
export const SharedPackageTest = lazyLoad(() => import('../pages/SharedPackageTest'));