import { TableCell, TableRow } from '@mui/material';

export default function EmptyTableRow() {
  return (
    <TableRow>
      <TableCell colSpan={999} sx={{ textAlign: 'center', py: 3 }}>
        No results
      </TableCell>
    </TableRow>
  );
}
