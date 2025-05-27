import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  draft: 'default',
  pending: 'warning',
  under_review: 'info',
  documents_needed: 'warning',
  approved: 'success',
  rejected: 'error',
  withdrawn: 'default',
  accepted: 'success',
  enrolled: 'success'
};

const statusLabels = {
  draft: 'Ciornă',
  pending: 'În așteptare',
  under_review: 'În revizuire',
  documents_needed: 'Documente necesare',
  approved: 'Aprobată',
  rejected: 'Respinsă',
  withdrawn: 'Retrasă',
  accepted: 'Acceptată',
  enrolled: 'Înmatriculat'
};

const Applications = () => {
  const [applications, setApplications] = useState({
    draft: [],
    pending: [],
    under_review: [],
    documents_needed: [],
    approved: [],
    rejected: [],
    withdrawn: [],
    accepted: [],
    enrolled: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getUserApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Eroare la încărcarea aplicațiilor');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateApplication = () => {
    navigate('/applications/new');
  };

  const handleViewApplication = (id) => {
    navigate(`/applications/${id}`);
  };

  const handleEditApplication = (id) => {
    navigate(`/applications/${id}/edit`);
  };

  const handleCancelClick = (application) => {
    setSelectedApplication(application);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await applicationService.cancelApplication(selectedApplication.id, {
        reason: cancelReason
      });
      await loadApplications();
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedApplication(null);
    } catch (err) {
      setError(err.message || 'Eroare la anularea aplicației');
    }
  };

  const getStatusCount = (status) => {
    return applications[status]?.length || 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Aplicațiile mele
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateApplication}
        >
          Aplicație nouă
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`În așteptare (${getStatusCount('pending')})`} />
          <Tab label={`În revizuire (${getStatusCount('under_review')})`} />
          <Tab label={`Documente necesare (${getStatusCount('documents_needed')})`} />
          <Tab label={`Aprobate (${getStatusCount('approved')})`} />
          <Tab label={`Acceptate (${getStatusCount('accepted')})`} />
          <Tab label={`Înmatriculate (${getStatusCount('enrolled')})`} />
          <Tab label={`Respinse (${getStatusCount('rejected')})`} />
          <Tab label={`Retrase (${getStatusCount('withdrawn')})`} />
          <Tab label={`Ciorne (${getStatusCount('draft')})`} />
        </Tabs>

        <Box p={3}>
          {Object.entries(applications).map(([status, apps]) => (
            <Box
              key={status}
              sx={{ display: activeTab === Object.keys(applications).indexOf(status) ? 'block' : 'none' }}
            >
              {apps.length === 0 ? (
                <Typography color="text.secondary" align="center" py={4}>
                  Nu există aplicații în această categorie
                </Typography>
              ) : (
                apps.map((application) => (
                  <Card key={application.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">
                            {application.program.name}
                          </Typography>
                          <Typography color="text.secondary">
                            {application.university.name}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={statusLabels[application.status]}
                              color={statusColors[application.status]}
                              size="small"
                            />
                            {application.is_urgent && (
                              <Chip
                                label="Urgent"
                                color="error"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </Box>
                        <Box>
                          <IconButton
                            onClick={() => handleViewApplication(application.id)}
                            title="Vezi detalii"
                          >
                            <ViewIcon />
                          </IconButton>
                          {['draft', 'pending'].includes(application.status) && (
                            <>
                              <IconButton
                                onClick={() => handleEditApplication(application.id)}
                                title="Editează"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelClick(application)}
                                title="Anulează"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ))}
        </Box>
      </Paper>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Anulează aplicația</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Ești sigur că dorești să anulezi această aplicație?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motivul anulării"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Renunță</Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            disabled={!cancelReason.trim()}
          >
            Anulează
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications; 