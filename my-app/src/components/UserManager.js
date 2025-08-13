import React, { useEffect } from 'react';
import { useHookstate } from '@hookstate/core';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { atomicFetch } from '../utils/atomicFetch';
import { API_BASE } from '../config';
import Paper from '@mui/material/Paper';


export default function UserManager() {

    const users = useHookstate([]);
    const open = useHookstate(false);
    const editingId = useHookstate(null);
    const form = useHookstate({ name: '', email: '', gender: '', category: '' });
    const errors = useHookstate({});
    const loading = useHookstate(false);
    const snackbar = useHookstate({ open: false, message: '', severity: 'success' });

    const handleSnackbarClose = (_, reason) => {
        if (reason === 'clickaway') return;
        snackbar.set({ ...snackbar.get(), open: false });
    };


    const refreshUsers = async () => {
        try {
            loading.set(true);
            const result = await atomicFetch(`${API_BASE}/users`);

            if (!result.success) {
                throw new Error(`Load users failed: ${result.status} - ${result.statusText}`);
            }

            const list = Array.isArray(result.data) ? result.data : [];
            const unique = Array.from(new Map(list.map((u) => [u.id, u])).values());
            users.set(unique);
        } catch (e) {
            console.error('Failed to load users:', e.message);
            snackbar.set({ open: true, message: `Failed to load users: ${e.message}. Please check if the server is running.`, severity: 'error' });
            users.set([]);
        } finally {
            loading.set(false);
        }
    };

    useEffect(() => {
        refreshUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpen = (id = null) => {
        editingId.set(id);
        if (id !== null) {
            const list = users.get({ noproxy: true });
            const existing = Array.isArray(list) ? list.find((u) => u && u.id === id) : null;
            if (existing) {
                form.set({
                    name: existing.name || '',
                    email: existing.email || '',
                    gender: existing.gender || '',
                    category: existing.category || '',
                });
            }
        } else {
            form.set({ name: '', email: '', gender: '', category: '' });
        }
        errors.set({});
        open.set(true);
    };

    const handleClose = () => {
        open.set(false);
        form.set({ name: '', email: '', gender: '', category: '' });
        editingId.set(null);
        errors.set({});
    };

    const handleChange = (e) => {
        const current = form.get({ noproxy: true });
        form.set({ ...current, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors = {};


        if (!form.get().name.trim()) {
            newErrors.name = 'Name is required';
        } else if (form.get().name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (form.get().name.trim().length > 50) {
            newErrors.name = 'Name must be less than 50 characters';
        } else {
            // Validate name contains only letters, spaces, hyphens, and apostrophes
            const nameRegex = /^[a-zA-Z\s\-']+$/;
            if (!nameRegex.test(form.get().name.trim())) {
                newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
            }
        }


        if (!form.get().email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.get().email.trim())) {
                newErrors.email = 'Please enter a valid email address';
            } else if (editingId.get() === null) {
                // Only enforce uniqueness on create
                const list = users.get({ noproxy: true }) || [];
                const exists = Array.isArray(list) && list.some(u =>
                    u && typeof u.email === 'string' && u.email.toLowerCase() === form.get().email.trim().toLowerCase()
                );
                if (exists) newErrors.email = 'User with this email already exists';
            }
        }


        if (!form.get().gender) {
            newErrors.gender = 'Gender is required';
        }


        if (!form.get().category) {
            newErrors.category = 'Category is required';
        }

        errors.set(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async () => {
        if (!validate()) return;
        try {
            if (editingId.get() !== null) {

                const payload = { ...form.get() };
                const checkResult = await atomicFetch(`${API_BASE}/users?id=${editingId.get()}`);

                if (!checkResult.success) {
                    throw new Error(`Lookup failed: ${checkResult.status}`);
                }

                const found = checkResult.data;
                if (Array.isArray(found) && found.length > 0) {
                    const actualId = found[0].id;
                    const updateResult = await atomicFetch(`${API_BASE}/users/${actualId}`, {
                        method: 'PUT',
                        body: { ...found[0], ...payload, id: actualId }
                    });

                    if (!updateResult.success) {
                        throw new Error(`Update failed: ${updateResult.status}`);
                    }
                } else {
                    const createResult = await atomicFetch(`${API_BASE}/users`, {
                        method: 'POST',
                        body: payload
                    });

                    if (!createResult.success) {
                        throw new Error(`Create (upsert) failed: ${createResult.status}`);
                    }
                }
                await refreshUsers();
            } else {

                const result = await atomicFetch(`${API_BASE}/users`, {
                    method: 'POST',
                    body: form.get()
                });

                if (!result.success) {
                    throw new Error(`Create failed: ${result.status}`);
                }

                await refreshUsers();
            }
            snackbar.set({ open: true, message: 'User saved successfully.', severity: 'success' });
            handleClose();
        } catch (e) {
            console.error('Failed to save user:', e.message);
            snackbar.set({ open: true, message: `Failed to save user: ${e.message}. Please try again.`, severity: 'error' });
        }
    };


    const handleDelete = async (id) => {
        try {
            const checkResult = await atomicFetch(`${API_BASE}/users?id=${id}`);

            if (!checkResult.success) {
                throw new Error(`Lookup failed: ${checkResult.status}`);
            }

            const found = checkResult.data;
            if (Array.isArray(found) && found.length > 0) {
                const actualId = found[0].id;
                const deleteResult = await atomicFetch(`${API_BASE}/users/${actualId}`, {
                    method: 'DELETE'
                });

                if (!deleteResult.success && deleteResult.status !== 404) {
                    throw new Error(`Delete failed: ${deleteResult.status}`);
                }
            }
            await refreshUsers();
            snackbar.set({ open: true, message: 'User deleted successfully.', severity: 'success' });
        } catch (e) {
            console.error('Failed to delete user:', e.message);
            snackbar.set({ open: true, message: `Failed to delete user: ${e.message}. Please try again.`, severity: 'error' });
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                User Manager
            </Typography>

            <div style={{ marginBottom: '20px' }}>
                <Typography variant="h6" component="h2" style={{ marginBottom: '10px' }}>
                    Total Users: {users.get().length}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpen()}
                    style={{ marginBottom: '20px' }}
                >
                    Add User
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading.get() && (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading.get() && users.get().length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                    No users found. Add your first user!
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading.get() && users.get().map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.gender}</TableCell>
                                <TableCell>{user.category}</TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => handleOpen(user.id)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open.get()} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId.get() !== null ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        value={form.get().name}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.get().name}
                        helperText={errors.get().name}
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        name="email"
                        value={form.get().email}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.get().email}
                        helperText={errors.get().email}
                        style={{ marginBottom: '10px' }}
                    />
                    <FormControl fullWidth margin="dense" required error={!!errors.get().gender} style={{ marginBottom: '10px' }}>
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                            labelId="gender-label"
                            name="gender"
                            value={form.get().gender}
                            label="Gender"
                            onChange={handleChange}
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {errors.get().gender && <FormHelperText>{errors.get().gender}</FormHelperText>}
                    </FormControl>
                    <FormControl fullWidth margin="dense" required error={!!errors.get().category}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            name="category"
                            value={form.get().category}
                            label="Category"
                            onChange={handleChange}
                        >
                            <MenuItem value="Student">Student</MenuItem>
                            <MenuItem value="Employee">Employee</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {errors.get().category && <FormHelperText>{errors.get().category}</FormHelperText>}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                    >
                        {editingId.get() !== null ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.get().open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.get().severity} sx={{ width: '100%' }}>
                    {snackbar.get().message}
                </Alert>
            </Snackbar>
        </div>
    );
}
