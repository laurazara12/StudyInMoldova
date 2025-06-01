import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';

const steps = ['Select Program', 'Application Details', 'Confirmation'];

const NewApplication = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [applicationYear, setApplicationYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('fall');
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      loadPrograms(selectedUniversity);
    }
  }, [selectedUniversity]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/universities`, {
        headers: getAuthHeaders()
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid format for university data');
      }
      
      setUniversities(response.data);
    } catch (err) {
      console.error('Eroare la încărcarea universităților:', err);
      setError(err.response?.data?.message || 'Error loading universities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async (universityId) => {
    try {
      setLoading(true);
      setError(null);
      setPrograms([]); // Resetăm programele când se schimbă universitatea
      
      if (!universityId) {
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/universities/${universityId}/programs`, {
        headers: getAuthHeaders()
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid format for program data');
      }
      
      setPrograms(response.data);
    } catch (err) {
      console.error('Eroare la încărcarea programelor:', err);
      setError(err.response?.data?.message || 'Error loading programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedUniversity || !selectedProgram) {
        throw new Error('Please select a university and a program');
      }

      const applicationData = {
        university_id: selectedUniversity,
        program_id: selectedProgram,
        application_year: applicationYear,
        semester,
        notes,
        is_urgent: isUrgent
      };

      await applicationService.createApplication(applicationData);
      navigate('/applications');
    } catch (err) {
      console.error('Eroare la crearea aplicației:', err);
      setError(err.response?.data?.message || err.message || 'Error creating application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!selectedUniversity}>
                <InputLabel>University</InputLabel>
                <Select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  label="University"
                >
                  {universities.map((university) => (
                    <MenuItem key={university.id} value={university.id}>
                      {university.name}
                    </MenuItem>
                  ))}
                </Select>
                {!selectedUniversity && (
                  <FormHelperText>Select a university</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {selectedUniversity && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!selectedProgram}>
                  <InputLabel>Program</InputLabel>
                  <Select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    label="Program"
                  >
                    {programs.map((program) => (
                      <MenuItem key={program.id} value={program.id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!selectedProgram && (
                    <FormHelperText>Select a program</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Application Year</InputLabel>
                <Select
                  value={applicationYear}
                  onChange={(e) => setApplicationYear(e.target.value)}
                  label="Application Year"
                >
                  <MenuItem value={new Date().getFullYear()}>
                    {new Date().getFullYear()}
                  </MenuItem>
                  <MenuItem value={new Date().getFullYear() + 1}>
                    {new Date().getFullYear() + 1}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  label="Semester"
                >
                  <MenuItem value="fall">Fall</MenuItem>
                  <MenuItem value="spring">Spring</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Urgent Application</InputLabel>
                <Select
                  value={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.value)}
                  label="Urgent Application"
                >
                  <MenuItem value={false}>No</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        const selectedUniversityData = universities.find(u => u.id === selectedUniversity);
        const selectedProgramData = programs.find(p => p.id === selectedProgram);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm application details
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedProgramData?.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {selectedUniversityData?.name}
                </Typography>
                <Box mt={2}>
                  <Chip
                    label={`Year ${applicationYear}`}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={semester === 'fall' ? 'Fall Semester' : 'Spring Semester'}
                    sx={{ mr: 1 }}
                  />
                  {isUrgent && (
                    <Chip
                      label="Urgent"
                      color="error"
                    />
                  )}
                </Box>
                {notes && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Additional Notes:</strong> {notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        New Application
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              Submit Application
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && (!selectedUniversity || !selectedProgram)) ||
                loading
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default NewApplication; 