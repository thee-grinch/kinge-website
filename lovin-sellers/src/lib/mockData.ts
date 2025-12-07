import { Product } from './types';

export const products: Product[] = [
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        description: 'Experience high-fidelity audio with our premium wireless headphones. Featuring active noise cancellation and 30-hour battery life.',
        price: 199.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        category: 'Electronics',
        stock: 10
    },
    {
        id: '2',
        name: 'Ergonomic Office Chair',
        description: 'Work in comfort with this fully adjustable ergonomic chair. Lumbar support and breathable mesh keep you cool and supported.',
        price: 299.99,
        imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
        category: 'Furniture',
        stock: 5
    },
    {
        id: '3',
        name: 'Smart Fitness Watch',
        description: 'Track your health and fitness goals. Features heart rate monitoring, GPS, and sleep tracking.',
        price: 149.99,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        category: 'Electronics',
        stock: 12
    },
    {
        id: '4',
        name: 'Mechanical Gaming Keyboard',
        description: 'Tactile switches and RGB lighting for the ultimate gaming experience. Durable build quality.',
        price: 89.99,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b91a91e?w=800&q=80',
        category: 'Electronics',
        stock: 8
    },
    {
        id: '5',
        name: 'Designer Sunglasses',
        description: 'Protect your eyes in style. UV400 protection with premium frames.',
        price: 129.99,
        imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
        category: 'Fashion',
        stock: 20
    },
    {
        id: '6',
        name: 'Leather Weekend Bag',
        description: 'Perfect for short trips. Genuine leather with spacious compartments.',
        price: 249.99,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        category: 'Fashion',
        stock: 7
    }
];
