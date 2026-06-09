'use client';

import { useRouter } from 'next/navigation';
import { type Worker } from '@/api/backend/workers/GetWorker';
import { UpdateWorker } from '@/api/backend/workers/UpdateWorker';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { getDirtyFields } from '@/domain/crud/getDirtyFields';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { WORKER_STATUS, WORKER_TYPE } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

interface WorkerFromProps {
  worker: Worker;
}

export type FormSchemaType = z.output<typeof FormSchema>;
const FormSchema = z.object({
  type: z.string(),
  url: z.string(),
  account: z.string(),
  name: z.string(),
  phone: z.string(),
  postalCode: z.string(),
  birthday: z.coerce.date(),
  email: z.literal('').or(z.string().email()),
  simCardNumber: z.string(),
  activationAt: z.coerce.date(),
  remark: z.string(),
  status: z.coerce.number(),
});

export function WorkerForm({ worker }: WorkerFromProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, dirtyFields, defaultValues },
    getValues,
  } = useForm<z.input<typeof FormSchema>>({
    values: {
      type: worker.type,
      url: worker.url,
      account: worker.account,
      name: worker.name,
      phone: worker.phone,
      postalCode: worker.postalCode,
      birthday: new Date(worker.birthday),
      email: worker.email,
      simCardNumber: worker.simCardNumber,
      activationAt: new Date(worker.activationAt),
      remark: worker.remark,
      status: worker.status,
    },
    resolver: zodResolver(FormSchema),
  });

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const havePermissions = useHavePermissions();
  const handleApiError = useHandleApiError();

  return (
    <Card
      sx={{ py: 2, px: 3 }}
      component="form"
      onSubmit={handleSubmit(async (data) => {
        const dirtyValues = getDirtyFields(data, dirtyFields);
        if (Object.keys(dirtyValues).length === 0) return;

        const res = await UpdateWorker(worker.id, dirtyValues);
        if (res.error) {
          handleApiError(res.error);
          return;
        }
        enqueueSnackbar('更新成功', { variant: 'success' });
        if (process.env.NODE_ENV !== 'development') {
          router.push('/dashboard/workers');
        }
      })}
    >
      <Stack direction="row" columnGap={2}>
        <Typography variant="h6">物品資訊</Typography>
        <Box sx={{ ml: 'auto' }} />
        {process.env.NODE_ENV === 'development' && <Button onClick={() => router.refresh()}>Refetch</Button>}
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={() => {
              console.log('values', getValues());
              console.log('dirtyFields', dirtyFields);
              console.log('defaultValues', defaultValues);
            }}
          >
            Log values
          </Button>
        )}

        {/* {isDirty && (
          <Button type="button" color="secondary" variant="text" onClick={reset}>
            重設
          </Button>
        )} */}
        <HavePermissionsOnly permissions={['UpdateWorker']}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            送出
          </Button>
        </HavePermissionsOnly>
      </Stack>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>類型</InputLabel>
                <Select
                  {...field}
                  label="類型"
                  fullWidth
                  readOnly={!havePermissions([{ key: 'UpdateWorker', fields: ['type'] }])}
                >
                  {WORKER_TYPE.data.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.message}
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="url"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="IP"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['url'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="account"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="帳號"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['account'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="名稱"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['name'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="電話"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['phone'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="postalCode"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="郵遞區號"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['postalCode'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="birthday"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <DatePicker
                  {...field}
                  label="生日"
                  format="yyyy/MM/dd"
                  readOnly={!havePermissions([{ key: 'UpdateWorker', fields: ['birthday'] }])}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="信箱"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['email'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="simCardNumber"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="SIM 卡號"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['simCardNumber'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="activationAt"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <DateTimePicker
                  {...field}
                  label="啟用時間"
                  format="yyyy/MM/dd HH:mm:ss"
                  timeSteps={{ minutes: 1 }}
                  readOnly={!havePermissions([{ key: 'UpdateWorker', fields: ['activationAt'] }])}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>狀態</InputLabel>
                <Select
                  {...field}
                  label="狀態"
                  fullWidth
                  readOnly={!havePermissions([{ key: 'UpdateWorker', fields: ['status'] }])}
                >
                  {WORKER_STATUS.data.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.message}
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="remark"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="備註"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  InputProps={{ readOnly: !havePermissions([{ key: 'UpdateWorker', fields: ['remark'] }]) }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
