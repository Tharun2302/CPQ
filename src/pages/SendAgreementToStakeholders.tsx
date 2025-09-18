import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileCheck2, Inbox, Mail, ShieldCheck, UserRound } from 'lucide-react';

type DocumentRow = {
  id: string;
  name: string;
  clientName: string;
  company: string;
  clientEmail?: string;
  type: 'PDF' | 'DOCX' | 'HTML';
  created: string; // ISO or display date
};

const mockDocuments: DocumentRow[] = [
  {
    id: '68c8153aa83e2b61b46d4d28',
    name: 'quote_manul_20250915_190138.pdf',
    clientName: 'manul',
    company: 'manual',
    clientEmail: 'Not specified',
    type: 'PDF',
    created: '16/9/2025'
  },
  {
    id: '68c81a58830edcdf477b7d00',
    name: 'quote_manul_20250915_135328.pdf',
    clientName: 'manul',
    company: 'manual',
    clientEmail: 'Not specified',
    type: 'PDF',
    created: '15/9/2025'
  }
];

const documentTypeOptions = [
  { label: 'PDF Quote', value: 'PDF' },
  { label: 'DOCX Quote', value: 'DOCX' },
  { label: 'HTML Quote', value: 'HTML' }
];

const cardClass = 'bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-sm';

