import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dlbu43xwt'
  }
});

export const getCloudinaryImageUrl = (publicId, options = {}) => {
  const image = cld.image(publicId);
  
  // Aplică transformările implicite
  image.format('auto')
       .quality('auto')
       .delivery('q_auto,f_auto');
  
  // Aplică transformările personalizate
  if (options.width) image.resize({ width: options.width });
  if (options.height) image.resize({ height: options.height });
  if (options.crop) image.resize({ crop: options.crop });
  if (options.radius) image.roundCorners(options.radius);
  
  return image.toURL();
};

export default cld; 