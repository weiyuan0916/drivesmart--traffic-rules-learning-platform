import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: 'depcpvfwg',
  api_key: '693482347243783',
  api_secret: 'bBxwUCEzu1XWX4RERe5zSnhmbyg',
  secure: true,
});

// Probe a few specific cau_* filenames on Cloudinary
const probes = ['cau_036', 'cau_037', 'cau_227', 'cau_286', 'cau_290', 'cau_001', 'cau_600', 'onboarding'];
for (const id of probes) {
  try {
    const r = await cloudinary.api.resource(`cau-600/${id}`, { resource_type: 'image' });
    console.log('FOUND ', id, '->', r.secure_url);
  } catch (e) {
    console.log('miss  ', id, '->', e.error?.message || e.message);
  }
}

// Also list folders at the root
try {
  const folders = await cloudinary.api.root_folders();
  console.log('\nRoot folders:');
  for (const f of folders.folders) console.log(' -', f.name, '(' + f.path + ')');
} catch (e) {
  console.log('root_folders err:', e.message);
}

// And list anything under common prefixes
for (const prefix of ['cau-600', 'questions', 'cau_', 'onboarding']) {
  try {
    const r = await cloudinary.api.resources({ type: 'upload', prefix: prefix + '/', max_results: 5 });
    console.log(`\nPrefix "${prefix}/" -> ${r.resources.length} (max_results 5)`);
    for (const x of r.resources) console.log(' -', x.public_id, x.format, x.width + 'x' + x.height);
  } catch (e) {
    console.log(`prefix ${prefix} err:`, e.message);
  }
}
