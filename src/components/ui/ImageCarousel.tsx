import { useState } from "react";
import { Camera } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageCarouselProps {
    images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
    console.log("ImageCarousel received images:", images);
    const [imageError, setImageError] = useState<Record<string, boolean>>({});

    if (!images || images.length === 0) {
        console.log("ImageCarousel: No images provided or empty array");
        return null;
    }

    return (
        <div className="relative w-full">
            <Carousel className="w-full">
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={index} className="relative">
                            <div className="aspect-video w-full">
                                {!imageError[image] ? (
                                    <img
                                        src={image}
                                        alt={`Part image ${index + 1}`}
                                        className="w-full h-full object-contain rounded-lg"
                                        onError={() => {
                                            setImageError(prev => ({
                                                ...prev,
                                                [image]: true
                                            }));
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                                        <div className="text-center text-gray-400">
                                            <Camera className="h-8 w-8 mx-auto mb-2" />
                                            <p>Image unavailable</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {images.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                    </>
                )}
            </Carousel>
        </div>
    );
}