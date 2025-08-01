import React from 'react';

import { useEffect, useState } from 'react';
import { auth, db as firestoreDB } from '../api/firebaseConfig';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import {
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
    Avatar,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import shoppingCartDB from '../db/index';
import { useNavigate } from 'react-router-dom';
import defImage from '/public/default.png';

interface CartItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    quantity: number;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [localData, setLocalData] = useState<{
        nombreLocal: string;
        nombrePersona: string;
        telefono: string;
        direccion: string;
    } | null>(null);

    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    // Carga carrito y subtotal
    const loadCart = async () => {
        const items = await shoppingCartDB.cart.toArray();
        setCartItems(items);
        calculateSubtotal(items);
    };

    // Calcula subtotal sin descuentos
    const calculateSubtotal = (items: CartItem[]) => {
        const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setSubtotal(sum);
    };

    // Actualiza cantidad en DB y estado
    const updateQuantity = async (id: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            await shoppingCartDB.cart.delete(id);
            await loadCart();
            return;
        }
        await shoppingCartDB.cart.update(id, { quantity: newQuantity });
        await loadCart();
    };

    // Elimina producto del carrito
    const removeItem = async (id: number) => {
        await shoppingCartDB.cart.delete(id);
        await loadCart();
    };

    // Calcula porcentaje de descuento según subtotal y código promo
    const calculateDiscountPercent = () => {
        let discount = 0;
        if (subtotal > 1200) discount = 10;
        else if (subtotal > 500) discount = 5;

        if (promoCode.trim().toUpperCase() === 'PROMO5') {
            discount = Math.max(discount, 5);
        }

        setDiscountPercent(discount);
    };

    useEffect(() => {
        loadCart();
    }, []);

    useEffect(() => {
        calculateDiscountPercent();
    }, [subtotal, promoCode]);

    // Carga datos negocio si hay usuario logueado
    useEffect(() => {
        const fetchLocalData = async () => {
            if (!currentUser) {
                setLocalData(null);
                return;
            }
            try {
                const docRef = doc(firestoreDB, 'negocios', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setLocalData({
                        nombreLocal: data.nombreLocal || '',
                        nombrePersona: data.nombrePersona || '',
                        telefono: data.telefono || '',
                        direccion: data.direccion || '',
                    });
                    setFormData({
                        name: data.nombrePersona || '',
                        address: data.direccion || '',
                        phone: data.telefono || '',
                    });
                } else {
                    setLocalData(null);
                }
            } catch (error) {
                console.error('Error al obtener datos del local:', error);
                setLocalData(null);
            }
        };

        fetchLocalData();
    }, [currentUser]);

    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;

    // Enviar orden a Firestore
    const handleSubmitOrder = async () => {
        if (!currentUser && (!formData.name || !formData.address || !formData.phone)) {
            alert('Por favor llena todos los campos.');
            return;
        }

        const orderData = {
            userId: currentUser?.uid || null,
            name: currentUser ? localData?.nombrePersona : formData.name,
            address: currentUser ? localData?.direccion : formData.address,
            phone: currentUser ? localData?.telefono : formData.phone,
            paymentMethod,
            total,
            discountPercent,
            items: cartItems,
            createdAt: Timestamp.now(),
        };

        await addDoc(collection(firestoreDB, 'orders'), orderData);
        await shoppingCartDB.cart.clear();
        setCartItems([]);
        setDialogOpen(false);
        alert('Compra registrada con éxito');
    };

    return (
        <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    Volver a productos
                </Button>

                <TextField
                    label="Código de promoción"
                    size="small"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    sx={{ minWidth: 200 }}
                />
            </Box>

            {cartItems.length === 0 ? (
                <Typography variant="h6" textAlign="center">
                    Tu carrito está vacío.
                </Typography>
            ) : (
                <>
                    <Typography variant="h4" gutterBottom>
                        Carrito de compras
                    </Typography>

                    {cartItems.map(item => (
                        <Box
                            key={item.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                                borderBottom: '1px solid #ddd',
                                pb: 2,
                                gap: 2,
                            }}
                        >
                            <Avatar
                                src={item.image || defImage}
                                alt={item.name}
                                variant="rounded"
                                sx={{ width: 64, height: 64 }}
                            />

                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6">{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Precio unitario: ${item.price.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton aria-label="Disminuir cantidad" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                    <RemoveIcon />
                                </IconButton>

                                <Typography>{item.quantity}</Typography>

                                <IconButton aria-label="Aumentar cantidad" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                    <AddIcon />
                                </IconButton>

                                <IconButton aria-label="Eliminar producto" color="error" onClick={() => removeItem(item.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">Subtotal:</Typography>
                        <Typography variant="subtitle1">${subtotal.toFixed(2)}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">Descuento ({discountPercent}%):</Typography>
                        <Typography variant="subtitle1" color={discountPercent > 0 ? 'success.main' : 'text.secondary'}>
                            -${discountAmount.toFixed(2)}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Total a pagar:</Typography>
                        <Typography variant="h6">${total.toFixed(2)}</Typography>
                    </Box>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
                            Finalizar compra
                        </Button>
                    </Box>
                </>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                <DialogTitle>Confirmar compra</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {currentUser && localData ? (
                        <>
                            <Typography><strong>Nombre del comercio:</strong> {localData.nombreLocal}</Typography>
                            <Typography><strong>Nombre de persona:</strong> {localData.nombrePersona}</Typography>
                            <Typography><strong>Teléfono:</strong> {localData.telefono}</Typography>
                            <Typography><strong>Dirección:</strong> {localData.direccion}</Typography>
                        </>
                    ) : (
                        <>
                            <TextField
                                label="Nombre"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <TextField
                                label="Dirección"
                                fullWidth
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            <TextField
                                label="Teléfono"
                                fullWidth
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </>
                    )}

                    <FormControl fullWidth>
                        <InputLabel>Método de pago</InputLabel>
                        <Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            label="Método de pago"
                        >
                            <MenuItem value="cash">Efectivo</MenuItem>
                            <MenuItem value="card" disabled>
                                Tarjeta (próximamente)
                            </MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitOrder}
                        disabled={
                            !currentUser &&
                            (!formData.name || !formData.address || !formData.phone)
                        }
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
