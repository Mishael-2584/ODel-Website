'use client';

import React, { useState, useEffect } from 'react';
import { Download, Eye, Edit, Trash2, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Application {
  id: string;
  application_number: string;
  surname: string;
  first_name: string;
  email: string;
  phone_number: string;
  program_applied_for: string;
  status: string;
  current_stage: string;
  submitted_at: string;
  assigned_to_user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  pending_documents: 'bg-orange-500',
  dean_review: 'bg-purple-500',
  faculty_review: 'bg-indigo-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  on_hold: 'bg-gray-500',
};

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    current_stage: '',
    admin_notes: '',
  });

  useEffect(() => {
    fetchApplications();
  }, [filterStatus, filterType]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('application_type', filterType);
      
      const url = params.toString() 
        ? `/api/admin/applications?${params.toString()}`
        : '/api/admin/applications';
      
      const res = await fetch(url);
      const result = await res.json();
      setApplications(result.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const handleViewDetails = async (app: Application) => {
    try {
      const res = await fetch(`/api/admin/applications?id=${app.id}`);
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setSelectedApplication(result.data[0]);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  };

  const handleUpdateStatus = async (applicationId: string) => {
    if (!statusUpdate.status) {
      alert('Please select a status');
      return;
    }

    setLoading(true);
    try {
      const adminData = localStorage.getItem('admin_user');
      const adminId = adminData ? JSON.parse(adminData).id : null;

      const res = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': adminId || '',
        },
        body: JSON.stringify({
          id: applicationId,
          ...statusUpdate,
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert('Application status updated successfully');
        setShowDetails(false);
        setStatusUpdate({ status: '', current_stage: '', admin_notes: '' });
        fetchApplications();
      } else {
        alert('Error updating status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/admin/applications/pdf?id=${applicationId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application-${selectedApplication?.application_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        app.application_number.toLowerCase().includes(search) ||
        app.first_name.toLowerCase().includes(search) ||
        app.surname.toLowerCase().includes(search) ||
        app.email.toLowerCase().includes(search) ||
        app.program_applied_for.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <Clock className="text-yellow-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Student Applications</h2>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="graduate">Graduate</option>
              <option value="phd">PhD</option>
              <option value="pgda">PGDA</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="diploma">Diploma</option>
              <option value="certificate">Certificate</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="pending_documents">Pending Documents</option>
              <option value="dean_review">Dean Review</option>
              <option value="faculty_review">Faculty Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : filteredApplications.length === 0 ? (
          <p className="text-center text-gray-400">No applications found.</p>
        ) : (
          filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-white">{app.application_number}</span>
                    <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                      {(app as any).application_type?.toUpperCase() || 'APPLICATION'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${STATUS_COLORS[app.status] || 'bg-gray-500'}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {getStatusIcon(app.status)}
                  </div>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-white">{app.surname}, {app.first_name}</p>
                    <p>{app.email} | {app.phone_number}</p>
                    <p className="text-gray-400">{app.program_applied_for}</p>
                    <p className="text-gray-500 text-xs mt-1">Submitted: {formatDate(app.submitted_at)}</p>
                    {app.assigned_to_user && (
                      <p className="text-gray-500 text-xs">Assigned to: {app.assigned_to_user.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(app)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(app.id)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded text-white transition"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Application Details</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedApplication(null);
                  setStatusUpdate({ status: '', current_stage: '', admin_notes: '' });
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Application Information */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Application Number</h4>
                  <p className="text-white">{selectedApplication.application_number}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Status</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${STATUS_COLORS[selectedApplication.status] || 'bg-gray-500'}`}>
                    {selectedApplication.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="font-bold text-white mb-4">Personal Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">{(selectedApplication as any).surname}, {(selectedApplication as any).first_name} {(selectedApplication as any).middle_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Date of Birth</p>
                    <p className="text-white">{(selectedApplication as any).date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Gender</p>
                    <p className="text-white">{(selectedApplication as any).gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Nationality</p>
                    <p className="text-white">{(selectedApplication as any).nationality}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{(selectedApplication as any).email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{(selectedApplication as any).phone_number}</p>
                  </div>
                </div>
              </div>

              {/* Study Preference */}
              {selectedApplication.institution_current_or_last && (
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-bold text-white mb-4">Study Preference & Background</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {selectedApplication.institution_current_or_last && (
                      <div>
                        <p className="text-gray-400">Current/Last Institution</p>
                        <p className="text-white">{selectedApplication.institution_current_or_last}</p>
                      </div>
                    )}
                    {selectedApplication.degree_desired && (
                      <div>
                        <p className="text-gray-400">Degree Desired</p>
                        <p className="text-white">{selectedApplication.degree_desired}</p>
                      </div>
                    )}
                    {selectedApplication.degree_area && (
                      <div>
                        <p className="text-gray-400">Area/Field</p>
                        <p className="text-white">{selectedApplication.degree_area}</p>
                      </div>
                    )}
                    {selectedApplication.campus_preference && (
                      <div>
                        <p className="text-gray-400">Campus Preference</p>
                        <p className="text-white">{selectedApplication.campus_preference}</p>
                      </div>
                    )}
                    {selectedApplication.accommodation_plan && (
                      <div>
                        <p className="text-gray-400">Accommodation</p>
                        <p className="text-white">{selectedApplication.accommodation_plan}</p>
                        {selectedApplication.accommodation_details && (
                          <p className="text-white text-xs mt-1">{selectedApplication.accommodation_details}</p>
                        )}
                      </div>
                    )}
                    {selectedApplication.financing_method && (
                      <div>
                        <p className="text-gray-400">Financing</p>
                        <p className="text-white">{selectedApplication.financing_method}</p>
                        {selectedApplication.financing_details && (
                          <p className="text-white text-xs mt-1">{selectedApplication.financing_details}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Educational Background */}
              {selectedApplication.educational_background && Array.isArray(selectedApplication.educational_background) && selectedApplication.educational_background.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-bold text-white mb-4">Educational Background</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-300">Institution</th>
                          <th className="px-3 py-2 text-left text-gray-300">Country</th>
                          <th className="px-3 py-2 text-left text-gray-300">From</th>
                          <th className="px-3 py-2 text-left text-gray-300">To</th>
                          <th className="px-3 py-2 text-left text-gray-300">Degree/Classification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApplication.educational_background.map((edu: any, idx: number) => (
                          <tr key={idx} className="border-t border-slate-700">
                            <td className="px-3 py-2 text-white">{edu.institution}</td>
                            <td className="px-3 py-2 text-white">{edu.country}</td>
                            <td className="px-3 py-2 text-white">{edu.from_month} {edu.from_year}</td>
                            <td className="px-3 py-2 text-white">{edu.to_month} {edu.to_year}</td>
                            <td className="px-3 py-2 text-white">{edu.degree} {edu.classification && `(${edu.classification})`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Employment Record */}
              {selectedApplication.employment_record && Array.isArray(selectedApplication.employment_record) && selectedApplication.employment_record.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-bold text-white mb-4">Employment Record</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-300">From</th>
                          <th className="px-3 py-2 text-left text-gray-300">To</th>
                          <th className="px-3 py-2 text-left text-gray-300">Employer</th>
                          <th className="px-3 py-2 text-left text-gray-300">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApplication.employment_record.map((emp: any, idx: number) => (
                          <tr key={idx} className="border-t border-slate-700">
                            <td className="px-3 py-2 text-white">{emp.from_month} {emp.from_year}</td>
                            <td className="px-3 py-2 text-white">{emp.to_month} {emp.to_year}</td>
                            <td className="px-3 py-2 text-white">{emp.employer}</td>
                            <td className="px-3 py-2 text-white">{emp.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Career Objectives */}
              {selectedApplication.career_objectives && (
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-bold text-white mb-4">Career/Professional Objectives</h4>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-white text-sm whitespace-pre-wrap">{selectedApplication.career_objectives}</p>
                  </div>
                </div>
              )}

              {/* Supporting Documents Checklist */}
              {selectedApplication.supporting_documents_checklist && Array.isArray(selectedApplication.supporting_documents_checklist) && selectedApplication.supporting_documents_checklist.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-bold text-white mb-4">Supporting Documents Checklist</h4>
                  <div className="space-y-2">
                    {selectedApplication.supporting_documents_checklist.map((doc: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-white">{doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Program Information */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="font-bold text-white mb-4">Program Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Program</p>
                    <p className="text-white">{(selectedApplication as any).program_applied_for}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Mode of Study</p>
                    <p className="text-white">{(selectedApplication as any).mode_of_study}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Specialization</p>
                    <p className="text-white">{(selectedApplication as any).specialization || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="font-bold text-white mb-4">Update Status</h4>
                <div className="space-y-4">
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select New Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="pending_documents">Pending Documents</option>
                    <option value="dean_review">Dean Review</option>
                    <option value="faculty_review">Faculty Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="on_hold">On Hold</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Current Stage (e.g., 'With Admissions Office')"
                    value={statusUpdate.current_stage}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, current_stage: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />

                  <textarea
                    placeholder="Admin Notes"
                    value={statusUpdate.admin_notes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, admin_notes: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />

                  <button
                    onClick={() => handleUpdateStatus(selectedApplication.id)}
                    disabled={loading || !statusUpdate.status}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-700 pt-4 flex gap-4">
                <button
                  onClick={() => handleDownloadPDF(selectedApplication.id)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedApplication(null);
                  }}
                  className="px-6 py-2 border border-slate-600 text-gray-300 hover:bg-slate-700 rounded transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

