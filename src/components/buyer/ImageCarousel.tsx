import { useState, useEffect } from "react";
import { Camera } from "lucide-react";

interface ImageCarouselProps {
    photos: string[];
    isConfirmed: boolean;
    uploadedImageUrl?: string;
}

export function ImageCarousel({ photos, isConfirmed, uploadedImageUrl }: ImageCarouselProps) {
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    // Create image list prioritizing sourcer-uploaded image
    const imagesToShow = isConfirmed && uploadedImageUrl 
        ? [uploadedImageUrl, ...photos.filter(p => p !== uploadedImageUrl)]
        : photos;

    useEffect(() => {
        if (imagesToShow.length > 0) {
            setMainImage(imagesToShow[0]);
            setImageError(false);
        }
    }, [imagesToShow]);

    const handleImageError = () => {
        setImageError(true);
    };

    // Don't render anything if not confirmed or no images
    if (!isConfirmed || imagesToShow.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="aspect-video overflow-hidden rounded-lg border flex items-center justify-center bg-muted">
                {mainImage && !imageError ? (
                    <img 
                        src={mainImage} 
                        alt="Main part" 
                        className="object-contain max-h-full w-full"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p>Image unavailable</p>
                    </div>
                )}
            </div>
            
            {/* Thumbnails - Only show if multiple images */}
            {imagesToShow.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {imagesToShow.slice(0, 4).map((photo, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setMainImage(photo);
                                setImageError(false);
                            }}
                            className={`aspect-square overflow-hidden rounded-md border ${
                                mainImage === photo ? 'ring-2 ring-ring' : ''
                            }`}
                        >
                            <img 
                                src={photo} 
                                alt={`Thumbnail ${index + 1}`} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
} 