const SendAgreementToStakeholders: React.FC = () => {
  const [showDocuments, setShowDocuments] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('PDF');
  const [managerEmail, setManagerEmail] = useState<string>('manager@company.com');
  const [ceoEmail, setCeoEmail] = useState<string>('ceo@company.com');
  const [clientEmail, setClientEmail] = useState<string>('client@gmail.com');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResults, setSendResults] = useState<Array<{ role: string; email: string; success: boolean; message?: string; messageId?: string }>>([]);
  const [sendError, setSendError] = useState<string>('');

  const selectedDocument = useMemo(() => mockDocuments.find(d => d.id === selectedDocId) || null, [selectedDocId]);

  const onSelectRow = (id: string) => {
    setSelectedDocId(id);
    const doc = mockDocuments.find(d => d.id === id);
    if (doc) {
      setDocumentType(doc.type);
      if (doc.clientEmail && /@/.test(doc.clientEmail) && doc.clientEmail !== 'Not specified') {
        setClientEmail(doc.clientEmail);
      }
    }
  };

  const sendEmail = async (to: string, subject: string, message: string) => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:3001';

    const payload = { to, subject, message } as any;
    const headers = { 'Content-Type': 'application/json' } as any;

    // Try preferred endpoint first; fall back if not available
    const endpoints = ['/api/email/send-immediate', '/api/email/send-simple'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${backendUrl}${ep}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(15000) : undefined
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            return { success: true as const, messageId: data.messageId as string | undefined };
          }
          return { success: false as const, message: data?.message || 'Unknown error' };
        }
        // If endpoint not found, try the next one
        if (res.status === 404) continue;
        let serverMessage = '';
        try {
          const errJson = await res.json();
          serverMessage = errJson?.message || JSON.stringify(errJson);
        } catch (_) {
          try {
            serverMessage = await res.text();
          } catch (_) {
            serverMessage = '';
          }
        }
        return { success: false as const, message: `${res.status} ${res.statusText}${serverMessage ? ` - ${serverMessage}` : ''}` };
      } catch (err: any) {
        // Try next endpoint on network/timeout error
        continue;
      }
    }
    return { success: false as const, message: 'No email endpoint available on backend' };
  };

  const onStartWorkflow = async () => {
    setIsSending(true);
    setSendResults([]);
    setSendError('');

    // Health pre-check to fail fast with a clear message
    try {
      const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:3001';
      const healthRes = await fetch(`${backendUrl}/api/email/health`, { method: 'GET', signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(8000) : undefined });
      if (healthRes.ok) {
        const health = await healthRes.json();
        if (!health?.success) {
          setSendError(health?.message || 'Email service not ready. Please configure SMTP and restart the server.');
          setIsSending(false);
          return;
        }
      }
    } catch (_) {
      // ignore health errors and proceed; send will surface details
    }

    const subject = `Approval required for ${documentType} ${selectedDocument?.name || ''}`.trim();
    const baseMessage = `Please review and approve the document.\n\nDocument ID: ${selectedDocument?.id || selectedDocId || 'N/A'}\nDocument Name: ${selectedDocument?.name || 'N/A'}\nType: ${documentType}`;

    const sequence: Array<{ role: string; email: string }> = [
      { role: 'Manager', email: managerEmail },
      { role: 'CEO', email: ceoEmail }
    ];

    const results: Array<{ role: string; email: string; success: boolean; message?: string; messageId?: string }> = [];

    try {
      for (const step of sequence) {
        const result = await sendEmail(step.email, subject, baseMessage);
        results.push({ role: step.role, email: step.email, success: result.success, message: result.message, messageId: result.messageId });
        setSendResults([...results]);
        if (!result.success) {
          setSendError(`Failed to send email to ${step.role} (${step.email}): ${result.message || 'Unknown error'}`);
          setIsSending(false);
          return;
        }
      }

      // Optionally notify client after approvals are initiated
      const clientResult = await sendEmail(clientEmail, 'Your document is under approval', baseMessage);
      results.push({ role: 'Client (notification)', email: clientEmail, success: clientResult.success, message: clientResult.message, messageId: clientResult.messageId });
      setSendResults([...results]);
      if (!clientResult.success) {
        setSendError(`Approvals started, but failed to notify client: ${clientResult.message || 'Unknown error'}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-slate-800">Start Approval Workflow</h1>
        </div>

        <p className="text-slate-600 mb-6">Send documents through the approval process (Manager → CEO → Client).</p>

        <div className={`${cardClass} p-5 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-800">Load Available Documents</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowDocuments(prev => !prev)}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md border border-slate-300"
            >
              {showDocuments ? (
                <>
                  <span>Hide Documents</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show Documents</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {showDocuments && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="py-2 px-3 text-left font-medium">Select</th>
                    <th className="py-2 px-3 text-left font-medium">Document ID</th>
                    <th className="py-2 px-3 text-left font-medium">Document Name</th>
                    <th className="py-2 px-3 text-left font-medium">Client Name</th>
                    <th className="py-2 px-3 text-left font-medium">Company</th>
                    <th className="py-2 px-3 text-left font-medium">Client Email</th>
                    <th className="py-2 px-3 text-left font-medium">Type</th>
                    <th className="py-2 px-3 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockDocuments.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <input
                          type="radio"
                          name="selectedDoc"
                          className="h-4 w-4 text-indigo-600"
                          checked={selectedDocId === row.id}
                          onChange={() => onSelectRow(row.id)}
                        />
                      </td>
                      <td className="py-2 px-3 text-indigo-700 underline decoration-indigo-300 underline-offset-2 cursor-default select-all">{row.id}</td>
                      <td className="py-2 px-3 text-slate-800">{row.name}</td>
                      <td className="py-2 px-3 text-slate-700">{row.clientName}</td>
                      <td className="py-2 px-3 text-slate-700">{row.company}</td>
                      <td className="py-2 px-3 text-slate-700">{row.clientEmail || 'Not specified'}</td>
                      <td className="py-2 px-3 text-slate-700">{row.type}</td>
                      <td className="py-2 px-3 text-slate-700">{row.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className={`${cardClass} p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Document Type:</label>
              <select
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
                className="w-full rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              >
                {documentTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Document ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Document ID:</label>
              <input
                type="text"
                placeholder="Enter document ID..."
                value={selectedDocument?.id || selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
                className="w-full rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
              <p className="mt-1 text-xs text-slate-500">Document ID will be auto-filled when you select a document above</p>
            </div>

            {/* Manager Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-500" /> Manager Email:</label>
              <input
                type="email"
                placeholder="manager@company.com"
                value={managerEmail}
                onChange={e => setManagerEmail(e.target.value)}
                className="w-full rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* CEO Email */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">CEO Email:</label>
              <input
                type="email"
                placeholder="ceo@company.com"
                value={ceoEmail}
                onChange={e => setCeoEmail(e.target.value)}
                className="w-full rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* Client Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /> Client Email:</label>
              <input
                type="email"
                placeholder="client@gmail.com"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                className="w-full rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
              <p className="mt-1 text-xs text-slate-500">Email where the final approved document will be sent</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={onStartWorkflow}
              disabled={isSending}
              className={`inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-md shadow-sm ${isSending ? 'bg-indigo-300 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              <FileCheck2 className="h-5 w-5" />
              {isSending ? 'Starting...' : 'Start Approval Workflow'}
            </button>

            {sendError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                {sendError}
              </div>
            )}

            {sendResults.length > 0 && !sendError && (
              <div className="mt-4 rounded-md border border-green-200 bg-green-50 text-green-800 px-4 py-3">
                <div className="font-semibold mb-1">Emails sent successfully</div>
                <ul className="list-disc pl-5 space-y-1">
                  {sendResults.map((r, idx) => (
                    <li key={idx} className="text-sm">
                      {r.role}: {r.email} {r.messageId ? `(ID: ${r.messageId})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendAgreementToStakeholders;


