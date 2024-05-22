'use client';

import * as React from 'react';
import { useTransition } from 'react';
import Link from 'next/link';
import { deleteRole } from '@/api/backend/rbac/deleteRole';
import { type Role } from '@/api/backend/rbac/roles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

interface CustomersTableProps {
  rows: Role[];
}

export function RoleTable({ rows }: CustomersTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover key={row.role} selected={false}>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      {row.role}
                    </Stack>
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <IconButton LinkComponent={Link} href={`/dashboard/roles/edit/${row.role}`}>
                        <EditIcon />
                      </IconButton>
                      <DeleteBtn row={row} />
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
    </Card>
  );
}

function DeleteBtn({ row }: { row: Role }) {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <IconButton {...bindTrigger(popupState)}>
        <DeleteIcon />
      </IconButton>
      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: '16px 20px ' }}>
          <Typography variant="subtitle1">Deleting {row.role}</Typography>
          <Typography color="text.secondary" variant="body2">
            Press delete to confirm
          </Typography>
          <Stack direction="row" gap={2} justifyContent="space-between" sx={{ mt: 1 }}>
            <Button variant="text" size="small" onClick={popupState.close}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              variant="contained"
              size="small"
              onClick={() => {
                popupState.close();
                startTransition(async () => {
                  await deleteRole(row.role);
                });
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
