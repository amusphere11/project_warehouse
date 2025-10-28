import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';
import api from '../services/api';

export default function Scanning() {
  const [barcode, setBarcode] = useState('');
  const [type, setType] = useState('INBOUND');
  const [itemType, setItemType] = useState('MATERIAL');
  const [quantity, setQuantity] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [supplier, setSupplier] = useState('');
  const [destination, setDestination] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/api/inventory/scan', {
        barcode,
        type,
        itemType,
        quantity: parseFloat(quantity),
        unit: 'kg', // You can make this dynamic
        initialWeight: initialWeight ? parseFloat(initialWeight) : null,
        supplier: type === 'INBOUND' ? supplier : null,
        destination: type === 'OUTBOUND' ? destination : null,
        referenceNo,
        notes,
      });

      setLastScan(response.data.data);
      setSuccess(`✅ Scan successful! Transaction: ${response.data.data.transactionNo}`);
      
      // Reset form
      setBarcode('');
      setQuantity('');
      setInitialWeight('');
      setSupplier('');
      setDestination('');
      setReferenceNo('');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
        Barcode Scanning
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scan Item
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleScan}>
              <TextField
                label="Barcode"
                fullWidth
                margin="normal"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                required
                autoFocus
                placeholder="Scan or type barcode"
                className="barcode-input"
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Transaction Type"
                    fullWidth
                    margin="normal"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="INBOUND">Inbound (Masuk)</MenuItem>
                    <MenuItem value="OUTBOUND">Outbound (Keluar)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Item Type"
                    fullWidth
                    margin="normal"
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                  >
                    <MenuItem value="MATERIAL">Material</MenuItem>
                    <MenuItem value="PRODUCT">Product</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Initial Weight (kg)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(e.target.value)}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
              </Grid>

              {type === 'INBOUND' && (
                <TextField
                  label="Supplier"
                  fullWidth
                  margin="normal"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              )}

              {type === 'OUTBOUND' && (
                <TextField
                  label="Destination"
                  fullWidth
                  margin="normal"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              )}

              <TextField
                label="Reference No (PO/DO/Invoice)"
                fullWidth
                margin="normal"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />

              <TextField
                label="Notes"
                fullWidth
                margin="normal"
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Scan & Record'}
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {lastScan && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Last Scan Result
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction No:
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {lastScan.transactionNo}
                  </Typography>

                  <Chip
                    label={lastScan.type}
                    color={lastScan.type === 'INBOUND' ? 'success' : 'error'}
                    sx={{ mr: 1, mb: 2 }}
                  />
                  <Chip label={lastScan.itemType} variant="outlined" sx={{ mb: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    Barcode:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {lastScan.barcode}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Item:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {lastScan.material?.name || lastScan.product?.name || '-'}
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity:
                      </Typography>
                      <Typography variant="h6">
                        {lastScan.quantity} {lastScan.unit}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Weight:
                      </Typography>
                      <Typography variant="h6">
                        {lastScan.initialWeight || '-'} kg
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Scanned at: {new Date(lastScan.transactionDate).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Quick Guide
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Inbound (Barang Masuk):</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Scan barcode material/product</li>
              <li>Input quantity & weight</li>
              <li>Isi supplier & reference no</li>
              <li>Klik "Scan & Record"</li>
            </Typography>

            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              <strong>Outbound (Barang Keluar):</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Scan barcode product</li>
              <li>Input quantity</li>
              <li>Isi destination</li>
              <li>System akan cek stock availability</li>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
