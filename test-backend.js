// Simple test script to verify backend functionality
const testBackend = async () => {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing Backend API...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const response = await fetch(`${baseUrl}/pdfs`);
    if (response.ok) {
      console.log('✅ Server is running and responding');
    } else {
      console.log('❌ Server responded with error:', response.status);
    }
    
    // Test 2: Test PDFs endpoint
    console.log('\n2. Testing /pdfs endpoint...');
    const pdfsResponse = await fetch(`${baseUrl}/pdfs`);
    if (pdfsResponse.ok) {
      const pdfs = await pdfsResponse.json();
      console.log(`✅ Found ${pdfs.length} PDFs in database`);
    } else {
      console.log('❌ Failed to fetch PDFs:', pdfsResponse.status);
    }
    
    // Test 3: Test form submission (this will create a test entry)
    console.log('\n3. Testing form submission...');
    const testData = {
      formData: {
        firstName: "Test",
        lastName: "User",
        dateOfBirth: "1990-01-01",
        gender: "male",
        placeOfBirth: "Test City",
        fatherName: "Test Father",
        fatherAadhaarNumber: "123456789012",
        motherName: "Test Mother",
        motherAadhaarNumber: "987654321098",
        aadhaarConsentGiven: true
      }
    };
    
    const submitResponse = await fetch(`${baseUrl}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log('✅ Form submitted successfully!');
      console.log('   PDF ID:', result.pdfId);
      console.log('   Submission ID:', result.submissionId);
      console.log('   File Name:', result.pdfFileName);
      
      // Test 4: Test PDF viewing
      console.log('\n4. Testing PDF viewing...');
      const pdfUrl = `${baseUrl}/pdf/${result.pdfId}`;
      console.log(`✅ PDF URL: ${pdfUrl}`);
      console.log('   You can open this URL in a browser to view the PDF');
      
    } else {
      console.log('❌ Form submission failed:', submitResponse.status);
      const error = await submitResponse.text();
      console.log('   Error:', error);
    }
    
    // Test 5: Check updated PDFs list
    console.log('\n5. Checking updated PDFs list...');
    const updatedPdfsResponse = await fetch(`${baseUrl}/pdfs`);
    if (updatedPdfsResponse.ok) {
      const updatedPdfs = await updatedPdfsResponse.json();
      console.log(`✅ Now found ${updatedPdfs.length} PDFs in database`);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
  
  console.log('\n🎉 Backend testing completed!');
  console.log('\n📱 Frontend is available at: http://localhost:8080');
  console.log('🔧 Backend is available at: http://localhost:3001');
};

// Run the test
testBackend();
