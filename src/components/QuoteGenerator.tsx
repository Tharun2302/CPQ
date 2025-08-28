import React, { useState, useEffect } from 'react';
import { PricingCalculation, ConfigurationData, Quote } from '../types/pricing';
import { formatCurrency } from '../utils/pricing';
import { 
  FileText, 
  Download, 
  Send, 
  User, 
  Mail, 
  Building, 
  CheckCircle, 
  Users, 
  Calendar,
  Database,
  Server,
  Sparkles,
  ArrowRight,
  Phone,
  MapPin,
  Globe,
  Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuoteGeneratorProps {
  calculation: PricingCalculation;
  configuration: ConfigurationData;
  onGenerateQuote: (quote: Quote) => void;
  hubspotState?: {
    isConnected: boolean;
    hubspotContacts: any[];
    selectedContact: any;
  };
  onSelectHubSpotContact?: (contact: any) => void;
  companyInfo?: {
    name: string;
    address: string;
    city: string;
    email: string;
    phone: string;
  };
  selectedTemplate?: any;
  onClientInfoChange?: (clientInfo: ClientInfo) => void;
}

interface ClientInfo {
  clientName: string;
  clientEmail: string;
  company: string;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({
  calculation,
  configuration,
  onGenerateQuote,
  hubspotState,
  onSelectHubSpotContact,
  companyInfo,
  selectedTemplate,
  onClientInfoChange
}) => {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    clientName: '',
    clientEmail: '',
    company: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPlaceholderPreview, setShowPlaceholderPreview] = useState(false);
  const [placeholderPreviewData, setPlaceholderPreviewData] = useState<{
    originalText: string;
    replacedText: string;
    placeholders: Array<{placeholder: string, value: string}>;
  } | null>(null);

  // Auto-populate client info when HubSpot contact is selected
  useEffect(() => {
    if (hubspotState?.selectedContact) {
      const contact = hubspotState.selectedContact;
      console.log('🔍 Auto-filling client info from HubSpot contact:', contact);
      console.log('📄 Contact properties:', contact.properties);
      
      // Extract company name from email domain if company field is not available
      const extractCompanyFromEmail = (email: string): string => {
        if (!email) return '';
        const domain = email.split('@')[1];
        if (!domain) return '';
        
        // Remove common TLDs and format as company name
        const companyName = domain
          .replace(/\.(com|org|net|edu|gov|co|io|ai)$/i, '')
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        
        return companyName;
      };
      
      const newClientInfo = {
        clientName: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        clientEmail: contact.properties.email || '',
        company: contact.properties.company || extractCompanyFromEmail(contact.properties.email || '')
      };
      
      console.log('✅ New client info to set:', newClientInfo);
      console.log('🏢 Company source:', contact.properties.company ? 'HubSpot company field' : 'Email domain extraction');
      setClientInfo(newClientInfo);
    }
  }, [hubspotState?.selectedContact]);

  // Clear client info when HubSpot is disconnected
  useEffect(() => {
    if (!hubspotState?.isConnected) {
      setClientInfo({
        clientName: '',
        clientEmail: '',
        company: ''
      });
    }
  }, [hubspotState?.isConnected]);

  // Notify parent component when client info changes
  useEffect(() => {
    if (onClientInfoChange) {
      onClientInfoChange(clientInfo);
    }
  }, [clientInfo, onClientInfoChange]);

  // Add debugging
  console.log('QuoteGenerator render:', {
    hubspotState,
    clientInfo,
    showPreview,
    calculation: calculation?.tier?.name,
    configuration: configuration?.numberOfUsers
  });

  // Safety check - ensure we have required props
  if (!calculation || !configuration) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Missing Configuration</h2>
          <p className="text-gray-600">
            Please ensure you have selected a pricing tier and configuration before generating a quote.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onGenerateQuote) {
    onGenerateQuote(clientInfo);
      setShowSuccessMessage(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  const handleContactSelect = (contact: any) => {
    if (onSelectHubSpotContact) {
      onSelectHubSpotContact(contact);
    }
    setShowContactSelector(false);
  };

  const generatePlaceholderPreview = () => {
    if (!selectedTemplate) return;

    // Create quote object for preview
    const quote = {
      id: `quote-${Date.now()}`,
      clientName: clientInfo.clientName,
      clientEmail: clientInfo.clientEmail,
      company: clientInfo.company,
      configuration: configuration,
      calculation: calculation,
      selectedTier: calculation.tier,
      status: 'draft' as const,
      createdAt: new Date(),
      templateUsed: {
        id: selectedTemplate.id,
        name: selectedTemplate.name
      }
    };

    const quoteNumber = `CPQ-${Date.now().toString().slice(-6)}`;

    // Define placeholder mappings - match exact placeholders from template
    const placeholderMappings = {
      '{{Company Name}}': quote.company || 'Company Name',
      '{{migration type}}': quote.configuration.migrationType,
      '{{userscount}}': quote.configuration.numberOfUsers.toString(),
      '{{price_migration}}': formatCurrency(quote.calculation.migrationCost),
      '{{price_data}}': formatCurrency(quote.calculation.userCost + quote.calculation.dataCost + quote.calculation.instanceCost),
      '{{Duration of months}}': quote.configuration.duration.toString(),
      '{{total price}}': formatCurrency(quote.calculation.totalCost),
      
      // Additional mappings for compatibility
      '{{company_name}}': quote.company || 'Company Name',
      '{{users}}': quote.configuration.numberOfUsers.toString(),
      '{{migration_type}}': quote.configuration.migrationType,
      '{{prices}}': formatCurrency(quote.calculation.userCost + quote.calculation.dataCost + quote.calculation.instanceCost),
      '{{migration_price}}': formatCurrency(quote.calculation.migrationCost),
      '{{total_price}}': formatCurrency(quote.calculation.totalCost),
      '{{duration_months}}': quote.configuration.duration.toString(),
      '{{client_name}}': quote.clientName,
      '{{client_email}}': quote.clientEmail,
      '{{quote_number}}': quoteNumber,
      '{{date}}': new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };

    // Create sample template text with placeholders - matches CloudFuze template
    const originalText = `CloudFuze Purchase Agreement for {{Company Name}}

This agreement provides {{Company Name}} with pricing for use of the CloudFuze's X-Change Enterprise Data Migration Solution:

Cloud-Hosted SaaS Solution | Managed Migration | Dedicated Migration Manager

Services and Pricing Table:
┌─────────────────────────────────────┬─────────────────────────────────────┬─────────────────┬─────────────┐
│ Job Requirement                     │ Description                         │ Migration Type  │ Price(USD)  │
├─────────────────────────────────────┼─────────────────────────────────────┼─────────────────┼─────────────┤
│ CloudFuze X-Change Data Migration   │ {{migration type}} to Teams         │ Managed         │ {{price_migration}} │
│                                     │ ─────────────────────────────────   │ Migration       │             │
│                                     │ Up to {{userscount}} Users          │ One-Time        │             │
│                                     │ All Channels and DMs                │                 │             │
├─────────────────────────────────────┼─────────────────────────────────────┼─────────────────┼─────────────┤
│ Managed Migration Service           │ Fully Managed Migration             │ Managed         │ {{price_data}} │
│                                     │ Dedicated Project Manager           │ Migration       │             │
│                                     │ Pre-Migration Analysis              │ One-Time        │             │
│                                     │ During Migration Consulting         │                 │             │
│                                     │ Post-Migration Support              │                 │             │
│                                     │ Data Reconciliation Support         │                 │             │
│                                     │ End-to End Migration Assistance     │                 │             │
│                                     │ 24*7 Premium Support                │                 │             │
│                                     │ ─────────────────────────────────   │                 │             │
│                                     │ Valid for {{Duration of months}} Month │                 │             │
└─────────────────────────────────────┴─────────────────────────────────────┴─────────────────┴─────────────┘

Total Price: {{total price}}`;

    // Replace placeholders
    let replacedText = originalText;
    const placeholders = [];

    for (const [placeholder, value] of Object.entries(placeholderMappings)) {
      if (replacedText.includes(placeholder)) {
        placeholders.push({ placeholder, value });
        replacedText = replacedText.replace(new RegExp(placeholder, 'gi'), value);
      }
    }

    setPlaceholderPreviewData({
      originalText,
      replacedText,
      placeholders
    });

    setShowPlaceholderPreview(true);
  };

  const handleDownloadPDF = () => {
    // Create a new window with the quote content for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CPQ Pro Quote - ${clientInfo.clientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .client-info { background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .pricing-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .pricing-table th, .pricing-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .pricing-table th { background: #f5f5f5; font-weight: bold; }
            .total-row { background: #e3f2fd; font-weight: bold; font-size: 18px; }
            .features { background: #f1f8e9; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .terms { background: #fff3e0; padding: 20px; border-radius: 10px; margin-top: 20px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #1976d2; margin-bottom: 10px;">PROFESSIONAL QUOTE</h1>
            <p><strong>Quote #Q-${Date.now().toString().slice(-6)}</strong></p>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="company-info">
            <h2>${companyInfo?.name || 'CPQ Pro Solutions'}</h2>
            <p>${companyInfo?.address || '123 Business St.'}<br>${companyInfo?.city || 'City, State 12345'}<br>${companyInfo?.email || 'contact@cpqsolutions.com'}</p>
          </div>
          
          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>${clientInfo.clientName}</strong><br>
            ${clientInfo.company}<br>
            ${clientInfo.clientEmail}</p>
          </div>
          
          <h3>Project Configuration:</h3>
          <table class="pricing-table">
            <tr><td>Number of Users:</td><td>${configuration.numberOfUsers}</td></tr>
            <tr><td>Instance Type:</td><td>${configuration.instanceType}</td></tr>
            <tr><td>Number of Instances:</td><td>${configuration.numberOfInstances}</td></tr>
            <tr><td>Duration:</td><td>${configuration.duration} months</td></tr>
            <tr><td>Migration Type:</td><td>${configuration.migrationType}</td></tr>
            <tr><td>Data Size:</td><td>${configuration.dataSizeGB} GB</td></tr>
          </table>
          
          <h3>Pricing Breakdown - ${calculation.tier.name} Plan:</h3>
          <table class="pricing-table">
            <thead>
              <tr><th>Description</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>User costs (${configuration.numberOfUsers} users × ${configuration.duration} months)</td><td>${formatCurrency(calculation.userCost)}</td></tr>
              <tr><td>Data costs (${configuration.dataSizeGB} GB)</td><td>${formatCurrency(calculation.dataCost)}</td></tr>
              <tr><td>Migration services</td><td>${formatCurrency(calculation.migrationCost)}</td></tr>
              <tr><td>Instance costs (${configuration.numberOfInstances} instances)</td><td>${formatCurrency(calculation.instanceCost)}</td></tr>
              <tr class="total-row"><td>Total Project Cost</td><td>${formatCurrency(calculation.totalCost)}</td></tr>
            </tbody>
          </table>
          
          <div class="features">
            <h3>Included Features:</h3>
            <ul>
              ${calculation.tier.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="terms">
            <h3>Terms & Conditions:</h3>
            <ul>
              <li>Quote valid for 30 days from date issued</li>
              <li>50% deposit required to begin project</li>
              <li>Final payment due upon project completion</li>
              <li>Additional features or scope changes will be quoted separately</li>
            </ul>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendQuote = async () => {
    try {
      // Create quote object
      const quote = {
        id: `quote-${Date.now()}`,
        clientName: clientInfo.clientName,
        clientEmail: clientInfo.clientEmail,
        company: clientInfo.company,
        configuration: configuration,
        calculation: calculation,
        selectedTier: calculation.tier,
        status: 'draft' as const,
        createdAt: new Date(),
        templateUsed: selectedTemplate ? {
          id: selectedTemplate.id,
          name: selectedTemplate.name
        } : { id: 'default', name: 'Default Template' }
      };

      // If a custom template is selected, use it for PDF generation
      if (selectedTemplate && selectedTemplate.file) {
        console.log('Using custom template:', selectedTemplate.name);
        
        try {
        // Generate quote number
        const quoteNumber = `CPQ-${Date.now().toString().slice(-6)}`;
        
          // Check if this is an SOW template with placeholders
          const { detectPlaceholders } = await import('../utils/pdfMerger');
          const isSowTemplate = await detectPlaceholders(selectedTemplate.file);
          
          let mergedPdfBlob;
          
          if (isSowTemplate) {
            // Use placeholder replacement for SOW templates
            console.log('📄 Detected SOW template, using placeholder replacement...');
            const { mergeQuoteWithPlaceholders } = await import('../utils/pdfMerger');
            const { quoteBlob, newTemplateBlob } = await mergeQuoteWithPlaceholders(selectedTemplate.file, quote, quoteNumber);
            
            // Download the quote PDF
            const quoteFileName = `Quote-${clientInfo.clientName.replace(/\s+/g, '-')}-${selectedTemplate.name}.pdf`;
            const quoteUrl = URL.createObjectURL(quoteBlob);
            const quoteLink = document.createElement('a');
            quoteLink.href = quoteUrl;
            quoteLink.download = quoteFileName;
            document.body.appendChild(quoteLink);
            quoteLink.click();
            document.body.removeChild(quoteLink);
            URL.revokeObjectURL(quoteUrl);
            
            // Download the new template
            const templateFileName = `New-Template-${selectedTemplate.name}-${new Date().toISOString().split('T')[0]}.pdf`;
            const templateUrl = URL.createObjectURL(newTemplateBlob);
            const templateLink = document.createElement('a');
            templateLink.href = templateUrl;
            templateLink.download = templateFileName;
            document.body.appendChild(templateLink);
            templateLink.click();
            document.body.removeChild(templateLink);
            URL.revokeObjectURL(templateUrl);
            
            console.log('✅ Quote generated with SOW template and new template created successfully');
            
            // Show success message
            alert(`✅ Quote generated successfully!\n\n📄 Quote PDF: ${quoteFileName}\n📄 New Template: ${templateFileName}\n\nBoth files have been downloaded. The new template contains your current data and can be used for future quotes.`);
            
          } else {
            // Use regular template merge for other templates
            console.log('📄 Using regular template merge...');
            const { mergeQuoteIntoTemplate } = await import('../utils/pdfMerger');
            mergedPdfBlob = await mergeQuoteIntoTemplate(selectedTemplate.file, quote, quoteNumber);
            
            // Download the merged PDF
            const fileName = `Quote-${clientInfo.clientName.replace(/\s+/g, '-')}-${selectedTemplate.name}.pdf`;
            const url = URL.createObjectURL(mergedPdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Quote generated with custom template successfully');
            
            // Show success message
            alert(`Quote PDF "${fileName}" has been generated using custom template "${selectedTemplate.name}" and downloaded successfully!`);
          }
          
        } catch (error) {
          console.error('Error merging with template:', error);
          alert('Error generating quote with template. Using default template instead.');
          
          // Fallback to default template
          if (onGenerateQuote) {
            onGenerateQuote(quote);
          }
        }
      } else {
        // Use default template (existing logic)
        console.log('Using default template');
        
        // Call the onGenerateQuote callback
        if (onGenerateQuote) {
          onGenerateQuote(quote);
        }
      }
    } catch (error) {
      console.error('Error generating quote:', error);
      alert('Error generating quote. Please try again.');
    }
  };

  // If HubSpot is not connected, show connection message
  if (hubspotState && !hubspotState.isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">HubSpot Not Connected</h2>
          <p className="text-gray-600 mb-6">
            Please connect to HubSpot in the HubSpot tab to automatically populate client information from your contacts.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Manual Client Information</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={clientInfo.clientName}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                  placeholder="Enter client name"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={clientInfo.clientEmail}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientEmail: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                  placeholder="Enter email address"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={clientInfo.company}
                  onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                  placeholder="Enter company name"
                />
                {clientInfo.company && hubspotState?.selectedContact && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {hubspotState.selectedContact.properties.company 
                      ? 'Company name from HubSpot contact'
                      : 'Company name auto-extracted from email domain'
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <FileText className="w-5 h-5" />
                  Generate Quote
                  <Sparkles className="w-5 h-5" />
                </span>
              </button>

            {/* Placeholder Preview Button */}
            {selectedTemplate && (
              <button
                type="button"
                onClick={generatePlaceholderPreview}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <Eye className="w-5 h-5" />
                  Preview Placeholder Replacement
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </button>
            )}

            {/* Placeholder Replacement Button */}
            {selectedTemplate && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Create quote object
                    const quote = {
                      id: `quote-${Date.now()}`,
                      clientName: clientInfo.clientName,
                      clientEmail: clientInfo.clientEmail,
                      company: clientInfo.company,
                      configuration: configuration,
                      calculation: calculation,
                      selectedTier: calculation.tier,
                      status: 'draft' as const,
                      createdAt: new Date(),
                      templateUsed: {
                        id: selectedTemplate.id,
                        name: selectedTemplate.name
                      }
                    };

                    const quoteNumber = `CPQ-${Date.now().toString().slice(-6)}`;
                    
                    console.log('🔄 Starting placeholder replacement for template:', selectedTemplate.name);
                    
                    // Check if template has placeholders
                    const { detectPlaceholders } = await import('../utils/pdfMerger');
                    const hasPlaceholders = await detectPlaceholders(selectedTemplate.file);
                    
                    if (!hasPlaceholders) {
                      alert('⚠️ No placeholders detected in this template. Make sure your template contains placeholders like {{company_name}}, {{users}}, etc.');
                      return;
                    }
                    
                    // Use placeholder replacement
                    const { mergeQuoteWithPlaceholders } = await import('../utils/pdfMerger');
                    const { quoteBlob, newTemplateBlob } = await mergeQuoteWithPlaceholders(selectedTemplate.file, quote, quoteNumber);
                    
                    // Download the quote PDF
                    const quoteFileName = `Quote-${clientInfo.clientName.replace(/\s+/g, '-')}-${selectedTemplate.name}-PLACEHOLDERS.pdf`;
                    const quoteUrl = URL.createObjectURL(quoteBlob);
                    const quoteLink = document.createElement('a');
                    quoteLink.href = quoteUrl;
                    quoteLink.download = quoteFileName;
                    document.body.appendChild(quoteLink);
                    quoteLink.click();
                    document.body.removeChild(quoteLink);
                    URL.revokeObjectURL(quoteUrl);
                    
                    // Download the new template
                    const templateFileName = `New-Template-${selectedTemplate.name}-${new Date().toISOString().split('T')[0]}.pdf`;
                    const templateUrl = URL.createObjectURL(newTemplateBlob);
                    const templateLink = document.createElement('a');
                    templateLink.href = templateUrl;
                    templateLink.download = templateFileName;
                    document.body.appendChild(templateLink);
                    templateLink.click();
                    document.body.removeChild(templateLink);
                    URL.revokeObjectURL(templateUrl);
                    
                    console.log('✅ Placeholder replacement and new template creation completed successfully');
                    alert(`✅ Process completed successfully!\n\n📄 Quote PDF: ${quoteFileName}\n📄 New Template: ${templateFileName}\n\nBoth files have been downloaded. The new template contains your current data and can be used for future quotes.`);
                    
                  } catch (error) {
                    console.error('❌ Placeholder replacement failed:', error);
                    alert(`❌ Placeholder replacement failed:\n\n${error.message}\n\nPlease check that your template contains valid placeholders and try again.`);
                  }
                }}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Replace Placeholders
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
              </button>
            )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  const QuotePreview = () => (
    <div className="bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 p-10 border-2 border-blue-100 rounded-2xl shadow-2xl max-w-5xl mx-auto backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-gradient-to-r from-blue-200 to-indigo-200">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            PROFESSIONAL QUOTE
          </h1>
          <p className="text-gray-700 font-semibold text-lg">Quote #Q-{Date.now().toString().slice(-6)}</p>
          <p className="text-gray-600 font-medium">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2">{companyInfo?.name || 'CPQ Pro Solutions'}</h2>
            <p className="opacity-90">{companyInfo?.address || '123 Business St.'}</p>
            <p className="opacity-90">{companyInfo?.city || 'City, State 12345'}</p>
            <p className="opacity-90">{companyInfo?.email || 'contact@cpqsolutions.com'}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl mb-10 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Bill To:
        </h3>
        <div className="space-y-2">
          <p className="font-bold text-lg text-gray-900">{clientInfo.clientName}</p>
          <p className="text-gray-700 font-semibold">{clientInfo.company}</p>
          <p className="text-gray-600 font-medium">{clientInfo.clientEmail}</p>
        </div>
      </div>

      {/* Project Details */}
      <div className="mb-10">
        <h3 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Project Configuration:
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
            <span className="text-gray-700 font-semibold">Number of Users:</span>
            <span className="font-bold text-gray-900">{configuration.numberOfUsers}</span>
          </div>
          <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
            <span className="text-gray-700 font-semibold">Instance Type:</span>
            <span className="font-bold text-gray-900">{configuration.instanceType}</span>
          </div>
          <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
            <span className="text-gray-700 font-semibold">Number of Instances:</span>
            <span className="font-bold text-gray-900">{configuration.numberOfInstances}</span>
          </div>
          <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
            <span className="text-gray-700 font-semibold">Duration:</span>
            <span className="font-bold text-gray-900">{configuration.duration} months</span>
          </div>
          <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
            <span className="text-gray-700 font-semibold">Migration Type:</span>
            <span className="font-bold text-gray-900">{configuration.migrationType}</span>
          </div>
          <div className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
            <span className="text-gray-700 font-semibold">Data Size:</span>
            <span className="font-bold text-gray-900">{configuration.dataSizeGB} GB</span>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="mb-10">
        <h3 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          Pricing Breakdown - {calculation.tier.name} Plan:
        </h3>
        <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-blue-200">
              <th className="text-left py-4 text-gray-800 font-bold text-lg">Description</th>
              <th className="text-right py-4 text-gray-800 font-bold text-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4 text-gray-700 font-medium">User costs ({configuration.numberOfUsers} users × {configuration.duration} months)</td>
              <td className="text-right py-4 font-bold text-gray-900">{formatCurrency(calculation.userCost)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-4 text-gray-700 font-medium">Data costs ({configuration.dataSizeGB} GB)</td>
              <td className="text-right py-4 font-bold text-gray-900">{formatCurrency(calculation.dataCost)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-4 text-gray-700 font-medium">Migration services</td>
              <td className="text-right py-4 font-bold text-gray-900">{formatCurrency(calculation.migrationCost)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-4 text-gray-700 font-medium">Instance costs ({configuration.numberOfInstances} instances)</td>
              <td className="text-right py-4 font-bold text-gray-900">{formatCurrency(calculation.instanceCost)}</td>
            </tr>
            <tr className="border-t-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
              <td className="py-6 font-bold text-xl text-gray-900">Total Project Cost</td>
              <td className="text-right py-6 font-bold text-2xl text-blue-600">{formatCurrency(calculation.totalCost)}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      {/* Features */}
      <div className="mb-10">
        <h3 className="font-bold text-gray-900 mb-6 text-xl">Included Features:</h3>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
        <ul className="grid grid-cols-2 gap-4">
          {calculation.tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              <span className="font-medium text-gray-800">{feature}</span>
            </li>
          ))}
        </ul>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-gray-50 p-6 rounded-2xl border-t-4 border-blue-500">
        <p className="mb-4 font-bold text-gray-900 text-lg">Terms & Conditions:</p>
        <div className="space-y-2 text-gray-700">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Quote valid for 30 days from date issued
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            50% deposit required to begin project
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Final payment due upon project completion
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Additional features or scope changes will be quoted separately
          </p>
        </div>
      </div>
    </div>
  );

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gradient-to-r from-white to-blue-50 p-6 rounded-2xl shadow-lg">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              Quote Preview
            </h2>
            <p className="text-gray-600 mt-1">Review your professional quote before sending</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Edit
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button 
              onClick={handleSendQuote}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              Generate PDF Quote
            </button>
          </div>
        </div>
        <QuotePreview />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Generate Professional Quote</h1>
        <p className="text-gray-600">Create a detailed quote for your client</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* HubSpot Integration Header */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
                  <h3 className="font-semibold text-gray-800">HubSpot Connected</h3>
                  <p className="text-sm text-gray-600">
                    {hubspotState?.hubspotContacts.length || 0} contacts available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowContactSelector(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Select Contact
              </button>
            </div>

            {/* Template Selection Indicator */}
            {selectedTemplate && (
              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Template Selected</h3>
                    <p className="text-sm text-gray-600">
                      Using template: <span className="font-medium text-green-700">{selectedTemplate.name}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Template Active
                  </span>
                </div>
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            Client Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <User className="w-4 h-4 text-white" />
                </div>
                Client Name
              </label>
              <input
                type="text"
                required
                value={clientInfo.clientName}
                onChange={(e) => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                placeholder="Enter client name"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                Email Address
              </label>
              <input
                type="email"
                required
                value={clientInfo.clientEmail}
                onChange={(e) => setClientInfo({ ...clientInfo, clientEmail: e.target.value })}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                placeholder="Enter email address"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Building className="w-4 h-4 text-white" />
                </div>
                Company Name
              </label>
              <input
                type="text"
                required
                value={clientInfo.company}
                onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                placeholder="Enter company name"
              />
                {clientInfo.company && hubspotState?.selectedContact && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {hubspotState.selectedContact.properties.company 
                      ? 'Company name from HubSpot contact'
                      : 'Company name auto-extracted from email domain'
                    }
                  </p>
                )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center justify-center gap-3">
                <FileText className="w-5 h-5" />
                Generate Quote
                <Sparkles className="w-5 h-5" />
              </span>
            </button>
          </form>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Quote Generated Successfully!</h3>
                    <p className="text-green-700 text-sm">
                      Your quote has been saved. You can view it in the Quotes tab.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Plan Summary */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Selected Plan Summary</h3>
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-blue-900 mb-2">{calculation.tier.name} Plan</h4>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatCurrency(calculation.totalCost)}
              </div>
              <div className="text-sm text-gray-700 font-medium">Total project cost</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                <span className="font-semibold">User costs:</span>
                <span className="font-bold text-gray-900">{formatCurrency(calculation.userCost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                <span className="font-semibold">Data costs:</span>
                <span className="font-bold text-gray-900">{formatCurrency(calculation.dataCost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                <span className="font-semibold">Migration:</span>
                <span className="font-bold text-gray-900">{formatCurrency(calculation.migrationCost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                <span className="font-semibold">Instances:</span>
                <span className="font-bold text-gray-900">{formatCurrency(calculation.instanceCost)}</span>
              </div>
            </div>

            <div className="border-t-2 border-blue-300 pt-6">
              <div className="text-sm text-gray-700 space-y-2">
                <p className="flex items-center gap-2 font-medium">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Duration: {configuration.duration} months
                </p>
                <p className="font-medium">Users: {configuration.numberOfUsers}</p>
                <p className="font-medium">Data: {configuration.dataSizeGB} GB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Selector Modal */}
      {showContactSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select HubSpot Contact</h3>
              <button
                onClick={() => setShowContactSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {hubspotState?.hubspotContacts.map(contact => (
                <div
                  key={contact.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {contact.properties.firstname?.[0]}{contact.properties.lastname?.[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {contact.properties.firstname} {contact.properties.lastname}
                      </h4>
                      <p className="text-sm text-gray-600">{contact.properties.email}</p>
                      {contact.properties.company && (
                        <p className="text-sm text-gray-500">{contact.properties.company}</p>
                      )}
                    </div>
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
            
            {(!hubspotState?.hubspotContacts || hubspotState.hubspotContacts.length === 0) && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contacts found in HubSpot</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showPreview && <QuotePreview />}

        {/* Placeholder Preview Modal */}
        {showPlaceholderPreview && placeholderPreviewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Placeholder Replacement Preview</h2>
                  <p className="text-gray-600">See exactly how your data will replace placeholders in the template</p>
                </div>
                <button
                  onClick={() => setShowPlaceholderPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Placeholder Mapping Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Placeholder Mappings</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {placeholderPreviewData.placeholders.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Placeholder</p>
                            <p className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {item.placeholder}
                            </p>
                          </div>
                          <div className="mx-4 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Will Become</p>
                            <p className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    Template with Placeholders
                  </h3>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {placeholderPreviewData.originalText}
                    </pre>
                  </div>
                </div>

                {/* After */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">2</span>
                    </div>
                    Template with Your Data
                  </h3>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {placeholderPreviewData.replacedText}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPlaceholderPreview(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setShowPlaceholderPreview(false);
                    // Trigger the actual quote generation
                    const form = document.querySelector('form');
                    if (form) {
                      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                >
                  Proceed with Generation
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default QuoteGenerator;