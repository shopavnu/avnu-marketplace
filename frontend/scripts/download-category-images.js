const https = require('https');
const fs = require('fs');
const path = require('path');

// Ensure the categories directory exists
const categoriesDir = path.join(__dirname, '../public/images/categories');
if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
}

// List of category images to download
const categoryImages = [
  {
    name: 'home.jpg',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80&auto=format'
  },
  {
    name: 'art.jpg',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80&auto=format'
  },
  {
    name: 'lighting.jpg',
    url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80&auto=format'
  },
  {
    name: 'bedding.jpg',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80&auto=format'
  },
  {
    name: 'kitchen.jpg',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&auto=format'
  },
  {
    name: 'textiles.jpg',
    url: 'https://images.unsplash.com/photo-1528822855841-e8bf3134cdc9?w=800&q=80&auto=format'
  },
  {
    name: 'furniture.jpg',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80&auto=format'
  },
  {
    name: 'accessories.jpg',
    url: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800&q=80&auto=format'
  },
  {
    name: 'bath.jpg',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80&auto=format'
  },
  {
    name: 'outdoor.jpg',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format'
  },
  {
    name: 'plants.jpg',
    url: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=800&q=80&auto=format'
  },
  {
    name: 'gifts.jpg',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format'
  }
];

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(categoriesDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('Starting download of category images...');
  
  for (const image of categoryImages) {
    try {
      await downloadImage(image.url, image.name);
    } catch (error) {
      console.error(`Error downloading ${image.name}: ${error.message}`);
    }
  }
  
  console.log('All downloads completed!');
}

downloadAllImages();
