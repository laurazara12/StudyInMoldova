import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dlbu43xwt'
  }
});

export const getCloudinaryImageUrl = (publicId, options = {}) => {
  // Construim URL-ul direct pentru Cloudinary
  const baseUrl = `https://res.cloudinary.com/dlbu43xwt/image/upload`;
  const transformations = [];
  
  // Adăugăm transformările de bază
  transformations.push('f_auto,q_auto');
  
  // Adăugăm transformările personalizate
  if (options.width || options.height || options.crop) {
    let resize = '';
    if (options.crop) resize += `c_${options.crop},`;
    if (options.width) resize += `w_${options.width},`;
    if (options.height) resize += `h_${options.height}`;
    // Eliminăm ultima virgulă dacă există
    resize = resize.replace(/,$/, '');
    transformations.push(resize);
  }
  
  if (options.radius) {
    transformations.push(`r_${options.radius}`);
  }
  
  // Construim URL-ul final
  const transformString = transformations.join('/');
  return `${baseUrl}/${transformString}/${publicId}`;
};

export default cld; 