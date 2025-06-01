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
  draft: 'Draft',
  pending: 'Pending',
  under_review: 'Under Review',
  documents_needed: 'Documents Needed',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  accepted: 'Accepted',
  enrolled: 'Enrolled'
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
      setError(err.message || 'Error loading applications');
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
      setError(err.message || 'Error cancelling application');
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
          My Applications
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateApplication}
        >
          New Application
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
          <Tab label={`Pending (${getStatusCount('pending')})`} />
          <Tab label={`Under Review (${getStatusCount('under_review')})`} />
          <Tab label={`Documents Needed (${getStatusCount('documents_needed')})`} />
          <Tab label={`Approved (${getStatusCount('approved')})`} />
          <Tab label={`Accepted (${getStatusCount('accepted')})`} />
          <Tab label={`Enrolled (${getStatusCount('enrolled')})`} />
          <Tab label={`Rejected (${getStatusCount('rejected')})`} />
          <Tab label={`Withdrawn (${getStatusCount('withdrawn')})`} />
          <Tab label={`Drafts (${getStatusCount('draft')})`} />
        </Tabs>

        <Box p={3}>
          {Object.entries(applications).map(([status, apps]) => (
            <Box
              key={status}
              sx={{ display: activeTab === Object.keys(applications).indexOf(status) ? 'block' : 'none' }}
            >
              {apps.length === 0 ? (
                <Typography color="text.secondary" align="center" py={4}>
                  There are no applications in this category
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
                            title="View details"
                          >
                            <ViewIcon />
                          </IconButton>
                          {['draft', 'pending'].includes(application.status) && (
                            <>
                              <IconButton
                                onClick={() => handleEditApplication(application.id)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelClick(application)}
                                title="Cancel"
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
        <DialogTitle>Cancel Application</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this application?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Dismiss</Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            disabled={!cancelReason.trim()}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications; 