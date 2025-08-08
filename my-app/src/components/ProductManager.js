import React, { useEffect, useState } from 'react';
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
import { atomicFetch } from '../utils/atomicFetch';

const API_BASE = 'http://localhost:5000';

export default function ProductManager() {

    const products = useHookstate([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', description: '', category: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


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
            alert(`Failed to load products: ${e.message}. Please check if the server is running.`);
            products.set([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshProducts();
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
                    category: existing.category || ''
                });
            }
        } else {
            setForm({ name: '', price: '', description: '', category: '' });
        }
        setErrors({});
        setOpen(true);
    };


    const handleClose = () => {
        setOpen(false);
        setForm({ name: '', price: '', description: '', category: '' });
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
                    category: form.category
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
                    category: form.category
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
            handleClose();
        } catch (e) {
            console.error('Failed to save product:', e.message);
            alert(`Failed to save product: ${e.message}. Please try again.`);
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
        } catch (e) {
            console.error('Failed to delete product:', e.message);
            alert(`Failed to delete product: ${e.message}. Please try again.`);
        }
    };

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
        </div>
    );
}
