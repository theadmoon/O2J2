import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatApiError } from '../utils/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowRight, Upload } from 'lucide-react';

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('custom_video');
  const [brief, setBrief] = useState('');
  const [script, setScript] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('service_type', serviceType);
      formData.append('brief', brief);
      if (script) formData.append('script', script);

      const { data } = await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/projects/${data.id}`);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-8 pb-16 px-6 max-w-2xl mx-auto" data-testid="new-project-page">
        <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-2">New Project</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit Your Project</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6" data-testid="new-project-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-sm" data-testid="new-project-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Your Name</Label>
              <Input disabled value={user?.name || ''} className="mt-1.5 bg-gray-50" data-testid="new-project-name" />
            </div>
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Email</Label>
              <Input disabled value={user?.email || ''} className="mt-1.5 bg-gray-50" data-testid="new-project-email" />
            </div>
          </div>

          <div>
            <Label className="text-gray-600 text-xs uppercase tracking-wider">Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="mt-1.5" data-testid="new-project-service-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom_video">Custom Video Production</SelectItem>
                <SelectItem value="video_editing">Video Editing</SelectItem>
                <SelectItem value="ai_video">AI-Generated Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-600 text-xs uppercase tracking-wider">Project Brief</Label>
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              rows={5}
              className="mt-1.5 resize-none"
              placeholder="Describe your project requirements, goals, timeline..."
              data-testid="new-project-brief"
            />
          </div>

          <div>
            <Label className="text-gray-600 text-xs uppercase tracking-wider">Script / Reference File (optional)</Label>
            <div className="mt-1.5 border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg p-6 text-center hover:border-sky-300 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setScript(e.target.files[0])}
                className="hidden"
                id="script-upload"
                data-testid="new-project-script-input"
              />
              <label htmlFor="script-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{script ? script.name : 'Click to upload PDF, DOC, DOCX'}</p>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white h-11 rounded-lg flex items-center justify-center gap-2" data-testid="new-project-submit">
            {loading ? 'Submitting...' : <>Submit Project Request <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
