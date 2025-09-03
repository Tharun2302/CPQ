import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  Settings,
  CheckCircle,
  AlertCircle,
  X,
  FileText as WordIcon,
  Send
} from 'lucide-react';
import { convertPdfToWord, downloadWordFile, isPdfFile, testDocxLibrary } from '../utils/pdfToWordConverter';
import { createTemplateFromPdf } from '../utils/pdfToTemplate';
import { extractTemplateContent } from '../utils/pdfMerger';

interface Template {
  id: string;
  name: string;
  description: string;
  file: File; // Original PDF file
  wordFile?: File; // Converted Word file
  size: string;
  uploadDate: Date;
  isDefault: boolean;
  content?: string; // Extracted template content
}

interface TemplateManagerProps {
  onTemplateSelect?: (template: Template) => void;
  selectedTemplate?: Template | null;
  onTemplatesUpdate?: () => void;
  currentQuoteData?: any; // Current quote data for template processing
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ 
  onTemplateSelect, 
  selectedTemplate,
  onTemplatesUpdate,
  currentQuoteData
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<{
    template: Template;
    originalUrl: string;
    processedUrl: string;
    sampleQuote: any;
  } | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [processedTemplates, setProcessedTemplates] = useState<{[key: string]: File}>({});
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    file: null as File | null,
    wordFile: null as File | null
  });
  
  // Email functionality state
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
    clientName: ''
  });
  
  // Signature fields state
  const [signatureForm, setSignatureForm] = useState({
    eSignature: '',
    name: '',
    title: '',
    date: new Date().toISOString().split('T')[0] // Today's date as default
  });
  
  // Selected signature font style
  const [selectedFontStyle, setSelectedFontStyle] = useState(0); // Default to first font style
  
  // Template verification state
  const [isVerifyingTemplate, setIsVerifyingTemplate] = useState(false);
  
  // Signature font styles
  const signatureFonts = [
    { 
      name: 'Cursive', 
      fontFamily: '"Brush Script MT", cursive',
      fontSize: '18px',
      fontStyle: 'normal',
      fontWeight: 'normal'
    },
    { 
      name: 'Elegant', 
      fontFamily: '"Palatino", "Times New Roman", serif',
      fontSize: '16px',
      fontStyle: 'italic',
      fontWeight: 'normal'
    },
    { 
      name: 'Modern', 
      fontFamily: '"Arial", sans-serif',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 'bold'
    },
    { 
      name: 'Classic', 
      fontFamily: '"Georgia", serif',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 'normal'
    },
    { 
      name: 'Handwriting', 
      fontFamily: '"Comic Sans MS", cursive',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 'normal'
    }
  ];

  // Load templates from localStorage on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      const savedTemplates = localStorage.getItem('cpq_templates');
      if (savedTemplates) {
        try {
          const parsedTemplates = JSON.parse(savedTemplates);
          // Convert base64 strings back to File objects
          const templatesWithFiles = parsedTemplates.map((template: any) => ({
            ...template,
            file: template.fileData ? dataURLtoFile(template.fileData, template.fileName) : null,
            wordFile: template.wordFileData ? dataURLtoFile(template.wordFileData, template.wordFileName) : null,
            uploadDate: new Date(template.uploadDate),
            content: template.content || null // Restore the extracted content
          }));
          setTemplates(templatesWithFiles);
        } catch (error) {
          console.error('Error loading templates:', error);
        }
      }
      setIsLoading(false);
    };

    loadTemplates();
  }, []);

  // Save templates to localStorage whenever templates change
  useEffect(() => {
    const saveTemplates = async () => {
      try {
        if (templates.length > 0) {
          // Convert File objects to base64 strings for storage
          const templatesForStorage = await Promise.all(templates.map(async (template) => ({
            ...template,
            fileData: template.file ? await fileToDataURL(template.file) : null,
            fileName: template.file ? template.file.name : null,
            file: undefined // Remove file object as it can't be serialized
          })));
          
          localStorage.setItem('cpq_templates', JSON.stringify(templatesForStorage));
        } else {
          // Clear templates from localStorage if array is empty
          localStorage.removeItem('cpq_templates');
        }
        
        // Dispatch custom event to notify other components about template updates
        console.log('📢 Dispatching templatesUpdated event...');
        window.dispatchEvent(new CustomEvent('templatesUpdated'));
        
      } catch (error) {
        console.error('Error saving templates:', error);
        // If localStorage is full, show error message
        alert('Unable to save template. Local storage may be full. Please try deleting some templates.');
      }
    };

    saveTemplates();
  }, [templates]);

  // Helper function to convert File to base64 data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper function to convert base64 data URL back to File
  const dataURLtoFile = (dataURL: string, fileName: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isPdfFile(file)) {
      setUploadError('Please upload a PDF file only.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB.');
      return;
    }

    try {
      // Test the docx library first
      console.log('🧪 Testing docx library before conversion...');
      const libraryWorks = await testDocxLibrary();
      
      if (!libraryWorks) {
        throw new Error('Docx library is not working properly');
      }
      
      // Convert PDF to Word format
      console.log('🔄 Converting PDF to Word format...');
      const wordFile = await convertPdfToWord(file);
      
      setNewTemplate(prev => ({
        ...prev,
        file: file,
        wordFile: wordFile
      }));
      setUploadError(null);
      setUploadSuccess('PDF converted to Word format successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error converting PDF to Word:', error);
      
      // Fallback: Allow upload without Word conversion
      console.log('⚠️ Word conversion failed, allowing PDF upload only');
      setNewTemplate(prev => ({
        ...prev,
        file: file,
        wordFile: null
      }));
      setUploadError(null);
      setUploadSuccess('PDF uploaded successfully! (Word conversion failed, but PDF is available)');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);
    }
  };

  const handleUploadTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.file) {
      setUploadError('Please provide a template name and select a file.');
      return;
    }

    setIsUploading(true);

    try {
      // Extract content from the uploaded template
      console.log('📄 Extracting content from uploaded template...');
      const extractedContent = await extractTemplateContent(newTemplate.file);
      console.log('✅ Template content extracted:', extractedContent.substring(0, 100) + '...');

      const template: Template = {
        id: Date.now().toString(),
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim(),
        file: newTemplate.file,
        wordFile: newTemplate.wordFile,
        size: formatFileSize(newTemplate.file.size),
        uploadDate: new Date(),
        isDefault: templates.length === 0, // First template becomes default
        content: extractedContent // Store the extracted content
      };

      // Add template to state
      const updatedTemplates = [...templates, template];
      setTemplates(updatedTemplates);
      
      // Reset form
      setNewTemplate({ name: '', description: '', file: null, wordFile: null });
      setShowUploadModal(false);
      setUploadError(null);
      setUploadSuccess('Template uploaded successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);

      // If this is the first template, select it automatically
      if (templates.length === 0 && onTemplateSelect) {
        onTemplateSelect(template);
      }

      // Save to localStorage immediately
      const templatesForStorage = await Promise.all(updatedTemplates.map(async (t) => ({
        ...t,
        fileData: t.file ? await fileToDataURL(t.file) : null,
        fileName: t.file ? t.file.name : null,
        wordFileData: t.wordFile ? await fileToDataURL(t.wordFile) : null,
        wordFileName: t.wordFile ? t.wordFile.name : null,
        content: t.content, // Include the extracted content
        file: undefined,
        wordFile: undefined
      })));
      
      localStorage.setItem('cpq_templates', JSON.stringify(templatesForStorage));
      
    } catch (error) {
      console.error('Error uploading template:', error);
      setUploadError('Failed to upload template. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      // If deleted template was selected, clear selection
      if (selectedTemplate?.id === templateId && onTemplateSelect) {
        onTemplateSelect(null as any);
      }
    }
  };

  const handleSetDefault = (templateId: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === templateId
    })));
  };

  const handleSelectTemplateWithData = async (template: Template) => {
    try {
      console.log('🔄 Selecting template with data replacement:', template.name);
      
      if (!currentQuoteData) {
        console.log('⚠️ No current quote data available, using regular selection');
        onTemplateSelect?.(template);
        return;
      }

      // Validate current quote data
      console.log('📋 Current quote data:', currentQuoteData);
      
      if (!currentQuoteData || !currentQuoteData.configuration || !currentQuoteData.calculation) {
        throw new Error('Invalid quote data structure. Please ensure you have a complete quote configuration.');
      }
      
      // Create quote object from current data
      const quote = {
        id: currentQuoteData.id || `quote-${Date.now()}`,
        clientName: currentQuoteData.clientName || 'Client Name',
        clientEmail: currentQuoteData.clientEmail || 'client@example.com',
        company: currentQuoteData.company || 'Company Name',
        configuration: {
          numberOfUsers: currentQuoteData.configuration.numberOfUsers || 0,
          instanceType: currentQuoteData.configuration.instanceType || 'Standard',
          numberOfInstances: currentQuoteData.configuration.numberOfInstances || 1,
          duration: currentQuoteData.configuration.duration || 1,
          migrationType: currentQuoteData.configuration.migrationType || 'Migration',
          dataSizeGB: currentQuoteData.configuration.dataSizeGB || 0
        },
        calculation: {
          tier: currentQuoteData.calculation.tier || { name: 'Basic', features: [] },
          userCost: currentQuoteData.calculation.userCost || 0,
          dataCost: currentQuoteData.calculation.dataCost || 0,
          migrationCost: currentQuoteData.calculation.migrationCost || 0,
          instanceCost: currentQuoteData.calculation.instanceCost || 0,
          totalCost: currentQuoteData.calculation.totalCost || 0
        },
        selectedTier: currentQuoteData.selectedTier || { name: 'Basic', features: [] },
        status: 'draft' as const,
        createdAt: new Date(),
        templateUsed: {
          id: template.id,
          name: template.name
        }
      };

      const quoteNumber = `CPQ-${quote.id.split('-')[1] || Date.now().toString().slice(-6)}`;
      
      console.log('📋 Processing template with current quote data:', quote);
      
      // Use the placeholder replacement function to process template with current data
      let quoteBlob: Blob;
      let newTemplateBlob: Blob;
      
      try {
        const { mergeQuoteWithPlaceholders } = await import('../utils/pdfMerger');
        const result = await mergeQuoteWithPlaceholders(template.file, quote, quoteNumber);
        quoteBlob = result.quoteBlob;
        newTemplateBlob = result.newTemplateBlob;
        
        console.log('✅ Template processing completed successfully');
        console.log('📄 Quote blob size:', quoteBlob.size);
        console.log('📄 New template blob size:', newTemplateBlob.size);
        
      } catch (processingError) {
        console.error('❌ Error in mergeQuoteWithPlaceholders:', processingError);
        console.error('❌ Processing error details:', {
          templateName: template.name,
          templateSize: template.file.size,
          quoteData: quote,
          errorMessage: processingError.message,
          errorStack: processingError.stack
        });
        throw new Error(`Template processing failed: ${processingError.message}`);
      }
      
      // Store the processed template for preview
      const processedFile = new File([newTemplateBlob], `${template.name}-processed.pdf`, { type: 'application/pdf' });
      setProcessedTemplates(prev => ({
        ...prev,
        [template.id]: processedFile
      }));
      
      // Create a new template object with the processed file
      const processedTemplate = {
        ...template,
        file: processedFile
      };
      
      console.log('✅ Template processed with current quote data successfully');
      
      // Call the selection callback with the processed template
      onTemplateSelect?.(processedTemplate);
      
      // Show success message
      alert(`✅ Template "${template.name}" selected and processed with your current quote data!\n\nAll placeholders have been replaced with your actual data while preserving the template structure.\n\nYou can now click "Preview" to see the processed template with your data.`);
      
    } catch (error) {
      console.error('❌ Error processing template with current data:', error);
      console.error('❌ Error details:', {
        templateName: template.name,
        templateId: template.id,
        hasCurrentQuoteData: !!currentQuoteData,
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      // Fallback to regular selection if processing fails
      console.log('🔄 Falling back to regular template selection...');
      onTemplateSelect?.(template);
      
      // Show more detailed error message
      alert(`⚠️ Template selected, but data replacement failed.\n\nError: ${error.message}\n\nUsing original template. Please check the console for more details.`);
    }
  };

  // Simple preview function to show original template content
  const handleSimplePreview = (template: Template) => {
    try {
      console.log('🔍 Simple preview of original template:', template.name);
      
      // Create URL for original template
      const originalUrl = URL.createObjectURL(template.file);
      
      // Set preview data and show modal (only original template)
      setPreviewData({
        template,
        originalUrl,
        processedUrl: originalUrl, // Use same URL for now
        sampleQuote: null
      });
      setShowPreviewModal(true);
      
      console.log('✅ Simple template preview generated successfully');
      
    } catch (error) {
      console.error('❌ Error in simple preview:', error);
      alert('Failed to preview template. Please try again.');
    }
  };

  const handlePreviewTemplate = async (template: Template) => {
    try {
      console.log('🔍 Previewing template with sample data:', template.name);
      setIsGeneratingPreview(true);
      
      // Check if we have a processed template for this template
      const processedTemplate = processedTemplates[template.id];
      
      if (processedTemplate) {
        console.log('📄 Using processed template for preview');
        
        // Create sample data for display
        const sampleData = {
          company: 'Your Company',
          users: 'Your Users',
          migration: 'Your Migration Type',
          total: 'Your Total Cost'
        };
        
        // Create URL for processed template
        const processedUrl = URL.createObjectURL(processedTemplate);
        
        // Set preview data and show modal
        setPreviewData({
          template,
          originalUrl: URL.createObjectURL(template.file),
          processedUrl,
          sampleQuote: sampleData
        });
        setShowPreviewModal(true);
        
        console.log('✅ Processed template preview generated successfully');
        
      } else {
        console.log('📄 Using sample data for preview');
        
        // Create sample quote data for preview
        const sampleQuote = {
          id: `quote-${Date.now()}`,
          clientName: 'Sample Client',
          clientEmail: 'client@example.com',
          company: 'Sample Company Inc.',
          configuration: {
            numberOfUsers: 100,
            instanceType: 'Standard',
            numberOfInstances: 2,
            duration: 6,
            migrationType: 'Slack',
            dataSizeGB: 50
          },
          calculation: {
            tier: {
              name: 'Professional',
              features: ['Feature 1', 'Feature 2', 'Feature 3']
            },
            userCost: 5000,
            dataCost: 1000,
            migrationCost: 3000,
            instanceCost: 2000,
            totalCost: 11000
        },
          selectedTier: {
            name: 'Professional',
            features: ['Feature 1', 'Feature 2', 'Feature 3']
          },
          status: 'draft' as const,
          createdAt: new Date(),
          templateUsed: {
            id: template.id,
            name: template.name
          }
        };

        const quoteNumber = `CPQ-${Date.now().toString().slice(-6)}`;
        
        // Create URLs for both original and processed templates
        const originalUrl = URL.createObjectURL(template.file);
        
        // Use the placeholder replacement function to create preview
        let processedUrl: string;
        try {
          const { mergeQuoteWithPlaceholders } = await import('../utils/pdfMerger');
          const { quoteBlob } = await mergeQuoteWithPlaceholders(template.file, sampleQuote, quoteNumber);
          processedUrl = URL.createObjectURL(quoteBlob);
        } catch (processingError) {
          console.error('❌ Error processing template with placeholders:', processingError);
          throw new Error(`Template processing failed: ${processingError.message}`);
        }
        
        // Set preview data and show modal
        setPreviewData({
          template,
          originalUrl,
          processedUrl,
          sampleQuote
        });
        setShowPreviewModal(true);
        
        console.log('✅ Template preview with sample data generated successfully');
      }
      
    } catch (error) {
      console.error('❌ Error previewing template:', error);
      console.error('❌ Error details:', {
        templateName: template.name,
        templateId: template.id,
        hasProcessedTemplate: !!processedTemplates[template.id],
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      // Show more detailed error message
      alert(`Error previewing template: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
      
      // Fallback to simple PDF preview
      try {
    const url = URL.createObjectURL(template.file);
    window.open(url, '_blank');
      } catch (fallbackError) {
        console.error('❌ Fallback preview also failed:', fallbackError);
        alert('Unable to preview template. Please try downloading the template instead.');
      }
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleDownloadTemplate = (template: Template) => {
    const url = URL.createObjectURL(template.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.name + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWordTemplate = (template: Template) => {
    console.log('🔍 Word download clicked for template:', template.name);
    console.log('🔍 Template object:', template);
    console.log('🔍 Word file exists?', !!template.wordFile);
    console.log('🔍 Word file details:', template.wordFile);
    
    if (template.wordFile) {
      console.log('📥 Downloading Word file:', template.wordFile.name);
      try {
        downloadWordFile(template.wordFile, template.name + '.docx');
        console.log('✅ Word download initiated successfully');
      } catch (error) {
        console.error('❌ Error downloading Word file:', error);
        alert('Error downloading Word file: ' + error.message);
      }
    } else {
      console.warn('⚠️ No Word file available for template:', template.name);
      alert('Word version not available for this template. Please re-upload the template to generate a Word version.');
    }
  };

  const handleConvertToWord = async (template: Template) => {
    console.log('🔄 Converting existing template to Word:', template.name);
    
    try {
      // Test the docx library first
      const libraryWorks = await testDocxLibrary();
      if (!libraryWorks) {
        throw new Error('Docx library is not working properly');
      }
      
      // Convert the existing PDF to Word format
      const wordFile = await convertPdfToWord(template.file);
      
      // Update the template with the Word file
      const updatedTemplates = templates.map(t => 
        t.id === template.id 
          ? { ...t, wordFile: wordFile }
          : t
      );
      
      setTemplates(updatedTemplates);
      
      // Save to localStorage
      const templatesForStorage = await Promise.all(updatedTemplates.map(async (t) => ({
        ...t,
        fileData: t.file ? await fileToDataURL(t.file) : null,
        fileName: t.file ? t.file.name : null,
        wordFileData: t.wordFile ? await fileToDataURL(t.wordFile) : null,
        wordFileName: t.wordFile ? t.wordFile.name : null,
        file: undefined,
        wordFile: undefined
      })));
      
      localStorage.setItem('cpq_templates', JSON.stringify(templatesForStorage));
      
      alert('Template converted to Word format successfully!');
      
    } catch (error) {
      console.error('❌ Error converting template to Word:', error);
      alert('Failed to convert template to Word format: ' + error.message);
    }
  };

  // Template verification function
  const handleVerifyTemplate = async (template: Template) => {
    try {
      console.log('🔍 Starting template verification process...');
      setIsVerifyingTemplate(true);
      
      // Validate signature fields
      if (!signatureForm.eSignature.trim() || !signatureForm.name.trim() || !signatureForm.title.trim() || !signatureForm.date) {
        alert('Please fill in all signature fields before verifying the template.');
        return;
      }
      
      // Create signature data object
      const signatureData = {
        eSignature: signatureForm.eSignature,
        fullName: signatureForm.name,
        title: signatureForm.title,
        date: signatureForm.date,
        selectedFontStyle: selectedFontStyle
      };
      
      console.log('📋 Signature data for verification:', signatureData);
      
      if (!currentQuoteData) {
        alert('No quote data available for template verification. Please ensure you have a complete quote configuration.');
        return;
      }
      
      // Create quote object with signature data
      const quote = {
        ...currentQuoteData,
        signatureData: signatureData
      };
      
      const quoteNumber = `CPQ-${quote.id?.split('-')[1] || Date.now().toString().slice(-6)}`;
      
      // Process template with signature data for verification
      const { mergeQuoteWithPlaceholders } = await import('../utils/pdfMerger');
      const { quoteBlob } = await mergeQuoteWithPlaceholders(template.file, quote, quoteNumber);
      
      // Create a temporary URL for verification preview
      const verificationUrl = URL.createObjectURL(quoteBlob);
      
      // Open the verified template in a new tab for review
      window.open(verificationUrl, '_blank');
      
      console.log('✅ Template verification completed successfully');
      alert('✅ Template verification completed!\n\nThe template with your signature data has been opened in a new tab for your review.\n\nPlease verify that all signature fields are correctly placed on the third page before sending the email.');
      
    } catch (error) {
      console.error('❌ Error verifying template:', error);
      alert(`❌ Template verification failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support if the issue persists.`);
    } finally {
      setIsVerifyingTemplate(false);
    }
  };

  // Email handling function for template sending
  const handleEmailSubmit = async (template: Template) => {
    setSendingEmail(template.id);
    
    try {
      // Validate signature fields
      if (!signatureForm.eSignature.trim()) {
        throw new Error('Please enter your E-Signature before sending.');
      }
      if (!signatureForm.name.trim()) {
        throw new Error('Please enter your Full Name before sending.');
      }
      if (!signatureForm.title.trim()) {
        throw new Error('Please enter your Title/Position before sending.');
      }
      if (!signatureForm.date) {
        throw new Error('Please select a Date before sending.');
      }

      // Upload user signature image if available
      let userSignatureImage = null;
      if (signatureForm.signatureImage) {
        try {
          const formData = new FormData();
          formData.append('signatureImage', signatureForm.signatureImage);
          formData.append('formId', template.id);
          formData.append('signatureType', 'user');
          
          const uploadResponse = await fetch('http://localhost:3001/api/signature/upload-image', {
            method: 'POST',
            body: formData
          });
          
          const uploadResult = await uploadResponse.json();
          if (uploadResult.success) {
            userSignatureImage = signatureForm.signatureImage;
            console.log('✅ User signature image uploaded successfully');
          }
        } catch (uploadError) {
          console.warn('⚠️ Failed to upload user signature image:', uploadError);
        }
      }

      // Process template with signature data
      console.log('🔄 Processing template with signature data...');
      
      // Get current quote data from props
      if (!currentQuoteData) {
        throw new Error('No quote data available. Please generate a quote first.');
      }

      const quoteNumber = `CPQ-${Date.now().toString().slice(-6)}`;
      
      // Create enhanced quote data with signature information
      const enhancedQuoteData = {
        ...currentQuoteData,
        signatureData: {
          eSignature: signatureForm.eSignature,
          fullName: signatureForm.name,
          title: signatureForm.title,
          date: signatureForm.date,
          selectedFontStyle: selectedFontStyle
        }
      };
      
      // Use the placeholder replacement function to create processed template with signature
      const { mergeQuoteWithPlaceholders } = await import('../utils/pdfMerger');
      const { quoteBlob, newTemplateBlob } = await mergeQuoteWithPlaceholders(template.file, enhancedQuoteData, quoteNumber);
      
      // Create processed template file with signature data
      const processedTemplate = new File([newTemplateBlob], `${template.name}-signed.pdf`, { type: 'application/pdf' });
      
      // Store the processed template
      setProcessedTemplates(prev => ({
        ...prev,
        [template.id]: processedTemplate
      }));

      // Step 1: Create Digital Signature Form
      console.log('📝 Creating digital signature form for template...');
      const templateId = template.id;
      
      // Use client name from form or extract from email
      let clientName = emailForm.clientName || emailForm.to.split('@')[0] || 'Client';
      
      // If no client name provided, format the email username
      if (!emailForm.clientName) {
        clientName = clientName
          .replace(/[._]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        // If the name is too short or generic, use a more descriptive name
        if (clientName.length < 2 || clientName.toLowerCase() === 'client') {
          clientName = 'Client User';
        }
      }
      
      const formResponse = await fetch('http://localhost:3001/api/signature/create-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: templateId, // Use template ID as quote ID for tracking
          clientEmail: emailForm.to,
          clientName: clientName, // Use actual client name
          quoteData: {
            totalCost: 'Template Cost',
            plan: template.name,
            clientName: clientName,
            company: 'Client Company',
            quoteNumber: `TEMPLATE-${templateId.slice(-6)}`
          }
        })
      });

      if (!formResponse.ok) {
        throw new Error('Failed to create signature form');
      }

      const formResult = await formResponse.json();
      const formId = formResult.formId;
      console.log('✅ Signature form created for template:', formId);

      // Step 2: Send email with processed template and signature form link
      console.log('📧 Sending template via email with signature form...');
      
      // Create FormData for email with processed template
      const formData = new FormData();
      formData.append('to', emailForm.to);
      formData.append('subject', emailForm.subject);
      
      // Enhanced email message with signature form link
      const signatureFormLink = `${window.location.origin}/client-signature-form.html?formId=${formId}`;
      const enhancedMessage = `${emailForm.message}

📝 DIGITAL SIGNATURE REQUIRED
To approve this template, please click the link below to access our secure digital signature form:
${signatureFormLink}

The signature form will allow you to:
• Review the complete template details
• Provide your digital signature
• Approve or reject the template
• Add any comments or feedback

This form will expire in 7 days for security purposes.

Best regards,
CloudFuze Team`;
      
      formData.append('message', enhancedMessage);
      
      // Add the processed template as attachment
      formData.append('attachment', processedTemplate);
      
      console.log('📧 Sending email with processed template and signature form link...');
      
      // Send email with processed template and signature form link
      const response = await fetch('http://localhost:3001/api/email/send', {
        method: 'POST',
        body: formData
      });
      
      console.log('📧 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('📧 Server response:', result);
      
      if (result.success) {
        setShowEmailModal(null);
        setEmailForm({ to: '', subject: '', message: '', clientName: '' });
        setSignatureForm({
          eSignature: '',
          name: '',
          title: '',
          date: new Date().toISOString().split('T')[0]
        });
        setSelectedFontStyle(0); // Reset to first font style
        
        // Show success message with signature form info
        alert(`✅ Template sent successfully with digital signature form!

📧 Message ID: ${result.messageId}
📄 Template: ${template.name}
📎 Attachment: ${processedTemplate.name}
✍️ Signed by: ${signatureForm.name} (${signatureForm.title})
📝 Signature Style: ${signatureFonts[selectedFontStyle].name}
📅 Signed on: ${signatureForm.date}
📝 Signature Form ID: ${formId}
🔗 Form Link: ${signatureFormLink}

The client will receive an email with the processed template and a link to complete the digital signature process.`);
        
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
      
    } catch (error) {
      console.error('❌ Error sending template email:', error);
      
      if (error.message.includes('Failed to fetch')) {
        alert('❌ Cannot connect to email server. Please check if the backend is running.');
      } else if (error.message.includes('Server error:')) {
        alert(`❌ Server error: ${error.message}`);
      } else {
        alert(`❌ Error sending template email: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Template Manager</h1>
        <p className="text-gray-600">Upload and manage your PDF quote templates</p>
      </div>

      {/* Upload Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Upload New Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-xl border-2 p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">{template.name}</h3>
                  {template.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Template Description */}
              {template.description && (
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              )}

              {/* Template Details */}
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>PDF Size:</span>
                  <span className="font-medium">{template.size}</span>
                </div>
                {template.wordFile && (
                  <div className="flex justify-between">
                    <span>Word Size:</span>
                    <span className="font-medium">{formatFileSize(template.wordFile.size)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span className="font-medium">
                    {template.uploadDate.toLocaleDateString()}
                  </span>
                </div>
                                 <div className="flex justify-between">
                   <span>Formats:</span>
                   <span className="font-medium">
                     PDF{template.wordFile ? ' + RTF' : ''}
                   </span>
                 </div>
              </div>

              {/* Template Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => currentQuoteData ? handleSelectTemplateWithData(template) : onTemplateSelect?.(template)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedTemplate?.id === template.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Selected
                    </>
                  ) : (
                    <>
                      {currentQuoteData ? (
                        <>
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Select & Process
                    </>
                  ) : (
                    'Select'
                      )}
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleSimplePreview(template)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  View Original
                </button>
                
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  disabled={isGeneratingPreview}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingPreview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin inline mr-1"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                  <Eye className="w-4 h-4 inline mr-1" />
                  Preview with Sample Data
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDownloadTemplate(template)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  PDF
                </button>

                                 {template.wordFile ? (
                   <button
                     onClick={() => handleDownloadWordTemplate(template)}
                     className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                   >
                     <WordIcon className="w-4 h-4 inline mr-1" />
                     RTF
                   </button>
                 ) : (
                   <button
                     onClick={() => handleConvertToWord(template)}
                     className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                   >
                     <WordIcon className="w-4 h-4 inline mr-1" />
                     Convert
                   </button>
                 )}
                
                {!template.isDefault && (
                  <button
                    onClick={() => handleSetDefault(template.id)}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                  >
                    <Settings className="w-4 h-4 inline mr-1" />
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State */}
      {!isLoading && templates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Templates Yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first PDF template to get started with custom quote generation.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Template
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload Template</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter template name"
                />
              </div>

              {/* Template Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter template description (optional)"
                  rows={3}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  PDF File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="template-file"
                  />
                  <label htmlFor="template-file" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Click to upload PDF template
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Max size: 10MB
                    </p>
                  </label>
                </div>
                {newTemplate.file && (
                  <div className="mt-2 space-y-2">
                    {/* PDF File Info */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          PDF: {newTemplate.file.name} ({formatFileSize(newTemplate.file.size)})
                        </span>
                      </div>
                    </div>
                    
                                         {/* Word File Info */}
                     {newTemplate.wordFile && (
                       <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                         <div className="flex items-center gap-2">
                           <CheckCircle className="w-4 h-4 text-green-600" />
                           <span className="text-sm text-green-700">
                             RTF: {newTemplate.wordFile.name} ({formatFileSize(newTemplate.wordFile.size)})
                           </span>
                         </div>
                       </div>
                     )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">{uploadSuccess}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadTemplate}
                  disabled={isUploading || !newTemplate.name.trim() || !newTemplate.file}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isUploading ? 'Uploading...' : 'Upload Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-8xl w-full mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Template Preview</h2>
                <p className="text-gray-600">See how your template looks with sample data</p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewData(null);
                  // Clean up URLs
                  if (previewData) {
                    URL.revokeObjectURL(previewData.originalUrl);
                    URL.revokeObjectURL(previewData.processedUrl);
                  }
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>



            {/* Original Template Display */}
            <div className="w-full mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">📄</span>
                </div>
                Original Template (Before Processing)
              </h3>
              <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                <iframe
                  src={previewData.originalUrl}
                  className="w-full h-[600px]"
                  title="Original Template"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                This is your uploaded template with original placeholders like [Client.Company], [Quote.Total], etc.
              </p>
            </div>

            {/* Processed Template Display - Only show if we have processed data */}
            {previewData.sampleQuote && (
              <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  {processedTemplates[previewData.template.id] 
                    ? 'Template with Your Quote Data (After Processing)' 
                    : 'Template with Sample Data (After Processing)'}
                </h3>
                <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                  <iframe
                    src={previewData.processedUrl}
                    className="w-full h-[600px]"
                    title="Processed Template"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  This is how your template looks after placeholders are replaced with actual data.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewData(null);
                  // Clean up URLs
                  if (previewData) {
                    URL.revokeObjectURL(previewData.originalUrl);
                    URL.revokeObjectURL(previewData.processedUrl);
                  }
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  // Open email modal for sending template
                  if (processedTemplates[previewData.template.id]) {
                    // Pre-fill email form with template info
                    setEmailForm({
                      to: '',
                      subject: `CloudFuze Purchase Agreement - ${previewData.template.name}`,
                      message: `Dear Client,

Please find attached the CloudFuze Purchase Agreement template with your quote data.

This document contains all the details of your proposed solution including pricing, terms, and conditions.

Please review the attached template and use the digital signature form link below to approve or reject this agreement.

If you have any questions or need any modifications, please don't hesitate to contact us.

Best regards,
CloudFuze Team`
                    });
                    setShowEmailModal(previewData.template.id);
                  } else {
                    alert('Please process the template with your quote data first before sending.');
                  }
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Send Mail
              </button>
              <button
                onClick={() => {
                  // Download the processed template
                  const a = document.createElement('a');
                  a.href = previewData.processedUrl;
                  a.download = `${previewData.template.name}-preview.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
              >
                Download Processed Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Send Template via Email</h2>
                <p className="text-gray-600">Send the processed template to your client</p>
              </div>
              <button
                onClick={() => setShowEmailModal(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Email Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    To Email *
                  </label>
                  <input
                    type="email"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={emailForm.clientName || ''}
                    onChange={(e) => setEmailForm({ ...emailForm, clientName: e.target.value })}
                    placeholder="Client's full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="CloudFuze Purchase Agreement"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Message *
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Template Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Template Attachment</span>
                </div>
                <p className="text-sm text-blue-700">
                  The processed template with your quote data will be attached to this email.
                </p>
              </div>

              {/* Signature Fields */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">✍</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Your Signature Required</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* E-Signature */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      E-Signature *
                    </label>
                    <input
                      type="text"
                      value={signatureForm.eSignature}
                      onChange={(e) => setSignatureForm({ ...signatureForm, eSignature: e.target.value })}
                      placeholder="Type your full name as signature"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        fontFamily: signatureFonts[selectedFontStyle].fontFamily,
                        fontSize: signatureFonts[selectedFontStyle].fontSize,
                        fontStyle: signatureFonts[selectedFontStyle].fontStyle,
                        fontWeight: signatureFonts[selectedFontStyle].fontWeight,
                        color: '#000000'
                      }}
                      required
                    />
                    
                    {/* Signature Font Preview */}
                    {signatureForm.eSignature && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600 mb-2">Choose your signature style:</p>
                        <div className="space-y-2">
                          {signatureFonts.map((font, index) => (
                            <div 
                              key={index}
                              onClick={() => setSelectedFontStyle(index)}
                              className={`p-2 border rounded cursor-pointer transition-colors ${
                                selectedFontStyle === index 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                              style={{ minHeight: '30px', display: 'flex', alignItems: 'center' }}
                            >
                              <span 
                                className="text-gray-600 text-xs mr-2 min-w-[60px]"
                                style={{ fontFamily: 'Arial, sans-serif' }}
                              >
                                {font.name}:
                              </span>
                              <span 
                                style={{ 
                                  fontFamily: font.fontFamily,
                                  fontSize: font.fontSize,
                                  fontStyle: font.fontStyle,
                                  fontWeight: font.fontWeight,
                                  color: '#000000'
                                }}
                              >
                                {signatureForm.eSignature}
                              </span>
                              {selectedFontStyle === index && (
                                <div className="ml-auto">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={signatureForm.name}
                      onChange={(e) => setSignatureForm({ ...signatureForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Title/Position *
                    </label>
                    <input
                      type="text"
                      value={signatureForm.title}
                      onChange={(e) => setSignatureForm({ ...signatureForm, title: e.target.value })}
                      placeholder="e.g., Sales Manager, Director"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={signatureForm.date}
                      onChange={(e) => setSignatureForm({ ...signatureForm, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-3">
                  Please fill in all signature fields before sending the template to your client.
                </p>
              </div>

              {/* Verify Template Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const template = templates.find(t => t.id === showEmailModal);
                    if (template) {
                      handleVerifyTemplate(template);
                    }
                  }}
                  disabled={
                    isVerifyingTemplate ||
                    !signatureForm.eSignature.trim() ||
                    !signatureForm.name.trim() ||
                    !signatureForm.title.trim() ||
                    !signatureForm.date
                  }
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  {isVerifyingTemplate ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying Template...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify Template
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click to preview the template with your signature data on the third page
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEmailModal(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const template = templates.find(t => t.id === showEmailModal);
                    if (template) {
                      handleEmailSubmit(template);
                    }
                  }}
                  disabled={
                    sendingEmail === showEmailModal ||
                    !signatureForm.eSignature.trim() ||
                    !signatureForm.name.trim() ||
                    !signatureForm.title.trim() ||
                    !signatureForm.date
                  }
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  {sendingEmail === showEmailModal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
