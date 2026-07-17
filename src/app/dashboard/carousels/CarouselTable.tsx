'use client';

import { isDemoMode } from '@/config/demo';
import { type carousel, type carouselGroup } from '@/db/schema';
import { DATE_TIME_FORMAT } from '@/domain/static/static';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { format } from 'date-fns';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import EmptyTableRow from '@/components/EmptyTableRow';

import { deleteCarousel } from './actions';
import EditCarouselDialog from './EditCarouselDialog';

interface CarouselTableProps {
  rows: (typeof carousel.$inferSelect & { group: typeof carouselGroup.$inferSelect.name })[];
  groups: (typeof carouselGroup.$inferSelect)[];
}

export function CarouselTable({ groups, rows }: CarouselTableProps) {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>手機版</TableCell>
                <TableCell>桌面版</TableCell>
                <TableCell>發佈時間</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && <EmptyTableRow />}
              {rows.map((row) => {
                return (
                  <TableRow hover key={row.id} selected={false} sx={{}}>
                    <TableCell>{row.sorted}</TableCell>
                    <TableCell width={9999}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <a href={row.mobileImageUrl} target="_blank" rel="noreferrer">
                          <img
                            src={row.mobileImageUrl}
                            style={{ display: 'block', maxWidth: '100%', maxHeight: 320, margin: 'auto' }}
                            alt=""
                          />
                        </a>
                      </Box>
                    </TableCell>
                    <TableCell width={9999}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <a href={row.desktopImageUrl} style={{ display: 'block' }} target="_blank" rel="noreferrer">
                          <img
                            src={row.desktopImageUrl}
                            style={{ display: 'block', maxWidth: '100%', maxHeight: 320, margin: 'auto' }}
                            alt=""
                          />
                        </a>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        {new Date() > new Date(row.publishAt) ? (
                          <CheckIcon color="success" />
                        ) : (
                          <EventIcon color="disabled" />
                        )}
                        {format(new Date(row.publishAt), DATE_TIME_FORMAT)}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center">
                        {/* <HavePermissionsOnly permissions={['GetAdmin']}> */}
                        <EditCarouselDialog carousel={row} groups={groups} />
                        {/* </HavePermissionsOnly> */}
                        {/* <HavePermissionsOnly permissions={['DeleteAdmin']}> */}
                        <DeleteBtn row={row} />
                        {/* </HavePermissionsOnly> */}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
      </Box>
    </Card>
  );
}

function DeleteBtn({ row }: { row: typeof carousel.$inferSelect }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <IconButton {...bindTrigger(popupState)} disabled={isDemoMode}>
        <DeleteIcon />
      </IconButton>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="刪除輪播圖"
        description="您確定要刪除嗎?"
        onConfirm={async () => {
          await deleteCarousel(row.id);
          enqueueSnackbar(`已刪除`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}
