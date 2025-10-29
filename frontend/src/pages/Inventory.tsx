import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  MenuItem,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FileDownload } from '@mui/icons-material';
import api from '../services/api';

export default function Inventory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterBarcode, setFilterBarcode] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, filterType]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        limit: pageSize,
      };
      if (filterType) params.type = filterType;
      if (filterBarcode) params.barcode = filterBarcode;

      const response = await api.get('/api/inventory/transactions', { params });
      setTransactions(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchTransactions();
  };

  const columns: GridColDef[] = [
    {
      field: 'transactionNo',
      headerName: 'Transaction No',
      width: 180,
    },
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 180,
      valueFormatter: (params) => new Date(params).toLocaleString(),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'INBOUND' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'barcode',
      headerName: 'Barcode',
      width: 150,
    },
    {
      field: 'itemName',
      headerName: 'Item',
      width: 200,
      valueGetter: (params, row) => row?.material?.name || row?.product?.name || row?.barcode || '-',
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      valueFormatter: (params, row) => `${params || 0} ${row?.unit || ''}`,
    },
    {
      field: 'initialWeight',
      headerName: 'Weight (kg)',
      width: 120,
      valueFormatter: (params) => params ? `${params} kg` : '-',
    },
    {
      field: 'shrinkage',
      headerName: 'Shrinkage',
      width: 120,
      valueFormatter: (params) => {
        if (params == null || params === '') return '-';
        const num = typeof params === 'number' ? params : parseFloat(params);
        return isNaN(num) ? '-' : `${num.toFixed(2)} kg`;
      },
    },
    {
      field: 'supplier',
      headerName: 'Supplier/Dest',
      width: 150,
      valueGetter: (params, row) => row?.supplier || row?.destination || '-',
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Transactions</Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/reports/export/excel`, '_blank')}
        >
          Export Excel
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Filter Type"
              fullWidth
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="INBOUND">Inbound</MenuItem>
              <MenuItem value="OUTBOUND">Outbound</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Search Barcode"
              fullWidth
              value={filterBarcode}
              onChange={(e) => setFilterBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" fullWidth onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={transactions}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          rowsPerPageOptions={[10, 20, 50, 100]}
          loading={loading}
          disableSelectionOnClick
        />
      </Paper>
    </Box>
  );
}
