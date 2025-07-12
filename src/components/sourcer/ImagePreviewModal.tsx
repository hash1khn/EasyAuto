import type React from "react"
import { X } from "lucide-react"

interface ImagePreviewModalProps {
  previewImage: string | null
  onClose: () => void
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ previewImage, onClose }) => {
  if (!previewImage) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full">
        <img
          src={previewImage || "/placeholder.svg"}
          alt="Preview"
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
