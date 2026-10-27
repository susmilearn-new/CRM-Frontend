
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/me');
                const profile = response.data.user;

                setUser(profile);
                setFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                });
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login', { replace: true });
                } else {
                    setError(
                        err.response?.data?.message || 'Unable to load your profile.'
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!formData.name.trim() || !formData.email.trim()) {
            setError('Name and email are required.');
            return;
        }

        try {
            setSaving(true);

            const response = await api.put('/users/me', {
                name: formData.name.trim(),
                email: formData.email.trim(),
            });

            const updatedUser = response.data.user;

            setUser(updatedUser);
            setFormData({
                name: updatedUser.name,
                email: updatedUser.email,
            });
            setMessage('Profile updated successfully.');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Unable to update your profile.'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="p-8 text-center">Loading profile...</p>;
    }

    if (!user) {
        return (
            <div className="p-8 text-center">
                <p>{error || 'Profile could not be loaded.'}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow-sm">
                <button
                    onClick={() => navigate('/userdata')}
                    className="mb-5 text-sm font-medium text-indigo-600 hover:underline"
                >
                    ← Back to Dashboard
                </button>

                <h1 className="mb-2 text-2xl font-bold text-indigo-700">
                    My Profile
                </h1>
                <p className="mb-6 text-slate-500">
                    View and update your own account details.
                </p>

                {error && (
                    <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                        {error}
                    </p>
                )}

                {message && (
                    <p role="status" className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block font-medium">
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-1 block font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;
