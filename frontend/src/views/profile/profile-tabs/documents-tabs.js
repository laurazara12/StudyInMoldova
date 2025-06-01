  if (response.data.success) {
    const newDocument = {
      ...response.data.data,
      status: response.data.data?.status || 'pending',
      document_type: docTypeId,
      uploadDate: new Date(),
      createdAt: new Date()
    };
    
    // Update documents list
    setDocuments(prev => {
      const updatedDocs = prev.filter(doc => doc.document_type !== docTypeId);
      return [...updatedDocs, newDocument];
    });
    
    // Update button states
    setButtonStates(prev => ({
      ...prev,
      [docTypeId]: {
        isDownloadActive: true,
        isDeleteActive: true
      }
    }));

    toast.success('Document uploaded successfully');
    setUploadStatus(prev => ({
      ...prev,
      [docTypeId]: { ...prev[docTypeId], uploaded: true }
    }));
  } else {
    // ... existing code ...
  } 