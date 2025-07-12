import type React from "react"
import { useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface ImageCarouselProps {
  images: string[]
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  console.log("ImageCarousel received images:", images)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  if (!images || images.length === 0) {
    console.log("ImageCarousel: No images provided or empty array")
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        No images available
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => {
            console.log(`Rendering image ${index}:`, image)
            return (
              <CarouselItem key={index}>
                <div className="p-1">
                  {!imageError[image] ? (
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Part image ${index + 1}`}
                      className="w-full h-48 md:h-64 object-contain rounded-lg"
                      onError={() => {
                        console.error(`Failed to load image: ${image}`)
                        setImageError((prev) => ({
                          ...prev,
                          [image]: true,
                        }))
                      }}
                      onLoad={() => console.log(`Image loaded: ${image}`)}
                    />
                  ) : (
                    <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                      <p className="text-gray-400">Image failed to load</p>
                    </div>
                  )}
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  )
}
