// Cloudinary Image Upload Service
// Auto-compresses images and stores on CDN

// ============================================
// CONFIGURATION - Get from cloudinary.com
// ============================================
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';  // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_PRESET';    // Replace with your upload preset
// ============================================

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Compress image before upload (reduces 5-10MB to ~500KB)
async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

// Upload image to Cloudinary
export async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    // Compress image first
    const compressedBlob = await compressImage(file);

    // Create form data
    const formData = new FormData();
    formData.append('file', compressedBlob, 'image.jpg');
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'mf-cash'); // Organize in folder

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      console.log('✅ Image uploaded:', data.secure_url);
      return data.secure_url;
    } else {
      console.error('❌ Upload failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return null;
  }
}

// Convert blob URL to file
export async function blobUrlToFile(blobUrl: string, fileName: string = 'image.jpg'): Promise<File | null> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('❌ Conversion error:', error);
    return null;
  }
}
