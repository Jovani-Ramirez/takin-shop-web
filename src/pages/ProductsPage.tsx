import React from 'react';

import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Button, Skeleton, Typography, TextField, Fab, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Masonry from '@mui/lab/Masonry';
import { db as firebaseDB } from '../api/firebaseConfig';
import { productsDB } from '../db/productsDb';
import shoppingCartDB from '../db/index'; 

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
}

const imageMap: Record<string, string> = {};

const pageSize = 20;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Manejo del ancho para columnas responsive Masonry
    const [columns, setColumns] = useState(3);

    // Ajusta columnas según ancho ventana (responsive)
    useEffect(() => {
        function updateColumns() {
            const width = window.innerWidth;
            if (width < 600) setColumns(1);
            else if (width < 900) setColumns(2);
            else setColumns(3);
        }
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    const fetchAndStoreProducts = async (forceUpdate = false) => {
        try {
            setLoading(true);
            setDisplayedProducts([]);
            setPage(1);

            if (forceUpdate) {
                await productsDB.delete();
                await productsDB.open();
            }

            let localProducts = await productsDB.products.toArray();

            if (localProducts.length > 0 && !forceUpdate) {
                setProducts(localProducts);
                setDisplayedProducts(localProducts.slice(0, pageSize));
                setLoading(false);
                return;
            }

            const querySnapshot = await getDocs(collection(firebaseDB, 'products'));
            const firebaseProducts: Product[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: parseInt(doc.id, 10),
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    image: imageMap[doc.id] || '/public/default.png',
                    quantity: 0,
                };
            });

            await productsDB.products.bulkPut(firebaseProducts);
            setProducts(firebaseProducts);
            setDisplayedProducts(firebaseProducts.slice(0, pageSize));
            setLoading(false);

            const now = new Date();
            setLastUpdated(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
        } catch (error) {
            console.error('Error actualizando catálogo:', error);
            setLoading(false);
        }
    };

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        const newItems = products.slice(0, nextPage * pageSize);
        setDisplayedProducts(newItems);
        setPage(nextPage);
    }, [page, products]);

    // Filtrado según búsqueda
    const filteredProducts = displayedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Actualizar contador de carrito usando shoppingCartDB
    const updateCartCount = async () => {
        const items = await shoppingCartDB.cart.toArray();
        setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));
    };

    // Agregar producto al carrito usando shoppingCartDB
    const addToCart = async (product: Product) => {
        const existing = await shoppingCartDB.cart.get(product.id);
        if (existing) {
            await shoppingCartDB.cart.update(product.id, { quantity: existing.quantity + 1 });
        } else {
            await shoppingCartDB.cart.add({ ...product, quantity: 1 });
        }
        updateCartCount();
    };

    useEffect(() => {
        fetchAndStoreProducts();
        updateCartCount();
    }, []);

    // Scroll infinito con IntersectionObserver
    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && displayedProducts.length < products.length) {
                loadMore();
            }
        });

        if (loadMoreRef.current) {
            observer.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [displayedProducts, products, loading, loadMore]);

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography variant="h5" flexGrow={1}>Productos</Typography>
                <TextField
                    label="Buscar productos"
                    size="small"
                    sx={{ minWidth: 200 }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Button variant="contained" onClick={() => fetchAndStoreProducts(true)}>
                    Actualizar catálogo
                </Button>
            </Box>

            {loading ? (
                <Masonry columns={columns} spacing={2}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} variant="rectangular" height={200} />
                    ))}
                </Masonry>
            ) : (
                <Masonry columns={columns} spacing={2}>
                    {filteredProducts.map((product) => (
                        <Box
                            key={product.id}
                            sx={{
                                border: '1px solid #ddd',
                                borderRadius: 2,
                                padding: 2,
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                // NO height fija para Masonry
                            }}
                            // Ahora clic agrega al carrito, no navega
                            onClick={() => addToCart(product)}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    objectFit: 'cover',
                                    height: 'auto',
                                    maxHeight: 200,
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/public/default.png';
                                }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" noWrap>{product.name}</Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {product.description}
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    ${product.price}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ mt: 1 }}
                                onClick={e => {
                                    e.stopPropagation(); // Para que no se duplique addToCart
                                    addToCart(product);
                                }}
                            >
                                Agregar al carrito
                            </Button>
                        </Box>
                    ))}
                </Masonry>
            )}

            <div ref={loadMoreRef} style={{ height: 50 }}></div>

            {lastUpdated && (
                <Typography variant="caption" display="block" mt={2} color="gray">
                    Última actualización: {lastUpdated}
                </Typography>
            )}

            <Fab
                color="primary"
                aria-label="Carrito de compras"
                sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}
                onClick={() => window.location.href = '/cart'} // Si usas react-router puedes usar navigate
            >
                <Badge badgeContent={cartCount} color="error">
                    <ShoppingCartIcon />
                </Badge>
            </Fab>
        </Box>
    );
}
