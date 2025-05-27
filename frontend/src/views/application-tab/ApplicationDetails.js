import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  School as SchoolIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
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

const statusIcons = {
  draft: DescriptionIcon,
  pending: DescriptionIcon,
  under_review: HistoryIcon,
  documents_needed: WarningIcon,
  approved: CheckCircleIcon,
  rejected: CancelIcon,
  withdrawn: CancelIcon,
  accepted: CheckCircleIcon,
  enrolled: CheckCircleIcon
};

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplicationById(id);
      setApplication(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Eroare la încărcarea aplicației');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/applications/${id}/edit`);
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await applicationService.cancelApplication(id, {
        reason: cancelReason
      });
      await loadApplication();
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (err) {
      setError(err.message || 'Eroare la anularea aplicației');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!application) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Aplicația nu a fost găsită
        </Alert>
      </Container>
    );
  }

  const StatusIcon = statusIcons[application.status];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Detalii aplicație
        </Typography>
        {['draft', 'pending'].includes(application.status) && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ mr: 1 }}
            >
              Editează
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleCancel}
            >
              Anulează
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <StatusIcon
                color={statusColors[application.status]}
                sx={{ fontSize: 40, mr: 2 }}
              />
              <Box>
                <Typography variant="h5" gutterBottom>
                  {application.program.name}
                </Typography>
                <Typography color="text.secondary">
                  {application.university.name}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={statusLabels[application.status]}
                  color={statusColors[application.status]}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Anul aplicării
                </Typography>
                <Typography>{application.application_year}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Semestrul
                </Typography>
                <Typography>
                  {application.semester === 'fall' ? 'Toamnă' : 'Primăvară'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Prioritate
                </Typography>
                <Chip
                  label={application.is_urgent ? 'Urgent' : 'Normal'}
                  color={application.is_urgent ? 'error' : 'default'}
                  size="small"
                />
              </Grid>
            </Grid>

            {application.notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Note adiționale
                </Typography>
                <Typography>{application.notes}</Typography>
              </>
            )}

            {application.admin_notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Note administrative
                </Typography>
                <Typography>{application.admin_notes}</Typography>
              </>
            )}

            {application.rejection_reason && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Motivul respingerii
                </Typography>
                <Typography color="error">{application.rejection_reason}</Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Istoricul statusului
            </Typography>
            <Timeline>
              {application.status_history.map((history, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={statusColors[history.status]}>
                      {statusIcons[history.status] && React.createElement(statusIcons[history.status])}
                    </TimelineDot>
                    {index < application.status_history.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">
                      {statusLabels[history.status]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(history.changed_at).toLocaleString()}
                    </Typography>
                    {history.changed_by && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Modificat de: {history.changed_by}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>
      </Grid>

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
          <Button onClick={() => setCancelDialogOpen(false)}>
            Renunță
          </Button>
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

export default ApplicationDetails; 