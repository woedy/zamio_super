import React, { useState } from 'react';
import { Card } from '@zamio/ui';
import {
  Users,
  Music,
  DollarSign,
  TrendingUp,
  FileText,
  Activity,
  Calendar,
  Award,
  Radio,
  Headphones,
  PieChart,
  MapPin,
  Download,
  Share2,
  Smartphone,
  Search,
  Settings,
  Bell,
  Mic
} from 'lucide-react';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock data for publisher dashboard
  const stats = [
    {
      title: 'Total Performances',
      value: '12,847',
      change: '+15.2% this month',
      icon: Radio,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      gradient: 'from-purple-50/90 via-violet-50/80 to-indigo-50/90',
      target: 15000,
      targetLabel: 'Monthly Target'
    },
    {
      title: 'Total Earnings',
      value: '₵45,231',
      change: '+12.5% vs last month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      gradient: 'from-emerald-50/90 via-green-50/80 to-teal-50/90',
      target: 50000,
      targetLabel: 'Monthly Target'
    },
    {
      title: 'Works in Catalog',
      value: '1,234',
      change: '+89 this month',
      icon: Music,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      gradient: 'from-blue-50/90 via-cyan-50/80 to-indigo-50/90',
      target: 1500,
      targetLabel: 'Monthly Target',
      status: 'Excellent',
      statusColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Active Stations',
      value: '67',
      change: '+3 this month',
      icon: Headphones,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      gradient: 'from-amber-50/90 via-orange-50/80 to-yellow-50/90',
      target: 80,
      targetLabel: 'Monthly Target'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'contract',
      title: 'New Artist Contract Signed',
      description: 'Sarah Johnson joined your label',
      time: '2 hours ago',
      icon: FileText,
      color: 'text-purple-400'
    },
    {
      id: 2,
      type: 'release',
      title: 'New Release Published',
      description: '"Midnight Dreams" by Alex Chen',
      time: '4 hours ago',
      icon: Music,
      color: 'text-blue-400'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Royalty Payment Processed',
      description: '₵2,340 distributed to 23 artists',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Milestone Reached',
      description: '1M total streams across catalog',
      time: '2 days ago',
      icon: Award,
      color: 'text-yellow-400'
    }
  ];

  const topArtists = [
    { name: 'Sarah Johnson', streams: '245K', revenue: '₵3,240', trend: '+12%', color: 'text-green-400' },
    { name: 'Alex Chen', streams: '189K', revenue: '₵2,890', trend: '+8%', color: 'text-blue-400' },
    { name: 'Maria Rodriguez', streams: '156K', revenue: '₵2,130', trend: '+15%', color: 'text-purple-400' }
  ];

  const topSongs = [
    { title: 'Midnight Dreams', artist: 'Alex Chen', plays: '45,231', earnings: '₵234.50', stations: 23 },
    { title: 'Ocean Waves', artist: 'Sarah Johnson', plays: '38,945', earnings: '₵198.20', stations: 19 },
    { title: 'City Lights', artist: 'Maria Rodriguez', plays: '32,567', earnings: '₵165.80', stations: 16 }
  ];

  const ghanaRegions = [
    { region: 'Greater Accra', plays: 4520, earnings: 2340.50, stations: 12, growth: 15 },
    { region: 'Ashanti', plays: 3890, earnings: 1980.20, stations: 10, growth: 8 },
    { region: 'Western', plays: 2840, earnings: 1450.75, stations: 8, growth: 22 },
    { region: 'Central', plays: 2150, earnings: 1120.30, stations: 6, growth: 5 }
  ];

  return (
    <div className="space-y-8">
      {/* Publisher Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Publisher Dashboard</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
            Manage your music publishing operations and track performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-400 transition-all duration-200"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Stats Cards - Professional Dark Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.gradient} dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-white/30 dark:hover:border-slate-500/70 group cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">{stat.title}</p>
                <p className={`text-2xl sm:text-3xl font-bold leading-tight group-hover:scale-105 transition-transform duration-300 ${stat.color} dark:${stat.color.replace('600', '400')}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 ${stat.bgColor} dark:${stat.bgColor.replace('100', '900/60').replace('900/20', '900/60')}`}>
                <stat.icon className={`w-6 h-6 ${stat.color} dark:${stat.color.replace('600', '400')}`} />
              </div>
            </div>
            <div className={`mt-4 flex items-center justify-between text-sm ${stat.color} dark:${stat.color.replace('600', '400')}`}>
              <span>{stat.change}</span>
              {stat.status && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 ${stat.statusColor}`}>
                  {stat.status}
                </div>
              )}
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">{stat.targetLabel}</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {typeof stat.value === 'string' && stat.value.includes('₵')
                    ? stat.value.replace('₵', '').replace(',', '') + ' / ' + stat.target.toLocaleString()
                    : stat.value.replace(',', '') + ' / ' + stat.target.toLocaleString()
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-purple-500 dark:bg-purple-400' :
                    index === 1 ? 'bg-green-500 dark:bg-green-400' :
                    index === 2 ? 'bg-blue-500 dark:bg-blue-400' :
                    'bg-orange-500 dark:bg-orange-400'
                  }`}
                  style={{ width: `${Math.min((parseInt(stat.value.replace(/[^0-9]/g, '')) / stat.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Plays Over Time - Dark Glassmorphism */}
          <div className="bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
                Plays Over Time
              </h2>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Airplay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Streaming</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { date: 'Jan 2024', airplay: 1200, streaming: 800 },
                { date: 'Feb 2024', airplay: 1350, streaming: 920 },
                { date: 'Mar 2024', airplay: 1180, streaming: 1050 },
                { date: 'Apr 2024', airplay: 1420, streaming: 1180 },
                { date: 'May 2024', airplay: 1580, streaming: 1320 },
                { date: 'Jun 2024', airplay: 1650, streaming: 1450 }
              ].map((month, index) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{month.date}</span>
                    <div className="flex space-x-4">
                      <span className="text-gray-900 dark:text-white font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {month.airplay.toLocaleString()}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {month.streaming.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-200/80 dark:bg-slate-700/80 rounded-full h-3 overflow-hidden group-hover:bg-gray-300/60 dark:group-hover:bg-slate-600/60 transition-colors">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 rounded-full transition-all duration-500 hover:from-purple-400 hover:to-pink-400"
                        style={{
                          width: `${(month.airplay / 2000) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex-1 bg-gray-200/80 dark:bg-slate-700/80 rounded-full h-3 overflow-hidden group-hover:bg-gray-300/60 dark:group-hover:bg-slate-600/60 transition-colors">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 rounded-full transition-all duration-500 hover:from-blue-400 hover:to-cyan-400"
                        style={{
                          width: `${(month.streaming / 2000) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Songs Played - Enhanced Glassmorphism */}
          <div className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <Music className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                Top Works by Plays
              </h2>
              <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center font-medium transition-colors duration-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 px-3 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20">
                View All <Activity className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {topSongs.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-slate-700/60 rounded-xl border border-gray-200/60 dark:border-slate-600/40 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer group min-h-[60px]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300 shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {song.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        by {song.artist} • {song.stations} stations
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-white font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{song.plays.toLocaleString()}</div>
                    <div className="text-sm text-green-600 dark:text-green-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      ₵{song.earnings}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ghana Regions Performance - Professional Styling */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                Ghana Regions Performance
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ghanaRegions.map((region, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50/80 dark:bg-slate-700/60 rounded-xl border border-gray-200/60 dark:border-slate-600/40 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer group min-h-[80px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {region.region}
                    </div>
                    <div className={`text-sm font-medium transition-all duration-300 ${region.growth > 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      +{region.growth}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Plays</span>
                      <span className="text-gray-900 dark:text-white font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {region.plays.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Earnings</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        ₵{region.earnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Stations</span>
                      <span className="text-orange-600 dark:text-orange-400 font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {region.stations}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Enhanced Dark Glassmorphism */}
        <div className="space-y-8">
          {/* Station Breakdown */}
          <div className="bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-orange-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" />
                Top Stations
              </h2>
            </div>
            <div className="space-y-4">
              {[
                { station: 'Joy FM', region: 'Greater Accra', plays: 2340, percentage: 18 },
                { station: 'Citi FM', region: 'Greater Accra', plays: 1980, percentage: 15 },
                { station: 'Peace FM', region: 'Ashanti', plays: 1650, percentage: 13 },
                { station: 'Adom FM', region: 'Ashanti', plays: 1420, percentage: 11 },
                { station: 'Okay FM', region: 'Greater Accra', plays: 1280, percentage: 10 }
              ].map((station, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-sm transition-all duration-300 cursor-pointer group p-3 rounded-lg min-h-[50px]"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                        {station.station}
                      </span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors duration-300">
                        {station.percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 leading-relaxed group-hover:text-amber-600/80 dark:group-hover:text-amber-400/80 transition-colors duration-300">
                      {station.region} • {station.plays.toLocaleString()} plays
                    </div>
                    <div className="w-full bg-gray-200/80 dark:bg-slate-600/80 rounded-full h-2 group-hover:shadow-inner transition-all duration-300">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400 h-2 rounded-full group-hover:from-amber-400 group-hover:to-orange-400 transition-colors duration-300"
                        style={{ width: `${station.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity - Professional Dark Theme */}
          <div className="bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-violet-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400" />
                Recent Activity
              </h2>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50/80 dark:bg-slate-700/60 rounded-lg border border-gray-200/60 dark:border-slate-600/40 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className={`p-2 rounded-lg bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/60 dark:to-pink-900/60 group-hover:scale-110 transition-transform duration-300`}>
                    <activity.icon className={`w-4 h-4 ${activity.color} dark:${activity.color.replace('400', '300')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{activity.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roster & Agreements - Enhanced Styling */}
          <div className="bg-gradient-to-br from-slate-50/90 via-gray-50/80 to-zinc-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <Award className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
                Roster & Agreements
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Writers', value: '23', color: 'text-slate-600 dark:text-slate-300' },
                { label: 'Agreements', value: '18', color: 'text-slate-600 dark:text-slate-300' },
                { label: 'Publisher Split', value: '60%', color: 'text-slate-600 dark:text-slate-300' },
                { label: 'Writers Split', value: '40%', color: 'text-slate-600 dark:text-slate-300' },
                { label: 'Unclaimed Logs', value: '5', color: 'text-yellow-600 dark:text-yellow-400' },
                { label: 'Disputes', value: '2', color: 'text-red-600 dark:text-red-400' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50/80 dark:bg-slate-700/60 rounded-lg border border-gray-200/60 dark:border-slate-600/40 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-gray-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                  <span className={`text-sm font-medium ${item.color} group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors`}>{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artists - Professional Dark Styling */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-cyan-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                Top Artists
              </h2>
            </div>
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-slate-700/60 rounded-lg border border-gray-200/60 dark:border-slate-600/40 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-blue-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{artist.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{artist.streams} streams</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{artist.revenue}</p>
                    <p className={`text-xs font-medium transition-all duration-300 ${artist.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {artist.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Score - Match zamio_frontend */}
          <div className="bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-violet-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <Award className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400" />
                Performance Score
              </h2>
            </div>
            <div className="text-center mb-6">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">
                8.7
              </div>
              <div className="px-3 py-1 rounded-full text-sm font-medium mx-auto w-fit bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                Excellent Performance
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Publishing Growth</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">9.2</span>
                  <div className="w-8 h-1 bg-gray-200 dark:bg-slate-600 rounded-full">
                    <div className="w-full h-full bg-emerald-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">8.5</span>
                  <div className="w-8 h-1 bg-gray-200 dark:bg-slate-600 rounded-full">
                    <div className="w-5/6 h-full bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Catalog Quality</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">8.8</span>
                  <div className="w-8 h-1 bg-gray-200 dark:bg-slate-600 rounded-full">
                    <div className="w-11/12 h-full bg-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Professional Button Styling */}
          <div className="bg-gradient-to-br from-pink-50/90 via-rose-50/80 to-purple-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center group">
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Download Report
              </button>
              <button className="w-full bg-white/10 dark:bg-slate-700/60 text-gray-900 dark:text-white py-3 rounded-xl font-semibold border border-white/20 dark:border-slate-600/40 hover:bg-white/20 dark:hover:bg-slate-600/70 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center group">
                <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Share Stats
              </button>
              <button className="w-full bg-white/10 dark:bg-slate-700/60 text-gray-900 dark:text-white py-3 rounded-xl font-semibold border border-white/20 dark:border-slate-600/40 hover:bg-white/20 dark:hover:bg-slate-600/70 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center group">
                <Smartphone className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Mobile Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}