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
      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Eroare la obținerea aplicațiilor');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Eroare la obținerea aplicațiilor');
      }

      // Verificăm dacă avem date valide
      if (!result.data || typeof result.data !== 'object') {
        console.error('Format invalid al datelor:', result);
        throw new Error('Format invalid al datelor primite de la server');
      }

      // Inițializăm toate grupurile
      this.applications = {
        drafts: [],
        pending: [],
        sent: [],
        rejected: [],
        withdrawn: []
      };

      // Populăm grupurile cu datele primite
      Object.keys(this.applications).forEach(group => {
        if (Array.isArray(result.data[group])) {
          this.applications[group] = result.data[group];
        } else {
          console.warn(`Grupul ${group} nu este un array valid:`, result.data[group]);
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
      console.error('Eroare la încărcarea aplicațiilor:', error);
      this.error = error.message;
      // Inițializăm cu array-uri goale în caz de eroare
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