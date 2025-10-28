import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import { FileDownload, PictureAsPdf } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Reports() {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [reportType, setReportType] = useState('all');

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.format('YYYY-MM-DD'));
    if (endDate) params.append('endDate', endDate.format('YYYY-MM-DD'));
    if (reportType !== 'all') params.append('type', reportType);

    const token = localStorage.getItem('token');
    const url = `${API_URL}/api/reports/export/excel?${params.toString()}`;
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    
    // Add authorization header via fetch
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.format('YYYY-MM-DD'));
    if (endDate) params.append('endDate', endDate.format('YYYY-MM-DD'));

    const token = localStorage.getItem('token');
    const url = `${API_URL}/api/reports/export/pdf?${params.toString()}`;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_report_${dayjs().format('YYYY-MM-DD')}.pdf`);
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate Report
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Report Type"
                    fullWidth
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="all">All Transactions</MenuItem>
                    <MenuItem value="INBOUND">Inbound Only</MenuItem>
                    <MenuItem value="OUTBOUND">Outbound Only</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={handleExportExcel}
                  fullWidth
                >
                  Export to Excel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPDF}
                  fullWidth
                >
                  Export to PDF
                </Button>
              </Box>
            </LocalizationProvider>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Report Types
            </Typography>
            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              <strong>Excel Report:</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>Detailed transaction list</li>
              <li>Sortable columns</li>
              <li>Can be opened in Excel/Sheets</li>
              <li>Perfect for analysis</li>
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>PDF Report:</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Professional layout</li>
              <li>Summary statistics</li>
              <li>Ready to print</li>
              <li>Archival purposes</li>
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              💡 Tips
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Select date range for specific period</li>
              <li>Filter by transaction type</li>
              <li>Excel for detailed analysis</li>
              <li>PDF for formal reports</li>
              <li>Reports include all transaction details</li>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
