
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Userdata() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [editData, setEditData] = useState({
    name: '',
    email: '',
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/users');

      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Fetch users error:', err.response?.data || err.message);

      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      setError(
        err.response?.data?.message || 'Unable to fetch users.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add user through the registration endpoint
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setMessage('User added successfully.');
      setFormData({ name: '', email: '', password: '' });
      setShowAddForm(false);

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to add user.'
      );
    }
  };

  // Start editing a user
  const startEdit = (user) => {
    setEditingId(user._id);
    setEditData({
      name: user.name || '',
      email: user.email || '',
    });
    setError('');
    setMessage('');
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!editData.name.trim() || !editData.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await api.put(`/users/${editingId}`, {
        name: editData.name.trim(),
        email: editData.email.trim(),
      });

      setMessage('User updated successfully.');
      setEditingId(null);

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to update user.'
      );
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this user?'
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/users/${id}`);

      setMessage('User deleted successfully.');
      setUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete user.'
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">
              CRM Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Manage your user records
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-300 px-5 py-2 font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-100 p-3 text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-4 rounded-lg bg-green-100 p-3 text-green-700"
          >
            {message}
          </div>
        )}

        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                User Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Total users: {users.length}
              </p>
            </div>

            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setError('');
                setMessage('');
              }}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              {showAddForm ? 'Cancel' : '+ Add User'}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddUser}
              className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"
            >
              <h3 className="font-semibold sm:col-span-2">
                Add New User
              </h3>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                autoComplete="name"
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
              />

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                autoComplete="email"
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
              />

              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (minimum 6 characters)"
                autoComplete="new-password"
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 sm:col-span-2"
              />

              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 sm:col-span-2"
              >
                Save User
              </button>
            </form>
          )}

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-slate-500">
              No user records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      {editingId === user._id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              value={editData.name}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded border border-slate-300 px-2 py-2"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  email: e.target.value,
                                })
                              }
                              className="w-full rounded border border-slate-300 px-2 py-2"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <form onSubmit={handleUpdate} className="flex gap-2">
                              <button
                                type="submit"
                                className="font-medium text-green-700 hover:underline"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="font-medium text-slate-500 hover:underline"
                              >
                                Cancel
                              </button>
                            </form>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-4 font-medium text-slate-800">
                            {user.name}
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {user.email}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => startEdit(user)}
                                className="font-medium text-indigo-600 hover:underline"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(user._id)}
                                className="font-medium text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Userdata;
