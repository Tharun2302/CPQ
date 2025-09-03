import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ConfigurationForm from './components/ConfigurationForm';
import PricingComparison from './components/PricingComparison';
import PricingTierConfig from './components/PricingTierConfig';

import HubSpotIntegration from './components/HubSpotIntegration';
import QuoteGenerator from './components/QuoteGenerator';
import QuoteManager from './components/QuoteManager';
import TemplateManager from './components/TemplateManager';
import DealDetails from './components/DealDetails';
import DealComponents from './components/DealComponents';

import Analytics from './components/Analytics';
import Settings from './components/Settings';
import DigitalSignatureForm from './components/DigitalSignatureForm';
import { ConfigurationData, PricingCalculation, PricingTier, PricingTierConfiguration, Quote } from './types/pricing';
import { calculateAllTiers, getRecommendedTier, PRICING_TIERS } from './utils/pricing';
import { FileText, Building } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('configure');
  const [configuration, setConfiguration] = useState<ConfigurationData | undefined>(undefined);
  const [calculations, setCalculations] = useState<PricingCalculation[]>([]);
  const [selectedTier, setSelectedTier] = useState<PricingCalculation | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(PRICING_TIERS);

  
  // HubSpot state management
  const [hubspotState, setHubspotState] = useState({
    isConnected: false,
    isConnecting: false,
    connectionError: null as string | null,
    showDemoMode: false,
    hubspotContacts: [] as any[],
    hubspotDeals: [] as any[],
    isLoadingContacts: false,
    isLoadingDeals: false,
    createdContact: null as any,
    createdDeal: null as any,
    isCreatingContact: false,
    isCreatingDeal: false,
    selectedContact: null as any,
    searchTerm: ''
  });

  // Company information state management
  const [companyInfo, setCompanyInfo] = useState({
    name: 'CPQ Pro Solutions',
    address: '123 Business St.',
    city: 'City, State 12345',
    email: 'contact@cpqsolutions.com',
    phone: '(555) 123-4567'
  });

  // Template state management
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  // Current client info state with enhanced fields
  const [currentClientInfo, setCurrentClientInfo] = useState({
    clientName: 'John Smith',
    clientEmail: 'john.smith@democompany.com',
    company: 'Demo Company Inc.',
    phone: '+1 (555) 123-4567',
    jobTitle: 'IT Director',
    companyDomain: 'democompany.com',
    companyPhone: '+1 (555) 987-6543',
    companyAddress: '123 Business Street, City, State 12345'
  });

  // Deal data state
  const [dealData, setDealData] = useState<any>(null);
  const [activeDealData, setActiveDealData] = useState<any>(null);

  // Function to get deal information from URL parameters or localStorage
  const getDealInfo = () => {
    const dealInfo = localStorage.getItem('dealInfo');
    if (dealInfo) {
      try {
        return JSON.parse(dealInfo);
      } catch (error) {
        console.error('Error parsing deal info:', error);
        return null;
      }
    }
    return null;
  };

  // Function to clear deal information
  const clearDealInfo = () => {
    localStorage.removeItem('dealInfo');
    console.log('🗑️ Deal information cleared');
  };

  // Function to update deal information
  const updateDealInfo = (dealData: { dealId?: string; dealName?: string; amount?: number }) => {
    const currentDealInfo = getDealInfo() || {};
    const updatedDealInfo = { ...currentDealInfo, ...dealData };
    localStorage.setItem('dealInfo', JSON.stringify(updatedDealInfo));
    console.log('📝 Deal information updated:', updatedDealInfo);
  };

  // Function to debug and display current deal information
  const debugDealInfo = () => {
    const dealInfo = getDealInfo();
    console.log('🔍 Current Deal Information:');
    if (dealInfo) {
      console.log('   Deal ID:', dealInfo.dealId);
      console.log('   Deal Name:', dealInfo.dealName);
      console.log('   Amount:', dealInfo.amount);
    } else {
      console.log('   No deal information found');
    }
    return dealInfo;
  };

  // Parse deal parameters from URL
  const parseDealParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get('dealId');
    const dealName = urlParams.get('dealName');
    const amount = urlParams.get('amount');
    const closeDate = urlParams.get('closeDate');
    const stage = urlParams.get('stage');
    const ownerId = urlParams.get('ownerId');
    // Client information parameters
    const company = urlParams.get('company');
    const contactName = urlParams.get('contactName');
    const contactEmail = urlParams.get('contactEmail');
    const contactPhone = urlParams.get('contactPhone');
    const contactJobTitle = urlParams.get('contactJobTitle');
    const companyDomain = urlParams.get('companyDomain');
    const companyPhone = urlParams.get('companyPhone');
    const companyAddress = urlParams.get('companyAddress');
    
    console.log('🔍 Parsing URL parameters:', {
      dealId,
      dealName,
      amount,
      closeDate,
      stage,
      ownerId,
      company,
      contactName,
      contactEmail,
      contactPhone,
      contactJobTitle,
      companyDomain,
      companyPhone,
      companyAddress
    });
    
    if (dealId) {
      const dealData = {
        dealId,
        dealName: dealName || 'Unnamed Deal',
        amount: amount || 'Not Set',
        closeDate: closeDate || '',
        stage: stage || 'Not Set',
        ownerId: ownerId || 'Not Set',
        // Client information from URL parameters or demo data for localhost testing
        company: company || 'Demo Company Inc.',
        contactName: contactName || 'John Smith',
        contactEmail: contactEmail || 'john.smith@democompany.com',
        contactPhone: contactPhone || '+1 (555) 123-4567',
        contactJobTitle: contactJobTitle || 'IT Director',
        companyDomain: companyDomain || 'democompany.com',
        companyPhone: companyPhone || '+1 (555) 987-6543',
        companyAddress: companyAddress || '123 Business Street, City, State 12345'
      };
      
      console.log('📋 Created deal data:', dealData);
      setDealData(dealData);
      return dealData;
    }
    return null;
  };

  // Refresh deal data from HubSpot
  const refreshDealData = async () => {
    if (dealData?.dealId) {
      try {
        console.log('🔄 Refreshing deal data for ID:', dealData.dealId);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/hubspot/deal/${dealData.dealId}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📥 HubSpot API response:', result);
          
          if (result.success && result.data) {
            // Extract properties from HubSpot response
            const properties = result.data.properties || result.data;
            
            // Create updated deal data with enhanced contact and company information
            const updatedDealData = {
              dealId: dealData.dealId,
              dealName: properties.dealname || properties.dealName || dealData.dealName || 'Not Set',
              amount: properties.amount || dealData.amount || 'Not Set',
              stage: properties.dealstage || properties.stage || dealData.stage || 'Not Set',
              closeDate: properties.closedate || properties.closeDate || dealData.closeDate || '',
              ownerId: properties.hubspot_owner_id || properties.ownerId || dealData.ownerId || 'Not Set',
              // Enhanced company information
              company: properties.company || dealData.company || '',
              companyDomain: properties.company_domain || properties.companyDomain || '',
              companyPhone: properties.company_phone || properties.companyPhone || '',
              companyAddress: properties.company_address || properties.companyAddress || '',
              // Enhanced contact information
              contactName: properties.contact_name || properties.contactName || dealData.contactName || '',
              contactEmail: properties.contact_email || properties.contactEmail || dealData.contactEmail || '',
              contactPhone: properties.contact_phone || properties.contactPhone || '',
              contactJobTitle: properties.contact_job_title || properties.contactJobTitle || ''
            };
            
            console.log('✅ Updated deal data:', updatedDealData);
            
            // Update both dealData and activeDealData if they match
            setDealData(updatedDealData);
            if (activeDealData && activeDealData.dealId === dealData.dealId) {
              setActiveDealData(updatedDealData);
            }
            
            // Update localStorage
            localStorage.setItem('dealInfo', JSON.stringify(updatedDealData));
            
            // Auto-fill client details from HubSpot data
            const enhancedClientInfo = {
              clientName: updatedDealData.contactName || '',
              clientEmail: updatedDealData.contactEmail || '',
              company: updatedDealData.company || '',
              phone: updatedDealData.contactPhone || '',
              jobTitle: updatedDealData.contactJobTitle || '',
              companyDomain: updatedDealData.companyDomain || '',
              companyPhone: updatedDealData.companyPhone || '',
              companyAddress: updatedDealData.companyAddress || ''
            };
            
            setCurrentClientInfo(enhancedClientInfo);
            localStorage.setItem('cpq_client_info', JSON.stringify(enhancedClientInfo));
            
            console.log('✅ Client details auto-filled from HubSpot:', enhancedClientInfo);
            
            // Show success message
            console.log('🎉 Deal data refreshed successfully from HubSpot with contact details!');
          } else {
            console.warn('⚠️ HubSpot API returned no data for deal:', dealData.dealId);
          }
        } else {
          console.error('❌ HubSpot API error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Error refreshing deal data:', error);
      }
    } else {
      console.warn('⚠️ No deal ID available for refresh');
    }
  };

  // Handle using deal data in configuration and quote generation
  const handleUseDealData = (dealData: any) => {
    setActiveDealData(dealData);
    setActiveTab('configure');
    console.log('✅ Deal data activated for configuration:', dealData);
  };

  // Handle URL parameters on component mount
  useEffect(() => {
    const dealParams = parseDealParameters();
    
    if (dealParams) {
      // Auto-populate the configuration form with deal data
      setConfiguration(prev => ({
        ...prev,
        clientName: dealParams.dealName,
        // You can add more auto-population here
      }));
      
      // Auto-fill client information from deal data
      const enhancedClientInfo = {
        clientName: dealParams.contactName || 'Demo Client',
        clientEmail: dealParams.contactEmail || 'demo@company.com',
        company: dealParams.company || 'Demo Company',
        phone: dealParams.contactPhone || '+1 (555) 123-4567',
        jobTitle: dealParams.contactJobTitle || 'Demo Position',
        companyDomain: dealParams.companyDomain || 'democompany.com',
        companyPhone: dealParams.companyPhone || '+1 (555) 987-6543',
        companyAddress: dealParams.companyAddress || 'Demo Address'
      };
      
      setCurrentClientInfo(enhancedClientInfo);
      localStorage.setItem('cpq_client_info', JSON.stringify(enhancedClientInfo));
      
      console.log('✅ Client info auto-filled from deal parameters:', enhancedClientInfo);
      
      // Store deal info for later use
      localStorage.setItem('dealInfo', JSON.stringify(dealParams));
      
      // Set active tab to 'deal' when deal data is present
      setActiveTab('deal');
      
      // Automatically refresh deal data from HubSpot to get real values
      console.log('🚀 Auto-refreshing deal data from HubSpot...');
      setTimeout(() => {
        refreshDealData();
      }, 1000); // Small delay to ensure component is fully mounted
    }
  }, []);

  // Make deal functions available globally for debugging
  useEffect(() => {
    (window as any).dealFunctions = {
      getDealInfo,
      updateDealInfo,
      clearDealInfo,
      debugDealInfo
    };
    console.log('🔧 Deal functions available in console:');
    console.log('   window.dealFunctions.getDealInfo()');
    console.log('   window.dealFunctions.updateDealInfo({dealId: "123", dealName: "Test Deal"})');
    console.log('   window.dealFunctions.clearDealInfo()');
    console.log('   window.dealFunctions.debugDealInfo()');
  }, []);

  // Function to get current quote data for template processing
  const getCurrentQuoteData = () => {
    if (!configuration || !selectedTier) {
      return null;
    }

    return {
      id: `quote-${Date.now()}`,
      clientName: currentClientInfo.clientName || 'Current Client',
      clientEmail: currentClientInfo.clientEmail || 'client@example.com',
      company: currentClientInfo.company || 'Current Company',
      configuration: configuration,
      calculation: selectedTier,
      selectedTier: selectedTier,
      status: 'draft' as const,
      createdAt: new Date(),
      templateUsed: selectedTemplate ? {
        id: selectedTemplate.id,
        name: selectedTemplate.name
      } : null
    };
  };

  // Quote state management
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Signature form state management
  const [signatureFormData, setSignatureFormData] = useState<any>(null);
  const [isSignatureForm, setIsSignatureForm] = useState(false);

  // Load pricing tiers from localStorage on component mount
  useEffect(() => {
    // Clear old pricing cache and force use of new pricing tiers
    localStorage.removeItem('pricingTiers');
    
    // Fetch URL parameters for deal information
    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get('dealId');
    const dealName = urlParams.get('dealName');
    const amount = urlParams.get('amount');
    
    // Log the fetched parameters
    if (dealId || dealName || amount) {
      console.log('🔍 URL Parameters detected:');
      console.log('   Deal ID:', dealId);
      console.log('   Deal Name:', dealName);
      console.log('   Amount:', amount);
      
      // You can use these values to pre-populate forms or set state
      // For example, if you want to set the current client info based on deal data
      if (dealName) {
        setCurrentClientInfo(prev => ({
          ...prev,
          clientName: dealName,
          company: dealName.split(' ')[0] + ' Inc.' // Extract company name from deal name
        }));
      }
      
      // Store deal information in localStorage for later use
      if (dealId || dealName || amount) {
        localStorage.setItem('dealInfo', JSON.stringify({
          dealId,
          dealName,
          amount: amount ? parseFloat(amount) : null
        }));
      }
    }

    localStorage.removeItem('pricingTierConfigurations');
    
    console.log('🔄 Loading updated pricing tiers...');
    setPricingTiers(PRICING_TIERS);
    
    // If we have a configuration, recalculate with new tiers
    if (configuration) {
      const newCalculations = calculateAllTiers(configuration, PRICING_TIERS);
      setCalculations(newCalculations);
      console.log('✅ Recalculated pricing with new tiers');
    }
  }, []);

  // Load HubSpot state from localStorage on component mount
  useEffect(() => {
    const savedHubspotState = localStorage.getItem('hubspotState');
    if (savedHubspotState) {
      try {
        const parsedState = JSON.parse(savedHubspotState);
        setHubspotState(prevState => ({
          ...prevState,
          ...parsedState,
          // Reset loading states when loading from storage
          isConnecting: false,
          isLoadingContacts: false,
          isLoadingDeals: false,
          isCreatingContact: false,
          isCreatingDeal: false
        }));
      } catch (error) {
        console.error('Error loading saved HubSpot state:', error);
      }
    }
  }, []);

  // Save HubSpot state to localStorage whenever it changes

  // Handle URL-based routing for signature forms
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/signature-form/')) {
      const formId = path.split('/signature-form/')[1];
      if (formId) {
        // Fetch signature form data
        fetchSignatureFormData(formId);
      }
    } else {
      setIsSignatureForm(false);
      setSignatureFormData(null);
    }
  }, []);

  const fetchSignatureFormData = async (formId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/signature/form/${formId}`);
      if (response.ok) {
        const data = await response.json();
        setSignatureFormData(data.form);
        setIsSignatureForm(true);
      } else {
        console.error('Failed to fetch signature form data');
        alert('Signature form not found or has expired.');
      }
    } catch (error) {
      console.error('Error fetching signature form:', error);
      alert('Error loading signature form. Please try again.');
    }
  };

  const handleSignatureFormComplete = (signatureData: any, approvalStatus: string, comments: string) => {
    alert(`Thank you! Your ${approvalStatus === 'approved' ? 'approval' : 'response'} has been submitted successfully.`);
    // Redirect to a thank you page or close the form
    window.location.href = '/';
  };
  useEffect(() => {
    try {
      localStorage.setItem('hubspotState', JSON.stringify(hubspotState));
    } catch (error) {
      console.error('Error saving HubSpot state to localStorage:', error);
    }
  }, [hubspotState]);

  // Load company information from localStorage on component mount
  useEffect(() => {
    const savedCompanyInfo = localStorage.getItem('companyInfo');
    if (savedCompanyInfo) {
      try {
        const parsedInfo = JSON.parse(savedCompanyInfo);
        setCompanyInfo(parsedInfo);
      } catch (error) {
        console.error('Error loading saved company info:', error);
      }
    }
  }, []);

  // Load quotes from database and localStorage on component mount
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        // First try to load from database
        const response = await fetch('http://localhost:3001/api/quotes');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.quotes) {
            // Convert date strings back to Date objects
            const quotesWithDates = data.quotes.map((quote: any) => ({
              ...quote,
              createdAt: new Date(quote.created_at),
              templateUsed: {
                id: 'default',
                name: 'Default Template',
                isDefault: true
              }
            }));
            setQuotes(quotesWithDates);
            console.log('✅ Quotes loaded from database:', quotesWithDates.length);
            return; // Exit early if database load was successful
          }
        }
      } catch (error) {
        console.log('⚠️ Could not load quotes from database, falling back to localStorage:', error);
      }

      // Fallback to localStorage if database fails
      const savedQuotes = localStorage.getItem('cpq_quotes');
      if (savedQuotes) {
        try {
          const parsedQuotes = JSON.parse(savedQuotes);
          // Convert date strings back to Date objects
          const quotesWithDates = parsedQuotes.map((quote: any) => ({
            ...quote,
            createdAt: new Date(quote.createdAt)
          }));
          setQuotes(quotesWithDates);
          console.log('✅ Quotes loaded from localStorage:', quotesWithDates.length);
        } catch (error) {
          console.error('Error loading saved quotes from localStorage:', error);
        }
      }
    };

    loadQuotes();
  }, []);

  // Load templates from localStorage on component mount
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const savedTemplates = localStorage.getItem('cpq_templates');
        if (savedTemplates) {
          const parsedTemplates = JSON.parse(savedTemplates);
          // Convert base64 strings back to File objects
          const templatesWithFiles = parsedTemplates.map((template: any) => ({
            ...template,
            file: template.fileData ? dataURLtoFile(template.fileData, template.fileName) : null,
            wordFile: template.wordFileData ? dataURLtoFile(template.wordFileData, template.wordFileName) : null,
            uploadDate: new Date(template.uploadDate)
          }));
          setTemplates(templatesWithFiles);
          console.log('📋 Templates loaded in App:', templatesWithFiles.length);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates([]);
      }
    };

    loadTemplates();

    // Listen for template updates from TemplateManager
    const handleTemplateUpdate = () => {
      console.log('🔄 Template update detected, reloading templates...');
      loadTemplates();
    };

    // Add event listener for template updates
    window.addEventListener('templatesUpdated', handleTemplateUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener('templatesUpdated', handleTemplateUpdate);
    };
  }, []);

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Save company information to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    } catch (error) {
      console.error('Error saving company info to localStorage:', error);
    }
  }, [companyInfo]);

  // Save quotes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cpq_quotes', JSON.stringify(quotes));
    } catch (error) {
      console.error('Error saving quotes to localStorage:', error);
    }
  }, [quotes]);



  const handleConfigurationChange = (config: ConfigurationData) => {
    setConfiguration(config);
    const newCalculations = calculateAllTiers(config, pricingTiers);
    setCalculations(newCalculations);
  };

  const handleSubmitConfiguration = () => {
    setShowPricing(true);
  };

  const handleSelectTier = (calculation: PricingCalculation) => {
    setSelectedTier(calculation);
    setActiveTab('quote');
  };

  const handleTierUpdate = (updatedTiers: PricingTier[]) => {
    setPricingTiers(updatedTiers);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('pricingTiers', JSON.stringify(updatedTiers));
      console.log('Pricing tiers saved to localStorage');
    } catch (error) {
      console.error('Error saving pricing tiers to localStorage:', error);
    }
    
    // Recalculate if we have a configuration
    if (configuration) {
      const newCalculations = calculateAllTiers(configuration, updatedTiers);
      setCalculations(newCalculations);
    }
  };



  // HubSpot state update functions
  const updateHubspotState = (updates: Partial<typeof hubspotState>) => {
    setHubspotState(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  const resetHubspotState = () => {
    setHubspotState({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      showDemoMode: false,
      hubspotContacts: [],
      hubspotDeals: [],
      isLoadingContacts: false,
      isLoadingDeals: false,
      createdContact: null,
      createdDeal: null,
      isCreatingContact: false,
      isCreatingDeal: false,
      selectedContact: null,
      searchTerm: ''
    });
    localStorage.removeItem('hubspotState');
  };

  // Company information update function
  const updateCompanyInfo = (updates: Partial<typeof companyInfo>) => {
    setCompanyInfo(prevInfo => ({
      ...prevInfo,
      ...updates
    }));
  };

  const handleGenerateQuote = async (clientInfo: any) => {
    if (!selectedTier || !configuration) {
      console.error('Cannot generate quote: missing tier or configuration');
      return;
    }

    // Create a new quote
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      clientName: clientInfo.clientName,
      clientEmail: clientInfo.clientEmail,
      company: clientInfo.company,
      configuration: configuration,
      selectedTier: selectedTier.tier,
      calculation: selectedTier,
      createdAt: new Date(),
      status: 'draft',
      templateUsed: {
        id: 'default',
        name: 'Default Template',
        isDefault: true
      },
      dealData: activeDealData || null
    };

    // Add quote to state (localStorage)
    setQuotes(prevQuotes => [newQuote, ...prevQuotes]);

    // Save quote to database
    try {
      const response = await fetch('http://localhost:3001/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newQuote.id,
          clientName: newQuote.clientName,
          clientEmail: newQuote.clientEmail,
          company: newQuote.company,
          configuration: newQuote.configuration,
          selectedTier: newQuote.selectedTier,
          calculation: newQuote.calculation,
          status: newQuote.status,
          dealData: newQuote.dealData
        })
      });

      if (response.ok) {
        console.log('✅ Quote saved to database successfully');
      } else {
        console.error('❌ Failed to save quote to database:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error saving quote to database:', error);
    }

    console.log('✅ Quote generated and saved:', newQuote);
    console.log('📊 Total quotes:', quotes.length + 1);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== quoteId));
    
    // Delete from database
    try {
      const response = await fetch(`http://localhost:3001/api/quotes/${quoteId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('✅ Quote deleted from database:', quoteId);
      } else {
        console.error('❌ Failed to delete quote from database:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error deleting quote from database:', error);
    }
    
    console.log('🗑️ Quote deleted:', quoteId);
  };

  const handleUpdateQuoteStatus = async (quoteId: string, newStatus: Quote['status']) => {
    setQuotes(prevQuotes => 
      prevQuotes.map(quote => 
        quote.id === quoteId ? { ...quote, status: newStatus } : quote
      )
    );
    
    // Update in database
    try {
      const response = await fetch(`http://localhost:3001/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        console.log('✅ Quote status updated in database:', quoteId, 'to', newStatus);
      } else {
        console.error('❌ Failed to update quote status in database:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error updating quote status in database:', error);
    }
    
    console.log('📝 Quote status updated:', quoteId, 'to', newStatus);
  };

  const handleUpdateQuote = (quoteId: string, updates: Partial<Quote>) => {
    setQuotes(prevQuotes => 
      prevQuotes.map(quote => 
        quote.id === quoteId ? { ...quote, ...updates } : quote
      )
    );
    console.log('📝 Quote updated:', quoteId, 'with updates:', updates);
  };

  const handleTemplatesUpdate = () => {
    // This function will be called when templates are updated
    // The actual reloading is handled by the event listener in useEffect
    console.log('🔄 Templates updated, reloading...');
  };

  const renderContent = () => {
    // Handle signature form display
    if (isSignatureForm && signatureFormData) {
      return (
        <DigitalSignatureForm
          formId={signatureFormData.form_id}
          quoteData={signatureFormData.quote_data}
          clientName={signatureFormData.client_name}
          clientEmail={signatureFormData.client_email}
          onComplete={handleSignatureFormComplete}
        />
      );
    }

    switch (activeTab) {
      case 'deal':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Deal Information</h1>
                  <p className="text-gray-600">View and manage deal details from HubSpot</p>
                </div>
              </div>
            </div>
            
            {/* Show DealDetails component with real or test data */}
            <DealDetails 
              dealData={dealData || {
                dealId: "TEST-12345",
                dealName: "Test Deal - Cloud Migration",
                amount: "$25,000",
                stage: "Proposal",
                closeDate: "2024-12-31",
                ownerId: "user-456"
              }}
              onRefresh={refreshDealData}
              onUseDealData={handleUseDealData}
            />
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-8">
            <ConfigurationForm
              onConfigurationChange={handleConfigurationChange}
              onSubmit={handleSubmitConfiguration}
              dealData={activeDealData}
            />
            
            {showPricing && calculations.length > 0 && (
              <PricingComparison
                calculations={calculations}
                recommendedTier={getRecommendedTier(calculations)}
                onSelectTier={handleSelectTier}
                configuration={configuration}
              />
            )}
          </div>
        );

      case 'pricing-config':
        return (
          <PricingTierConfig
            tiers={pricingTiers}
            onTierUpdate={handleTierUpdate}
          />
        );



      case 'hubspot':
        // Add debugging
        console.log('🔍 HubSpot tab render:', {
          selectedTier,
          configuration,
          hubspotState,
          companyInfo
        });
        
        // Create a default quote if none exists
        const defaultQuote: Quote = selectedTier ? {
          id: 'temp-quote',
          clientName: 'Sample Client',
          clientEmail: 'client@example.com',
          company: companyInfo.name || 'Sample Company', // Use actual company name from settings
          configuration: configuration!,
          selectedTier: selectedTier.tier,
          calculation: selectedTier,
          createdAt: new Date(),
          status: 'draft' as const
        } : {
          id: 'demo-quote',
          clientName: 'Demo Client',
          clientEmail: 'demo@example.com',
          company: companyInfo.name || 'Demo Company', // Use actual company name from settings
          configuration: configuration || {
            numberOfUsers: 10,
            dataSizeGB: 100,
            numberOfInstances: 1,
            instanceType: 'Small',
            migrationType: 'Email',
            duration: 12
          },
          selectedTier: {
            id: 'basic-tier',
            name: 'Basic',
            perUserCost: 30.0,
            perGBCost: 1.00,
            managedMigrationCost: 300,
            instanceCost: 500,
            userLimits: { from: 1, to: 1000 },
            gbLimits: { from: 1, to: 10000 },
            features: ['Basic support', 'Standard migration', 'Email support', 'Basic reporting']
          },
          calculation: selectedTier || {
            tier: {
              id: 'basic-tier',
              name: 'Basic',
              perUserCost: 30.0,
              perGBCost: 1.00,
              managedMigrationCost: 300,
              instanceCost: 500,
              userLimits: { from: 1, to: 1000 },
              gbLimits: { from: 1, to: 10000 },
              features: ['Basic support', 'Standard migration', 'Email support', 'Basic reporting']
            },
            userCost: 30,
            dataCost: 100,
            migrationCost: 300,
            instanceCost: 500,
            totalCost: 930
          },
          createdAt: new Date(),
          status: 'draft' as const
        };
        
        return (
          <HubSpotIntegration
            quote={defaultQuote}
            configuration={configuration || {
              numberOfUsers: 10,
              dataSizeGB: 100,
              numberOfInstances: 1,
              instanceType: 'Small',
              migrationType: 'Email',
              duration: 12
            }}
            calculation={selectedTier || {
              tier: {
                id: 'basic-tier',
                name: 'Basic',
                perUserCost: 30.0,
                perGBCost: 1.00,
                managedMigrationCost: 300,
                instanceCost: 500,
                userLimits: { from: 1, to: 1000 },
                gbLimits: { from: 1, to: 10000 },
                features: ['Basic support', 'Standard migration', 'Email support', 'Basic reporting']
              },
              userCost: 30,
              dataCost: 100,
              migrationCost: 300,
              instanceCost: 500,
              totalCost: 930
            }}
            hubspotState={hubspotState}
            updateHubspotState={updateHubspotState}
            resetHubspotState={resetHubspotState}
          />
        );

      case 'quote':
        if (!selectedTier || !configuration) {
          return (
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Configuration Selected</h2>
                <p className="text-gray-600 mb-6">
                  Please configure your project and select a pricing tier first to generate a quote.
                </p>
                <div className="space-x-4">
                  <button
                    onClick={() => setActiveTab('configure')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Go to Configuration
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <QuoteGenerator
            calculation={selectedTier}
            configuration={configuration}
            onGenerateQuote={handleGenerateQuote}
            hubspotState={hubspotState}
            onSelectHubSpotContact={(contact) => updateHubspotState({ selectedContact: contact })}
            companyInfo={companyInfo}
            selectedTemplate={selectedTemplate}
            onClientInfoChange={setCurrentClientInfo}
            dealData={activeDealData}
          />
        );

      case 'quotes':
        return (
          <QuoteManager
            quotes={quotes}
            onDeleteQuote={handleDeleteQuote}
            onUpdateQuoteStatus={handleUpdateQuoteStatus}
            onUpdateQuote={handleUpdateQuote}
            templates={templates}

          />
        );

      case 'templates':
        return (
          <TemplateManager
            onTemplateSelect={setSelectedTemplate}
            selectedTemplate={selectedTemplate}
            onTemplatesUpdate={handleTemplatesUpdate}
            currentQuoteData={getCurrentQuoteData()}

          />
        );



      case 'analytics':
        return <Analytics />;

      case 'settings':
        return (
          <Settings
            companyInfo={companyInfo}
            updateCompanyInfo={updateCompanyInfo}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50">
      {!isSignatureForm && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}
      
      <main className={`${isSignatureForm ? 'max-w-6xl' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-10`}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;