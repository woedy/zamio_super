import React, { useState } from 'react';
import { TrendingUp, Globe, Music, Radio, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface RevenueSplitStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const RevenueSplitStep: React.FC<RevenueSplitStepProps> = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    // Basic Splits
    writerSplit: '',
    publisherSplit: '',

    // Territory Splits
    ghanaWriterSplit: '',
    ghanaPublisherSplit: '',
    internationalWriterSplit: '',
    internationalPublisherSplit: '',

    // Rights Type Splits
    performanceWriterSplit: '',
    performancePublisherSplit: '',
    mechanicalWriterSplit: '',
    mechanicalPublisherSplit: '',

    // Advanced Options
    useTerritorySplits: false,
    useRightsSplits: false,
    selectedTemplate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'territory' | 'rights'>('basic');

  const splitTemplates = [
    { id: 'standard', name: 'Standard (50/50)', writer: 50, publisher: 50, description: 'Equal split between writer and publisher' },
    { id: 'writer-heavy', name: 'Writer-Focused (70/30)', writer: 70, publisher: 30, description: 'Higher percentage for songwriters' },
    { id: 'publisher-heavy', name: 'Publisher-Focused (30/70)', writer: 30, publisher: 70, description: 'Higher percentage for publisher administration' },
    { id: 'custom', name: 'Custom Split', writer: 0, publisher: 0, description: 'Set your own custom percentages' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = splitTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        selectedTemplate: templateId,
        writerSplit: template.writer.toString(),
        publisherSplit: template.publisher.toString()
      }));
    }
  };

  const validateBasicSplits = () => {
    const writer = parseFloat(formData.writerSplit);
    const publisher = parseFloat(formData.publisherSplit);

    if (!formData.writerSplit.trim() || isNaN(writer)) {
      return 'Writer split is required and must be a number';
    }

    if (!formData.publisherSplit.trim() || isNaN(publisher)) {
      return 'Publisher split is required and must be a number';
    }

    if (writer < 0 || publisher < 0) {
      return 'Splits must be greater than or equal to 0';
    }

    if (writer > 100 || publisher > 100) {
      return 'Splits must be less than or equal to 100';
    }

    const total = writer + publisher;
    if (Math.abs(total - 100) > 0.01) {
      return 'Writer + Publisher splits must equal 100%';
    }

    return null;
  };

  const validateTerritorySplits = () => {
    if (!formData.useTerritorySplits) return null;

    const ghanaWriter = parseFloat(formData.ghanaWriterSplit);
    const ghanaPublisher = parseFloat(formData.ghanaPublisherSplit);
    const intWriter = parseFloat(formData.internationalWriterSplit);
    const intPublisher = parseFloat(formData.internationalPublisherSplit);

    if (isNaN(ghanaWriter) || isNaN(ghanaPublisher) || isNaN(intWriter) || isNaN(intPublisher)) {
      return 'All territory splits must be valid numbers';
    }

    if (ghanaWriter + ghanaPublisher !== 100) {
      return 'Ghana splits must total 100%';
    }

    if (intWriter + intPublisher !== 100) {
      return 'International splits must total 100%';
    }

    return null;
  };

  const validateRightsSplits = () => {
    if (!formData.useRightsSplits) return null;

    const perfWriter = parseFloat(formData.performanceWriterSplit);
    const perfPublisher = parseFloat(formData.performancePublisherSplit);
    const mechWriter = parseFloat(formData.mechanicalWriterSplit);
    const mechPublisher = parseFloat(formData.mechanicalPublisherSplit);

    if (isNaN(perfWriter) || isNaN(perfPublisher) || isNaN(mechWriter) || isNaN(mechPublisher)) {
      return 'All rights splits must be valid numbers';
    }

    if (perfWriter + perfPublisher !== 100) {
      return 'Performance rights splits must total 100%';
    }

    if (mechWriter + mechPublisher !== 100) {
      return 'Mechanical rights splits must total 100%';
    }

    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const basicError = validateBasicSplits();
    if (basicError) newErrors.basic = basicError;

    const territoryError = validateTerritorySplits();
    if (territoryError) newErrors.territory = territoryError;

    const rightsError = validateRightsSplits();
    if (rightsError) newErrors.rights = rightsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Demo: Log the form data
      console.log('Revenue split configuration:', formData);
      onNext();
    }
  };

  const calculateTotal = (writer: string, publisher: string) => {
    const w = parseFloat(writer) || 0;
    const p = parseFloat(publisher) || 0;
    return (w + p).toFixed(1);
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Revenue Split Configuration
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Configure how royalties are split between songwriters and your publishing company. Set up different splits for territories and rights types for optimal revenue management.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Split Templates */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Choose a Starting Template</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {splitTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  formData.selectedTemplate === template.id
                    ? 'border-indigo-400 bg-indigo-500/20'
                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white">{template.name}</h5>
                  <span className="text-sm text-slate-400">
                    {template.writer}% / {template.publisher}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <div className="flex space-x-1 mb-6 bg-slate-800/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Basic Split
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('territory')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'territory'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Territory Splits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rights')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'rights'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Rights Type Splits
            </button>
          </div>

          {/* Basic Split Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-white">Basic Revenue Split</h4>
              <p className="text-slate-300">
                Set the default split between songwriters and your publishing company for all territories and rights types.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="writerSplit" className="block text-sm font-medium text-slate-200 mb-2">
                    Writer Split (%)
                  </label>
                  <input
                    type="number"
                    id="writerSplit"
                    name="writerSplit"
                    value={formData.writerSplit}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.basic
                        ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                        : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                    }`}
                    placeholder="50"
                  />
                </div>

                <div>
                  <label htmlFor="publisherSplit" className="block text-sm font-medium text-slate-200 mb-2">
                    Publisher Split (%)
                  </label>
                  <input
                    type="number"
                    id="publisherSplit"
                    name="publisherSplit"
                    value={formData.publisherSplit}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.basic
                        ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                        : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                    }`}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Total:</span>
                  <span className={`font-semibold ${
                    calculateTotal(formData.writerSplit, formData.publisherSplit) === '100.0'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {calculateTotal(formData.writerSplit, formData.publisherSplit)}%
                  </span>
                </div>
              </div>

              {errors.basic && (
                <div className="flex items-center text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.basic}
                </div>
              )}
            </div>
          )}

          {/* Territory Splits Tab */}
          {activeTab === 'territory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-white">Territory-Based Splits</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.useTerritorySplits}
                    onChange={(e) => setFormData(prev => ({ ...prev, useTerritorySplits: e.target.checked }))}
                    className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="text-sm text-slate-300">Enable territory-specific splits</span>
                </label>
              </div>

              {formData.useTerritorySplits && (
                <>
                  <p className="text-slate-300">
                    Set different splits for Ghana vs international territories to optimize local and global revenue.
                  </p>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Ghana Splits */}
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center space-x-2 mb-4">
                        <Globe className="w-5 h-5 text-green-400" />
                        <h5 className="font-medium text-white">Ghana Territory</h5>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Writer Split (%)
                          </label>
                          <input
                            type="number"
                            name="ghanaWriterSplit"
                            value={formData.ghanaWriterSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Publisher Split (%)
                          </label>
                          <input
                            type="number"
                            name="ghanaPublisherSplit"
                            value={formData.ghanaPublisherSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div className="bg-slate-700/50 rounded p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Ghana Total:</span>
                            <span className={`font-medium ${
                              calculateTotal(formData.ghanaWriterSplit, formData.ghanaPublisherSplit) === '100.0'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {calculateTotal(formData.ghanaWriterSplit, formData.ghanaPublisherSplit)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* International Splits */}
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center space-x-2 mb-4">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h5 className="font-medium text-white">International Territory</h5>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Writer Split (%)
                          </label>
                          <input
                            type="number"
                            name="internationalWriterSplit"
                            value={formData.internationalWriterSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Publisher Split (%)
                          </label>
                          <input
                            type="number"
                            name="internationalPublisherSplit"
                            value={formData.internationalPublisherSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div className="bg-slate-700/50 rounded p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">International Total:</span>
                            <span className={`font-medium ${
                              calculateTotal(formData.internationalWriterSplit, formData.internationalPublisherSplit) === '100.0'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {calculateTotal(formData.internationalWriterSplit, formData.internationalPublisherSplit)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {errors.territory && (
                    <div className="flex items-center text-red-400 text-sm mt-4">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.territory}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Rights Type Splits Tab */}
          {activeTab === 'rights' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-white">Rights Type Splits</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.useRightsSplits}
                    onChange={(e) => setFormData(prev => ({ ...prev, useRightsSplits: e.target.checked }))}
                    className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="text-sm text-slate-300">Enable rights-specific splits</span>
                </label>
              </div>

              {formData.useRightsSplits && (
                <>
                  <p className="text-slate-300">
                    Set different splits for performance rights (radio, streaming) vs mechanical rights (physical sales, downloads).
                  </p>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Performance Rights */}
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center space-x-2 mb-4">
                        <Radio className="w-5 h-5 text-purple-400" />
                        <h5 className="font-medium text-white">Performance Rights</h5>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">Radio airplay, streaming, live performances</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Writer Split (%)
                          </label>
                          <input
                            type="number"
                            name="performanceWriterSplit"
                            value={formData.performanceWriterSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Publisher Split (%)
                          </label>
                          <input
                            type="number"
                            name="performancePublisherSplit"
                            value={formData.performancePublisherSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div className="bg-slate-700/50 rounded p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Performance Total:</span>
                            <span className={`font-medium ${
                              calculateTotal(formData.performanceWriterSplit, formData.performancePublisherSplit) === '100.0'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {calculateTotal(formData.performanceWriterSplit, formData.performancePublisherSplit)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mechanical Rights */}
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center space-x-2 mb-4">
                        <Music className="w-5 h-5 text-orange-400" />
                        <h5 className="font-medium text-white">Mechanical Rights</h5>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">Physical sales, downloads, synchronization</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Writer Split (%)
                          </label>
                          <input
                            type="number"
                            name="mechanicalWriterSplit"
                            value={formData.mechanicalWriterSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Publisher Split (%)
                          </label>
                          <input
                            type="number"
                            name="mechanicalPublisherSplit"
                            value={formData.mechanicalPublisherSplit}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="50"
                          />
                        </div>

                        <div className="bg-slate-700/50 rounded p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Mechanical Total:</span>
                            <span className={`font-medium ${
                              calculateTotal(formData.mechanicalWriterSplit, formData.mechanicalPublisherSplit) === '100.0'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {calculateTotal(formData.mechanicalWriterSplit, formData.mechanicalPublisherSplit)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {errors.rights && (
                    <div className="flex items-center text-red-400 text-sm mt-4">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.rights}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Split Information */}
        <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h5 className="font-medium text-indigo-300">Revenue Split Guidelines</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-300 mb-2"><strong>Standard Publishing Splits:</strong></p>
              <ul className="text-slate-400 space-y-1">
                <li>• Writer: 50% (songwriter's share)</li>
                <li>• Publisher: 50% (publishing administration)</li>
                <li>• Total must equal 100%</li>
              </ul>
            </div>
            <div>
              <p className="text-slate-300 mb-2"><strong>Ghana Considerations:</strong></p>
              <ul className="text-slate-400 space-y-1">
                <li>• GHAMRO compliance required</li>
                <li>• Local vs international territory splits</li>
                <li>• Performance vs mechanical rights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onPrevious}
            className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue to Artist Management
          </button>
        </div>
      </form>
    </div>
  );
};

export default RevenueSplitStep;
