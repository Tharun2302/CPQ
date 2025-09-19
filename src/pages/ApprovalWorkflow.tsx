import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Clock, History, Inbox, Eye, XCircle } from 'lucide-react';

interface ApprovalItem {
  id: string;
  name: string;
  client: string;
  type: 'PDF' | 'DOCX' | 'HTML';
  managerStatus: 'pending' | 'approved' | 'denied';
  managerComments?: string;
  ceoStatus: 'pending' | 'approved' | 'denied';
  ceoComments?: string;
  clientStatus: 'pending' | 'approved' | 'denied';
  clientComments?: string;
  createdAt: string;
}

const statusBadge = (status: 'pending' | 'approved' | 'denied') => {
  const base = 'px-3 py-1 rounded-full text-xs font-medium';
  if (status === 'approved') return <span className={`${base} bg-green-100 text-green-800`}>approved</span>;
  if (status === 'denied') return <span className={`${base} bg-red-100 text-red-700`}>denied</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-700`}>pending</span>;
};

const cardClass = 'bg-white rounded-2xl shadow-2xl border border-slate-200/50';

const ApprovalWorkflow: React.FC = () => {
  const [items, setItems] = useState<ApprovalItem[]>([]);

  const [view, setView] = useState<'pending' | 'workflow' | 'denied' | 'history'>('pending');
  const [sectionTitle, setSectionTitle] = useState<string>('Pending Approvals');

  const loadItems = () => {
    try {
      const raw = localStorage.getItem('approval_workflows');
      if (!raw) {
        setItems([]);
        return;
      }
      const parsed = JSON.parse(raw) as ApprovalItem[];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch (_) {
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filtered = useMemo(() => {
    switch (view) {
      case 'pending':
        return items.filter(i => i.managerStatus === 'pending' || i.ceoStatus === 'pending' || i.clientStatus === 'pending');
      case 'workflow':
        return items;
      case 'denied':
        return items.filter(i => i.managerStatus === 'denied' || i.ceoStatus === 'denied' || i.clientStatus === 'denied');
      case 'history':
        return items.filter(i => i.managerStatus === 'approved' && i.ceoStatus === 'approved' && i.clientStatus === 'approved');
      default:
        return items;
    }
  }, [items, view]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">Approval Dashboard</h1>
          <p className="text-gray-600">Manage document approvals and workflow status</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => { setView('pending'); setSectionTitle('Pending Approvals'); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm hover:shadow-md ${sectionTitle === 'Pending Approvals' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'}`}
          >
            <Inbox className="w-4 h-4 text-indigo-600" /> Pending Approvals
          </button>
          <button
            onClick={() => { setView('workflow'); setSectionTitle('Workflow Status'); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm hover:shadow-md ${sectionTitle === 'Workflow Status' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'}`}
          >
            <Clock className="w-4 h-4 text-indigo-600" /> Workflow Status
          </button>
          <button
            onClick={() => { setView('history'); setSectionTitle('Approval History'); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm hover:shadow-md ${sectionTitle === 'Approval History' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'}`}
          >
            <History className="w-4 h-4 text-indigo-600" /> Approval History
          </button>
          <button
            onClick={() => { setView('denied'); setSectionTitle('Denied Requests'); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm hover:shadow-md ${sectionTitle === 'Denied Requests' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'}`}
          >
            <XCircle className="w-4 h-4 text-indigo-600" /> Denied Requests
          </button>
          <button onClick={loadItems} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:shadow-md">
            <RefreshCw className="w-4 h-4" /> Refresh Dashboard
          </button>
        </div>

        <div className={`${cardClass} p-0 overflow-hidden`}>
          <div className="px-6 py-4 bg-indigo-600 text-white font-semibold">
            {sectionTitle}
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 text-left font-medium">Document</th>
                  <th className="py-3 px-4 text-left font-medium">Client</th>
                  <th className="py-3 px-4 text-left font-medium">Type</th>
                  <th className="py-3 px-4 text-left font-medium">Manager Status</th>
                  <th className="py-3 px-4 text-left font-medium">Manager Comments</th>
                  <th className="py-3 px-4 text-left font-medium">CEO Status</th>
                  <th className="py-3 px-4 text-left font-medium">CEO Comments</th>
                  <th className="py-3 px-4 text-left font-medium">Client Status</th>
                  <th className="py-3 px-4 text-left font-medium">Client Comments</th>
                  <th className="py-3 px-4 text-left font-medium">Created</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-6 px-4 text-slate-500 italic" colSpan={11}>No records found</td>
                  </tr>
                )}
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-indigo-700">{row.name}</td>
                    <td className="py-3 px-4 text-slate-700">{row.client}</td>
                    <td className="py-3 px-4 text-slate-700">{row.type}</td>
                    <td className="py-3 px-4">{statusBadge(row.managerStatus)}</td>
                    <td className="py-3 px-4 text-slate-500 italic">{row.managerComments || 'No comments'}</td>
                    <td className="py-3 px-4">{statusBadge(row.ceoStatus)}</td>
                    <td className="py-3 px-4 text-slate-500 italic">{row.ceoComments || 'No comments'}</td>
                    <td className="py-3 px-4">{statusBadge(row.clientStatus)}</td>
                    <td className="py-3 px-4 text-slate-500 italic">{row.clientComments || 'No comments'}</td>
                    <td className="py-3 px-4 text-slate-700">{row.createdAt}</td>
                    <td className="py-3 px-4">
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow">
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
