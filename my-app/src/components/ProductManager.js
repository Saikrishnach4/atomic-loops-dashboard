import React, { useEffect, useMemo, useState } from 'react';
import { useHookstate } from '@hookstate/core';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
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
const today = new Date().toISOString().split("T")[0];

export default function ProductManager() {

    const products = useHookstate([]);
    const [allUsers, setAllUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', description: '', category: '', quantity: '', sales: [] });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [saleDraft, setSaleDraft] = useState({ userId: '', quantity: '', date: new Date().toISOString().slice(0, 10) });

    const handleSnackbarClose = (_, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };


    const refreshProducts = async () => {
        try {
            setLoading(true);
            const result = await atomicFetch(`${API_BASE}/products`);

            if (!result.success) {
                throw new Error(`Load products failed: ${result.status} - ${result.statusText}`);
            }

            const list = Array.isArray(result.data) ? result.data : [];
            const unique = Array.from(new Map(list.map((p) => [p.id, p])).values());
            products.set(unique);
        } catch (e) {
            console.error('Failed to load products:', e.message);
            setSnackbar({ open: true, message: `Failed to load products: ${e.message}. Please check if the server is running.`, severity: 'error' });
            products.set([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshProducts();
        // Load users for sales association
        (async () => {
            const result = await atomicFetch(`${API_BASE}/users`);
            if (result.success && Array.isArray(result.data)) setAllUsers(result.data);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleOpen = (id = null) => {
        setEditingId(id);
        if (id !== null) {
            const existing = products.get().find((p) => p && p.id === id);
            if (existing) {
                setForm({
                    name: existing.name || '',
                    price: existing.price ?? '',
                    description: existing.description || '',
                    category: existing.category || '',
                    quantity: existing.quantity ?? '',
                    sales: Array.isArray(existing.sales) ? existing.sales : []
                });
            }
        } else {
            setForm({ name: '', price: '', description: '', category: '', quantity: '', sales: [] });
        }
        setErrors({});
        setOpen(true);
    };


    const handleClose = () => {
        setOpen(false);
        setForm({ name: '', price: '', description: '', category: '', quantity: '', sales: [] });
        setEditingId(null);
        setErrors({});
    };


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const validate = () => {
        const newErrors = {};


        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (form.name.trim().length > 100) {
            newErrors.name = 'Name must be less than 100 characters';
        }


        if (!form.price || form.price === '') {
            newErrors.price = 'Price is required';
        } else if (isNaN(form.price) || Number(form.price) <= 0) {
            newErrors.price = 'Price must be a positive number';
        } else if (Number(form.price) > 999999) {
            newErrors.price = 'Price must be less than 1,000,000';
        }


        if (!form.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (form.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        } else if (form.description.trim().length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }


        if (!form.category) {
            newErrors.category = 'Category is required';
        }

        if (form.quantity === '' || isNaN(form.quantity)) {
            newErrors.quantity = 'Quantity is required';
        } else if (Number(form.quantity) < 0) {
            newErrors.quantity = 'Quantity must be 0 or greater';
        } else if (!Number.isInteger(Number(form.quantity))) {
            newErrors.quantity = 'Quantity must be an integer';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async () => {
        if (!validate()) return;
        try {
            if (editingId !== null) {

                const payload = {
                    name: form.name,
                    price: Number(form.price),
                    description: form.description,
                    category: form.category,
                    quantity: Number(form.quantity),
                    sales: Array.isArray(form.sales) ? form.sales : []
                };

                const checkResult = await atomicFetch(`${API_BASE}/products?id=${editingId}`);

                if (!checkResult.success) {
                    throw new Error(`Lookup failed: ${checkResult.status}`);
                }

                const found = checkResult.data;
                if (Array.isArray(found) && found.length > 0) {
                    const actualId = found[0].id;
                    const updateResult = await atomicFetch(`${API_BASE}/products/${actualId}`, {
                        method: 'PUT',
                        body: { ...found[0], ...payload, id: actualId }
                    });

                    if (!updateResult.success) {
                        throw new Error(`Update failed: ${updateResult.status}`);
                    }
                } else {
                    const createResult = await atomicFetch(`${API_BASE}/products`, {
                        method: 'POST',
                        body: payload
                    });

                    if (!createResult.success) {
                        throw new Error(`Create (upsert) failed: ${createResult.status}`);
                    }
                }
                await refreshProducts();
            } else {

                const payload = {
                    name: form.name,
                    price: Number(form.price),
                    description: form.description,
                    category: form.category,
                    quantity: Number(form.quantity),
                    sales: Array.isArray(form.sales) ? form.sales : []
                };

                const result = await atomicFetch(`${API_BASE}/products`, {
                    method: 'POST',
                    body: payload
                });

                if (!result.success) {
                    throw new Error(`Create failed: ${result.status}`);
                }

                await refreshProducts();
            }
            setSnackbar({ open: true, message: 'Product saved successfully.', severity: 'success' });
            handleClose();
        } catch (e) {
            console.error('Failed to save product:', e.message);
            setSnackbar({ open: true, message: `Failed to save product: ${e.message}. Please try again.`, severity: 'error' });
        }
    };


    const handleDelete = async (id) => {
        try {
            const checkResult = await atomicFetch(`${API_BASE}/products?id=${id}`);

            if (!checkResult.success) {
                throw new Error(`Lookup failed: ${checkResult.status}`);
            }

            const found = checkResult.data;
            if (Array.isArray(found) && found.length > 0) {
                const actualId = found[0].id;
                const deleteResult = await atomicFetch(`${API_BASE}/products/${actualId}`, {
                    method: 'DELETE'
                });

                if (!deleteResult.success && deleteResult.status !== 404) {
                    throw new Error(`Delete failed: ${deleteResult.status}`);
                }
            }
            await refreshProducts();
            setSnackbar({ open: true, message: 'Product deleted successfully.', severity: 'success' });
        } catch (e) {
            console.error('Failed to delete product:', e.message);
            setSnackbar({ open: true, message: `Failed to delete product: ${e.message}. Please try again.`, severity: 'error' });
        }
    };

    const resolveUserName = (userId) => {
        const u = allUsers.find((x) => x.id === userId);
        return u ? u.name : userId;
    };

    const handleAddSale = () => {
        const errorsLocal = {};
        if (!saleDraft.userId) errorsLocal.userId = 'User required';
        if (saleDraft.quantity === '' || Number(saleDraft.quantity) <= 0) errorsLocal.quantity = 'Quantity must be > 0';
        if (!saleDraft.date) errorsLocal.date = 'Date required';
        // Stock validation
        const qty = Number(saleDraft.quantity || 0);
        if (qty > remainingStock) {
            setSnackbar({ open: true, message: `Quantity exceeds available stock. Remaining: ${remainingStock}`, severity: 'error' });
            return;
        }
        if (Object.keys(errorsLocal).length > 0) {
            setSnackbar({ open: true, message: 'Please fix sale entry fields.', severity: 'error' });
            return;
        }
        const entry = {
            userId: saleDraft.userId,
            quantity: Number(saleDraft.quantity),
            date: saleDraft.date,
            id: `${saleDraft.userId}-${saleDraft.date}-${Date.now()}`
        };
        setForm((prev) => ({ ...prev, sales: [...prev.sales, entry] }));
        setSaleDraft({ userId: '', quantity: '', date: new Date().toISOString().slice(0, 10) });
    };

    const handleRemoveSale = (id) => {
        setForm((prev) => ({ ...prev, sales: prev.sales.filter((s) => s.id !== id) }));
    };

    const totalSold = useMemo(() => (Array.isArray(form.sales) ? form.sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0) : 0), [form.sales]);
    const remainingStock = useMemo(() => Math.max(0, Number(form.quantity || 0) - totalSold), [form.quantity, totalSold]);

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Product Manager
            </Typography>

            <div style={{ marginBottom: '20px' }}>
                <Typography variant="h6" component="h2" style={{ marginBottom: '10px' }}>
                    Total Products: {products.get().length}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpen()}
                    style={{ marginBottom: '20px' }}
                >
                    Add Product
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Total Sold</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                    Loading products...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && products.get().length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                    No products found. Add your first product!
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && products.get().map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>${product.price}</TableCell>
                                <TableCell>{product.quantity ?? 0}</TableCell>
                                <TableCell>{Array.isArray(product.sales) ? product.sales.reduce((a, b) => a + Number(b.quantity || 0), 0) : 0}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => handleOpen(product.id)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingId !== null ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.price}
                        helperText={errors.price}
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        required
                        error={!!errors.description}
                        helperText={errors.description}
                        style={{ marginBottom: '10px' }}
                    />
                    <FormControl fullWidth margin="dense" required error={!!errors.category}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            name="category"
                            value={form.category}
                            label="Category"
                            onChange={handleChange}
                        >
                            <MenuItem value="Electronics">Electronics</MenuItem>
                            <MenuItem value="Clothing">Clothing</MenuItem>
                            <MenuItem value="Books">Books</MenuItem>
                            <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                            <MenuItem value="Sports">Sports</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                    </FormControl>

                    <Typography variant="subtitle1" sx={{ mt: 1 }}>Sales</Typography>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="sale-user-label">User</InputLabel>
                            <Select
                                labelId="sale-user-label"
                                value={saleDraft.userId}
                                label="User"
                                onChange={(e) => setSaleDraft((prev) => ({ ...prev, userId: e.target.value }))}
                            >
                                {allUsers.map((u) => (
                                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Qty"
                            type="number"
                            size="small"
                            value={saleDraft.quantity}
                            onChange={(e) => setSaleDraft((prev) => ({ ...prev, quantity: e.target.value }))}
                            style={{ width: 100 }}
                        />
                        <TextField
                            label="Date"
                            type="date"
                            size="small"
                            value={saleDraft.date}
                            onChange={(e) => setSaleDraft((prev) => ({ ...prev, date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: today }}
                        />
                        <Button onClick={handleAddSale} variant="outlined" size="small">Add</Button>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>Total sold: {totalSold} / Remaining: {remainingStock}</Typography>
                    </div>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(form.sales) && form.sales.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{resolveUserName(s.userId)}</TableCell>
                                        <TableCell>{s.quantity}</TableCell>
                                        <TableCell>{s.date}</TableCell>
                                        <TableCell>
                                            <Button size="small" color="error" onClick={() => handleRemoveSale(s.id)}>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
                        {editingId !== null ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
