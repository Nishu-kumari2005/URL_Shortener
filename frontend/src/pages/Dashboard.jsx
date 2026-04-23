import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndUrls();
  }, []);

  const fetchUserAndUrls = async () => {
    try {
      const userRes = await axios.get('/api/me');
      setUser(userRes.data.user);

      const urlsRes = await axios.get('/api/urls');
      setUrls(urlsRes.data.urls);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      await axios.post('/url', { url: newUrl });
      setNewUrl('');
      fetchUserAndUrls(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
    }
  };

  const handleCopy = (shortId) => {
    const fullUrl = `http://localhost:8001/url/${shortId}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  }

  return (
    <div className="container">
      <header className="dashboard-header">
        <div>
          <h1 className="title" style={{ textAlign: 'left' }}>URL Shortener</h1>
          <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
            Welcome back, {user?.name || 'User'}
          </p>
        </div>
        <div className="nav-links">
          <button 
            className="btn" 
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => {
              // In a real app we'd clear the cookie, but for now just redirect
              document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-msg">{error}</div>}

      <form className="shortener-section" onSubmit={handleShorten}>
        <input
          type="url"
          className="form-input glass-panel"
          placeholder="Enter a long URL to shorten (e.g. https://example.com/very/long/path)"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary glass-panel">
          Shorten URL
        </button>
      </form>

      <div className="table-container glass-panel">
        <table>
          <thead>
            <tr>
              <th>Short URL</th>
              <th>Original URL</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {urls.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '3rem' }}>
                  No URLs generated yet.
                </td>
              </tr>
            ) : (
              urls.map((url, i) => (
                <tr key={url._id} className="animated-row" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td>
                    <a href={`http://localhost:8001/url/${url.shortId}`} target="_blank" rel="noopener noreferrer" className="link">
                      {url.shortId}
                    </a>
                    <button className="copy-btn" onClick={() => handleCopy(url.shortId)}>Copy</button>
                  </td>
                  <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {url.redirectURL}
                  </td>
                  <td>{url.visitHistory?.length || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
