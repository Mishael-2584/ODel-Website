const fs = require('fs');
const path = require('path');
const https = require('https');

// Try to require sharp, fallback to manual instructions if not available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not found. Please install dependencies first: npm install');
  console.log('   Or use an online favicon generator with the downloaded logo.');
  process.exit(1);
}

const LOGO_URL = 'https://ueab.ac.ke/wp-content/uploads/2025/03/logo-2.png';
const FAVICON_DIR = path.join(__dirname, '..', 'public', 'favicon');

// Create favicon directory if it doesn't exist
if (!fs.existsSync(FAVICON_DIR)) {
  fs.mkdirSync(FAVICON_DIR, { recursive: true });
}

// Download the logo
function downloadLogo() {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(FAVICON_DIR, 'logo-original.png'));
    
    https.get(LOGO_URL, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download logo: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✓ Logo downloaded successfully');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join(FAVICON_DIR, 'logo-original.png'), () => {});
      reject(err);
    });
  });
}

// Generate favicon sizes
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  const logoPath = path.join(FAVICON_DIR, 'logo-original.png');
  
  for (const { name, size } of sizes) {
    try {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(FAVICON_DIR, name));
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  // Generate favicon.ico (use 32x32 PNG as ICO - browsers accept this)
  try {
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(FAVICON_DIR, 'favicon.ico'));
    
    console.log('✓ Generated favicon.ico (PNG format, compatible with all browsers)');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
  }
  
  // Generate site.webmanifest for Android
  const manifest = {
    name: 'UEAB ODeL',
    short_name: 'UEAB ODeL',
    description: 'University of Eastern Africa Baraton Open Distance eLearning Platform',
    icons: [
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#1e3a8a',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    scope: '/'
  };
  
  fs.writeFileSync(
    path.join(FAVICON_DIR, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('✓ Generated site.webmanifest');
  
  // Generate browserconfig.xml for Windows tiles
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/favicon/android-chrome-192x192.png"/>
      <TileColor>#1e3a8a</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  
  fs.writeFileSync(
    path.join(FAVICON_DIR, 'browserconfig.xml'),
    browserconfig
  );
  console.log('✓ Generated browserconfig.xml');
}

// Generate Safari pinned tab SVG (simplified logo)
function generateSafariPinnedTab() {
  const svg = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="#1e3a8a">UEAB</text>
</svg>`;
  
  fs.writeFileSync(
    path.join(FAVICON_DIR, 'safari-pinned-tab.svg'),
    svg
  );
  console.log('✓ Generated safari-pinned-tab.svg');
}

async function main() {
  try {
    console.log('Downloading logo...');
    await downloadLogo();
    
    console.log('\nGenerating favicon files...');
    await generateFavicons();
    
    console.log('\nGenerating Safari pinned tab icon...');
    generateSafariPinnedTab();
    
    console.log('\n✨ All favicon files generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated files in public/favicon/');
    console.log('2. Test the favicon in different browsers');
    console.log('3. Deploy and wait for Google to re-crawl (may take a few days)');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

