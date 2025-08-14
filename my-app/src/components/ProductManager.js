import React, { useEffect, useMemo } from 'react';
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
    const allUsers = useHookstate([]);
    const open = useHookstate(false);
    const editingId = useHookstate(null);
    const form = useHookstate({ name: '', price: '', description: '', category: '', quantity: '', sales: [] });
    const errors = useHookstate({});
    const loading = useHookstate(false);
    const snackbar = useHookstate({ open: false, message: '', severity: 'success' });
    const saleDraft = useHookstate({ userId: '', quantity: '', date: new Date().toISOString().slice(0, 10) });

    const handleSnackbarClose = (_, reason) => {
        if (reason === 'clickaway') return;
        snackbar.set({ ...snackbar.get(), open: false });
    };


    const refreshProducts = async () => {
        try {
            loading.set(true);
            const result = await atomicFetch(`${API_BASE}/products`);

            if (!result.success) {
                throw new Error(`Load products failed: ${result.status} - ${result.statusText}`);
            }

            const list = Array.isArray(result.data) ? result.data : [];
            const unique = Array.from(new Map(list.map((p) => [p.id, p])).values());
            const sorted = [...unique].sort((a, b) => {
                const aTime = a && a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b && b.createdAt ? new Date(b.createdAt).getTime() : 0;
                if (aTime !== bTime) return bTime - aTime;
                const aId = String(a?.id ?? '');
                const bId = String(b?.id ?? '');
                return bId.localeCompare(aId);
            });
            products.set(sorted);
        } catch (e) {
            console.error('Failed to load products:', e.message);
            snackbar.set({ open: true, message: `Failed to load products: ${e.message}. Please check if the server is running.`, severity: 'error' });
            products.set([]);
        } finally {
            loading.set(false);
        }
    };

    useEffect(() => {
        refreshProducts();
        // Load users for sales association
        (async () => {
            const result = await atomicFetch(`${API_BASE}/users`);
            if (result.success && Array.isArray(result.data)) allUsers.set(result.data);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleOpen = (id = null) => {
        editingId.set(id);
        if (id !== null) {
            const list = products.get({ noproxy: true });
            const existing = Array.isArray(list) ? list.find((p) => p && p.id === id) : null;
            if (existing) {
                form.set({
                    name: existing.name || '',
                    price: existing.price ?? '',
                    description: existing.description || '',
                    category: existing.category || '',
                    quantity: existing.quantity ?? '',
                    sales: Array.isArray(existing.sales) ? existing.sales.map((s) => ({ ...s })) : []
                });
            }
        } else {
            form.set({ name: '', price: '', description: '', category: '', quantity: '', sales: [] });
        }
        errors.set({});
        open.set(true);
    };


    const handleClose = () => {
        open.set(false);
        form.set({ name: '', price: '', description: '', category: '', quantity: '', sales: [] });
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
        } else if (form.get().name.trim().length > 100) {
            newErrors.name = 'Name must be less than 100 characters';
        } else {

            const nameRegex = /^[a-zA-Z0-9\s\-']+$/;
            if (!nameRegex.test(form.get().name.trim())) {
                newErrors.name = 'Product name can only contain letters, numbers, spaces, hyphens, and apostrophes';
            }
        }


        if (!form.get().price || form.get().price === '') {
            newErrors.price = 'Price is required';
        } else if (isNaN(form.get().price) || Number(form.get().price) <= 0) {
            newErrors.price = 'Price must be a positive number';
        } else if (Number(form.get().price) > 999999) {
            newErrors.price = 'Price must be less than 1,000,000';
        }


        if (!form.get().description.trim()) {
            newErrors.description = 'Description is required';
        } else if (form.get().description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        } else if (form.get().description.trim().length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }


        if (!form.get().category) {
            newErrors.category = 'Category is required';
        }

        if (form.get().quantity === '' || isNaN(form.get().quantity)) {
            newErrors.quantity = 'Quantity is required';
        } else if (Number(form.get().quantity) < 0) {
            newErrors.quantity = 'Quantity must be 0 or greater';
        } else if (!Number.isInteger(Number(form.get().quantity))) {
            newErrors.quantity = 'Quantity must be an integer';
        }

        errors.set(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async () => {
        if (!validate()) return;
        try {
            if (editingId.get() !== null) {

                const payload = {
                    name: form.get().name,
                    price: Number(form.get().price),
                    description: form.get().description,
                    category: form.get().category,
                    quantity: Number(form.get().quantity),
                    sales: Array.isArray(form.get().sales) ? form.get().sales : []
                };

                const checkResult = await atomicFetch(`${API_BASE}/products?id=${editingId.get()}`);

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
                        body: { ...payload, createdAt: new Date().toISOString() }
                    });

                    if (!createResult.success) {
                        throw new Error(`Create (upsert) failed: ${createResult.status}`);
                    }
                }
                await refreshProducts();
            } else {

                const payload = {
                    name: form.get().name,
                    price: Number(form.get().price),
                    description: form.get().description,
                    category: form.get().category,
                    quantity: Number(form.get().quantity),
                    sales: Array.isArray(form.get().sales) ? form.get().sales : []
                };

                const result = await atomicFetch(`${API_BASE}/products`, {
                    method: 'POST',
                    body: { ...payload, createdAt: new Date().toISOString() }
                });

                if (!result.success) {
                    throw new Error(`Create failed: ${result.status}`);
                }

                await refreshProducts();
            }
            snackbar.set({ open: true, message: 'Product saved successfully.', severity: 'success' });
            handleClose();
        } catch (e) {
            console.error('Failed to save product:', e.message);
            snackbar.set({ open: true, message: `Failed to save product: ${e.message}. Please try again.`, severity: 'error' });
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
            snackbar.set({ open: true, message: 'Product deleted successfully.', severity: 'success' });
        } catch (e) {
            console.error('Failed to delete product:', e.message);
            snackbar.set({ open: true, message: `Failed to delete product: ${e.message}. Please try again.`, severity: 'error' });
        }
    };

    const resolveUserName = (userId) => {
        const u = allUsers.get().find((x) => x.id === userId);
        return u ? u.name : userId;
    };

    const handleAddSale = () => {
        const errorsLocal = {};
        if (!saleDraft.get().userId) errorsLocal.userId = 'User required';
        if (saleDraft.get().quantity === '' || Number(saleDraft.get().quantity) <= 0) errorsLocal.quantity = 'Quantity must be > 0';
        if (!saleDraft.get().date) errorsLocal.date = 'Date required';
        // Stock validation
        const qty = Number(saleDraft.get().quantity || 0);
        if (qty > remainingStock) {
            snackbar.set({ open: true, message: `Quantity exceeds available stock. Remaining: ${remainingStock}`, severity: 'error' });
            return;
        }
        if (Object.keys(errorsLocal).length > 0) {
            snackbar.set({ open: true, message: 'Please fix sale entry fields.', severity: 'error' });
            return;
        }
        const entry = {
            userId: saleDraft.get().userId,
            quantity: Number(saleDraft.get().quantity),
            date: saleDraft.get().date,
            id: `${saleDraft.get().userId}-${saleDraft.get().date}-${Date.now()}`
        };
        const currentForm = form.get({ noproxy: true });
        const currentSales = Array.isArray(currentForm.sales) ? currentForm.sales : [];
        form.set({ ...currentForm, sales: [...currentSales, entry] });
        saleDraft.set({ userId: '', quantity: '', date: new Date().toISOString().slice(0, 10) });
    };

    const handleRemoveSale = (id) => {
        const currentForm = form.get({ noproxy: true });
        const nextSales = (Array.isArray(currentForm.sales) ? currentForm.sales : []).filter((s) => s.id !== id);
        form.set({ ...currentForm, sales: nextSales });
    };

    const formSnapshot = form.get({ noproxy: true });
    const totalSold = useMemo(() => (Array.isArray(formSnapshot.sales) ? formSnapshot.sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0) : 0), [formSnapshot.sales]);
    const remainingStock = useMemo(() => Math.max(0, Number(formSnapshot.quantity || 0) - totalSold), [formSnapshot.quantity, totalSold]);

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
                        {loading.get() && (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                    Loading products...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading.get() && products.get().length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                    No products found. Add your first product!
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading.get() && products.get().map((product) => (
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

            <Dialog open={open.get()} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingId.get() !== null ? 'Edit Product' : 'Add New Product'}
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
                        label="Price"
                        name="price"
                        type="number"
                        value={form.get().price}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.get().price}
                        helperText={errors.get().price}
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={form.get().quantity}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.get().quantity}
                        helperText={errors.get().quantity}
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        value={form.get().description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        required
                        error={!!errors.get().description}
                        helperText={errors.get().description}
                        style={{ marginBottom: '10px' }}
                    />
                    <FormControl fullWidth margin="dense" required error={!!errors.get().category}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            name="category"
                            value={form.get().category}
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
                        {errors.get().category && <FormHelperText>{errors.get().category}</FormHelperText>}
                    </FormControl>

                    <Typography variant="subtitle1" sx={{ mt: 1 }}>Sales</Typography>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="sale-user-label">User</InputLabel>
                            <Select
                                labelId="sale-user-label"
                                value={saleDraft.get().userId}
                                label="User"
                                onChange={(e) => saleDraft.set({ ...saleDraft.get(), userId: e.target.value })}
                            >
                                {allUsers.get().map((u) => (
                                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Qty"
                            type="number"
                            size="small"
                            value={saleDraft.get().quantity}
                            onChange={(e) => saleDraft.set({ ...saleDraft.get(), quantity: e.target.value })}
                            style={{ width: 100 }}
                        />
                        <TextField
                            label="Date"
                            type="date"
                            size="small"
                            value={saleDraft.get().date}
                            onChange={(e) => saleDraft.set({ ...saleDraft.get(), date: e.target.value })}
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
                                {Array.isArray(form.get().sales) && form.get().sales.map((s) => (
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
