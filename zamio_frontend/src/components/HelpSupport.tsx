import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageCircle, Book, Mail, Phone, X, ChevronRight, Search } from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful_count: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  user_email?: string;
}

interface HelpContextProps {
  page?: string;
  section?: string;
  userType?: 'artist' | 'publisher' | 'station' | 'admin';
}

interface HelpSupportProps {
  context?: HelpContextProps;
  className?: string;
}

export const HelpSupport: React.FC<HelpSupportProps> = ({
  context,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'help' | 'contact' | 'chat'>('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // Load contextual help articles
  useEffect(() => {
    if (isOpen && activeTab === 'help') {
      loadHelpArticles();
    }
  }, [isOpen, activeTab, context]);

  const loadHelpArticles = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual API call
      const mockArticles: HelpArticle[] = [
        {
          id: '1',
          title: 'How to upload music tracks',
          content: 'Step-by-step guide to uploading your music...',
          category: 'Getting Started',
          tags: ['upload', 'music', 'tracks'],
          helpful_count: 45
        },
        {
          id: '2',
          title: 'Understanding royalty calculations',
          content: 'Learn how royalties are calculated...',
          category: 'Royalties',
          tags: ['royalties', 'payments', 'calculations'],
          helpful_count: 32
        },
        {
          id: '3',
          title: 'Setting up your artist profile',
          content: 'Complete your artist profile for better visibility...',
          category: 'Profile Management',
          tags: ['profile', 'artist', 'setup'],
          helpful_count: 28
        }
      ];

      // Filter by context if provided
      let filteredArticles = mockArticles;
      if (context?.page) {
        filteredArticles = mockArticles.filter(article =>
          article.tags.some(tag => tag.includes(context.page!.toLowerCase()))
        );
      }

      setHelpArticles(filteredArticles);
    } catch (error) {
      console.error('Failed to load help articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = helpArticles.filter(article =>
    searchQuery === '' ||
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white
          rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110
          ${className}
        `}
        title="Get Help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Help & Support
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('help')}
                  className={`
                    flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === 'help'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }
                  `}
                >
                  <Book className="w-4 h-4 inline mr-1" />
                  Help Articles
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`
                    flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === 'contact'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }
                  `}
                >
                  <Mail className="w-4 h-4 inline mr-1" />
                  Contact
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`
                    flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === 'chat'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }
                  `}
                >
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Live Chat
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'help' && (
                  <HelpArticlesTab
                    articles={filteredArticles}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    loading={loading}
                    context={context}
                  />
                )}
                
                {activeTab === 'contact' && (
                  <ContactTab context={context} />
                )}
                
                {activeTab === 'chat' && (
                  <LiveChatTab context={context} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface HelpArticlesTabProps {
  articles: HelpArticle[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
  context?: HelpContextProps;
}

const HelpArticlesTab: React.FC<HelpArticlesTabProps> = ({
  articles,
  searchQuery,
  onSearchChange,
  loading,
  context
}) => {
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  if (selectedArticle) {
    return (
      <div className="p-4">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          ← Back to articles
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {selectedArticle.title}
        </h3>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300">
            {selectedArticle.content}
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Was this article helpful?
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200">
              Yes
            </button>
            <button className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200">
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Context-specific help */}
      {context?.page && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Help for this page
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Showing articles related to {context.page}
          </p>
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map(article => (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {article.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {article.category} • {article.helpful_count} found this helpful
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
          
          {articles.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No articles found. Try a different search term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ContactTab: React.FC<{ context?: HelpContextProps }> = ({ context }) => {
  const [ticket, setTicket] = useState<Partial<SupportTicket>>({
    priority: 'medium',
    category: 'general'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit support ticket
      console.log('Submitting ticket:', ticket);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Ticket Submitted
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We've received your support request and will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            required
            value={ticket.subject || ''}
            onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Brief description of your issue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={ticket.category || 'general'}
            onChange={(e) => setTicket(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="general">General Question</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing & Payments</option>
            <option value="account">Account Management</option>
            <option value="royalties">Royalties</option>
            <option value="upload">Music Upload</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={ticket.priority || 'medium'}
            onChange={(e) => setTicket(prev => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            required
            rows={4}
            value={ticket.message || ''}
            onChange={(e) => setTicket(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Please describe your issue in detail..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Submit Ticket
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Other ways to reach us
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 mr-2" />
            support@zamio.com
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4 mr-2" />
            +233 XX XXX XXXX
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveChatTab: React.FC<{ context?: HelpContextProps }> = ({ context }) => {
  const [chatAvailable, setChatAvailable] = useState(false);

  useEffect(() => {
    // Check if live chat is available
    const checkChatAvailability = () => {
      const now = new Date();
      const hour = now.getHours();
      // Available 9 AM to 6 PM GMT
      setChatAvailable(hour >= 9 && hour < 18);
    };

    checkChatAvailability();
    const interval = setInterval(checkChatAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      {chatAvailable ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Live Chat Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our support team is online and ready to help you.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition-colors">
            Start Chat
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Live Chat Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our support team is currently offline. Live chat is available Monday to Friday, 9 AM to 6 PM GMT.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can still submit a support ticket and we'll get back to you within 24 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;