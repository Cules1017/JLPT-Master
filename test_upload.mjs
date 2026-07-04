import fs from 'fs';
import path from 'path';

async function testUpload() {
  const filePath = path.join(process.cwd(), 'package.json'); // Use a small file
  const buffer = fs.readFileSync(filePath);
  
  const formData = new FormData();
  formData.append('audio', new Blob([buffer], { type: 'application/json' }), 'package.json');
  
  try {
    const res = await fetch('http://localhost:3000/api/admin/exams/test-id/audio', {
      method: 'POST',
      body: formData,
      headers: {
        // Need to pass a cookie for auth if it checks session. 
        // But let's see if it hits the 403 or the FormData parsing error first.
      }
    });
    
    console.log(res.status);
    const json = await res.json();
    console.log(json);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
