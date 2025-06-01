class ApplicationsSection {
  constructor() {
    this.applications = {
      drafts: [],
      pending: [],
      sent: [],
      rejected: [],
      withdrawn: []
    };
    this.status = {
      drafts: 0,
      pending: 0,
      sent: 0,
      rejected: 0,
      withdrawn: 0
    };
    this.total = 0;
    this.message = '';
    this.error = null;
    this.isLoading = false;
  }

  async fetchApplications() {
    try {
      this.isLoading = true;
      const response = await fetch('/api/applications/my-applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching applications');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error fetching applications');
      }

      // Check if we have valid data
      if (!result.data || typeof result.data !== 'object') {
        console.error('Invalid data format:', result);
        throw new Error('Invalid data format received from server');
      }

      // Initialize all groups
      this.applications = {
        drafts: [],
        pending: [],
        sent: [],
        rejected: [],
        withdrawn: []
      };

      // Populate groups with received data
      Object.keys(this.applications).forEach(group => {
        if (Array.isArray(result.data[group])) {
          this.applications[group] = result.data[group];
        } else {
          console.warn(`Group ${group} is not a valid array:`, result.data[group]);
          this.applications[group] = [];
        }
      });

      this.status = result.status || {
        drafts: 0,
        pending: 0,
        sent: 0,
        rejected: 0,
        withdrawn: 0
      };

      this.total = result.total || 0;
      this.message = result.message || '';

    } catch (error) {
      console.error('Error loading applications:', error);
      this.error = error.message;
      // Initialize with empty arrays in case of error
      this.applications = {
        drafts: [],
        pending: [],
        sent: [],
        rejected: [],
        withdrawn: []
      };
      this.status = {
        drafts: 0,
        pending: 0,
        sent: 0,
        rejected: 0,
        withdrawn: 0
      };
      this.total = 0;
    } finally {
      this.isLoading = false;
    }
  }
}

export default ApplicationsSection; 