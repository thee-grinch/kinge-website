"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Slider } from "@/components/ui/slider"; // Assuming we will create a simple slider or use standard input
import { Button } from "@/components/ui/button"; // Assuming standard UI components or use HTML
import { getCroppedImg } from "@/lib/utils/canvasUtils";
import { X, Check } from "lucide-react";

// For this project, since we don't have extensive UI lib yet, I'll use standard Tailwind elements

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (file: Blob) => void;
    onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(1); // Default square
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                if (croppedImage) {
                    onCropComplete(croppedImage);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Crop Image</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setAspect(1)}
                            className={`px-3 py-1 rounded text-sm ${aspect === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        >
                            1:1
                        </button>
                        <button
                            onClick={() => setAspect(4 / 3)}
                            className={`px-3 py-1 rounded text-sm ${aspect === 4 / 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        >
                            4:3
                        </button>
                        <button
                            onClick={() => setAspect(16 / 9)}
                            className={`px-3 py-1 rounded text-sm ${aspect === 16 / 9 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        >
                            16:9
                        </button>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="relative flex-1 bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-4 border-t space-y-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={showCroppedImage}
                            className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 flex items-center"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Crop & Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
