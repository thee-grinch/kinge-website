"use client";

import { useEffect, useState } from "react";
import { getProduct } from "@/lib/firestore/products";
import { Product } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Save, Loader2, ArrowLeft, Plus, X, Upload, Crop as CropIcon } from "lucide-react";
import Link from "next/link";
import ImageCropper from "@/components/admin/ImageCropper";

export default function ProductEditPage() {
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'new';
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '',
        stock: 0,
        images: [],
        features: []
    });

    // Image Handling
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // To crop
    const [pendingFile, setPendingFile] = useState<File | null>(null); // Raw file to crop
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    // Feature Handling
    const [newFeature, setNewFeature] = useState("");

    useEffect(() => {
        if (!isNew && id) {
            async function load() {
                const data = await getProduct(id);
                if (data) {
                    setFormData({
                        ...data,
                        images: data.images || (data.imageUrl ? [data.imageUrl] : []),
                        features: data.features || []
                    });
                }
                setLoading(false);
            }
            load();
        }
    }, [id, isNew]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
        }));
    };

    // Features Logic
    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({ ...prev, features: [...(prev.features || []), newFeature.trim()] }));
            setNewFeature("");
        }
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== index) }));
    };

    // Image Upload Logic
    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setPendingFile(file);
            setSelectedImage(URL.createObjectURL(file));
            setIsCropperOpen(true);
            // Reset input so the same file can be selected again if needed (e.g. after cancel)
            e.target.value = "";
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        // Automatically Upload Cropped Image
        setSaving(true); // Show saving state locally
        try {
            const fileName = `products/${Date.now()}.jpg`;
            const storageRef = ref(storage, fileName);
            const snapshot = await uploadBytes(storageRef, croppedBlob);
            const downloadUrl = await getDownloadURL(snapshot.ref);

            setFormData(prev => {
                const newImages = [...(prev.images || []), downloadUrl];
                const mainImage = newImages[0]; // First image is main
                return {
                    ...prev,
                    images: newImages,
                    imageUrl: mainImage // Keep legacy field updated
                };
            });
            setIsCropperOpen(false);
            setSelectedImage(null);
            setPendingFile(null);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        } finally {
            setSaving(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = (prev.images || []).filter((_, i) => i !== index);
            return {
                ...prev,
                images: newImages,
                imageUrl: newImages.length > 0 ? newImages[0] : ''
            };
        });
    };

    const setMainImage = (index: number) => {
        setFormData(prev => {
            const images = [...(prev.images || [])];
            const [selected] = images.splice(index, 1);
            images.unshift(selected); // Move to front
            return {
                ...prev,
                images: images,
                imageUrl: images[0]
            };
        });
    };

    // Final Save
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const productData = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock)
            };

            if (isNew) {
                await addDoc(collection(db, "products"), productData);
            } else {
                await setDoc(doc(db, "products", id), productData, { merge: true });
            }

            router.push("/admin/products");
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center">
                <Link href="/admin/products" className="mr-4 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isNew ? "Create Product" : "Edit Product"}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Price & Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    min="0"
                                    required
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select Category</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Home & Garden">Home & Garden</option>
                                <option value="Books">Books</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column: Images & Features */}
                    <div className="space-y-6">
                        {/* Images Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {formData.images?.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-square border rounded-md overflow-hidden bg-gray-100">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center space-y-2">
                                            {idx !== 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setMainImage(idx)}
                                                    className="text-white text-xs bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700"
                                                >
                                                    Set Main
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="text-white bg-red-600 p-1 rounded-full hover:bg-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {idx === 0 && (
                                            <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">Main</span>
                                        )}
                                    </div>
                                ))}
                                <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 aspect-square">
                                    <Upload className="h-6 w-6 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={onFileSelect} />
                                </label>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
                            <div className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Add a feature (e.g. Wireless Bluetooth)"
                                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-200"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            <ul className="space-y-2">
                                {formData.features?.map((feat, idx) => (
                                    <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-md text-sm">
                                        <span>{feat}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(idx)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Save Product
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Cropper Modal */}
            {isCropperOpen && selectedImage && (
                <ImageCropper
                    imageSrc={selectedImage}
                    onCancel={() => setIsCropperOpen(false)}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}
