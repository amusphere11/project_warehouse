import React, { useEffect, useState } from 'react';
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
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';
import { FileDownload } from '@mui/icons-material';
import api from '../services/api';

// Types
interface InventoryTransaction {
  id: string;
  transactionNo: string;
  transactionDate: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  itemType: 'MATERIAL' | 'PRODUCT';
  barcode: string;
  quantity: number;
  unit: string;
  initialWeight?: number;
  currentWeight?: number;
  shrinkage?: number;
  referenceNo?: string;
  supplier?: string;
  destination?: string;
  notes?: string;
  material?: {
    id: string;
    name: string;
    barcode: string;
    unit: string;
  };
  product?: {
    id: string;
    name: string;
    barcode: string;
    unit: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function Inventory() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
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
      
      // Debug logging
      console.log('=== INVENTORY API DEBUG ===');
      console.log('Full API Response:', response.data);
      console.log('Transactions count:', response.data.data?.length);
      
      if (response.data.data && response.data.data.length > 0) {
        const firstTx = response.data.data[0];
        console.log('First Transaction Sample:', firstTx);
        console.log('- transactionNo:', firstTx.transactionNo, typeof firstTx.transactionNo);
        console.log('- transactionDate:', firstTx.transactionDate, typeof firstTx.transactionDate);
        console.log('- quantity:', firstTx.quantity, typeof firstTx.quantity);
        console.log('- unit:', firstTx.unit, typeof firstTx.unit);
        console.log('- initialWeight:', firstTx.initialWeight, typeof firstTx.initialWeight);
        console.log('- shrinkage:', firstTx.shrinkage, typeof firstTx.shrinkage);
        console.log('- material:', firstTx.material);
        console.log('- product:', firstTx.product);
      }
      console.log('=========================');
      
      setTransactions(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
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

  const columns: GridColDef<InventoryTransaction>[] = [
    {
      field: 'transactionNo',
      headerName: 'Transaction No',
      width: 180,
    },
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 180,
      valueGetter: (value: any) => {
        if (!value) return '-';
        try {
          return new Date(value).toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          return '-';
        }
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params: any) => (
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
      valueGetter: (_value: any, row: InventoryTransaction) => {
        return row?.material?.name || row?.product?.name || row?.barcode || '-';
      },
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      valueGetter: (value: any, row: InventoryTransaction) => {
        const qty = value || 0;
        const unit = row?.unit || '';
        return `${qty} ${unit}`.trim();
      },
    },
    {
      field: 'initialWeight',
      headerName: 'Weight (kg)',
      width: 120,
      valueGetter: (value: any) => {
        return value ? `${value} kg` : '-';
      },
    },
    {
      field: 'shrinkage',
      headerName: 'Shrinkage',
      width: 120,
      valueGetter: (value: any) => {
        if (value == null || value === '') return '-';
        const num = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(num) ? '-' : `${num.toFixed(2)} kg`;
      },
    },
    {
      field: 'supplier',
      headerName: 'Supplier/Dest',
      width: 150,
      valueGetter: (_value: any, row: InventoryTransaction) => {
        return row?.supplier || row?.destination || '-';
      },
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterType(e.target.value)}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterBarcode(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
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
