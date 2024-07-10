'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { AdminDeleteItemPhoto } from '@/api/backend/items/AdminDeleteItemPhoto';
import { AdminReorderItemPhoto } from '@/api/backend/items/adminReorderItemPhoto';
import { AdminUpsertItemPhoto } from '@/api/backend/items/adminUpsertItemPhoto';
import { type Item } from '@/api/backend/items/getItem';
import { useObjectURL } from '@/helper/useObjectURL';
import { zodResolver } from '@hookform/resolvers/zod';
import ClearIcon from '@mui/icons-material/Clear';
import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import { Button, colors, IconButton, useTheme } from '@mui/material';
import Card from '@mui/material/Card';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import { useGesture } from '@use-gesture/react';
import { useMotionValue } from 'framer-motion';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { HavePermissionsOnly } from '@/contexts/UserContext';

const PhotoListSchema = z.object({
  photos: z
    .array(
      z.union([
        z.object({ photo: z.string(), sorted: z.number() }),
        z.instanceof(File).refine((file) => file.size <= 20 * 1024 * 1024, { message: '上限 20MB' }),
      ])
    )
    .min(1, { message: '最少 1 張' })
    .max(30, { message: '最多 30 張' }),
});

export default function PhotoListSection({ item }: { item: Item }) {
  const theme = useTheme();
  const { control } = useForm<z.input<typeof PhotoListSchema>>({
    defaultValues: {
      photos: item.photos ?? [],
    },
    resolver: zodResolver(PhotoListSchema),
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: 'photos',
  });
  const [isPending, startTransition] = useTransition();
  const { createUrl, revokeUrl } = useObjectURL();
  const containerRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState<HTMLElement | null>(null);
  const draggingXy = useMotionValue<[number, number]>([0, 0]);
  const [onto, setOnto] = useState<HTMLElement | null>(null);
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const bind = useGesture({
    onDrag: ({ args, active, xy }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const i: number = args[0];
      if (!active) return;
      setIsDragging(refs.current[i]);
      draggingXy.set(xy);
      const target = refs.current.find((el) => el && document.elementsFromPoint(...xy).includes(el));
      if (!target) {
        setOnto(null);
        setSide(null);
        return;
      }
      setOnto(target);
      const rect = target.getBoundingClientRect();
      const side = xy[0] < rect.x + rect.width / 2 ? 'left' : 'right';
      setSide(side);
    },
    onDragEnd: ({ args }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const i: number = args[0];
      setIsDragging(null);
      draggingXy.set([0, 0]);
      setOnto(null);
      setSide(null);
      if (onto && side) {
        const ontoI = refs.current.indexOf(onto);
        if (ontoI === i) return;
        if (side === 'left' && ontoI - 1 === i) return;
        if (side === 'right' && ontoI + 1 === i) return;

        startTransition(async () => {
          await AdminReorderItemPhoto(item.id, {
            originalSorted: i + 1,
            newSorted: ontoI + 1,
          });
          move(i, ontoI);
        });
      }
    },
  });

  return (
    <Card sx={{ py: 2, px: 3, position: 'relative' }}>
      {isPending && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'inherit',
          }}
        />
      )}

      <Stack direction="row" columnGap={2} justifyContent="space-between">
        <Typography variant="h6">
          物品照片{' '}
          <Typography component="span" variant="body2" color="GrayText">
            (自動儲存)
          </Typography>
        </Typography>

        <HavePermissionsOnly permissionKeys={['AdminUpsertItemPhoto']}>
          <Button type="button" variant="contained" onClick={() => document.getElementById('file-upload')?.click()}>
            新增
          </Button>
        </HavePermissionsOnly>

        <input
          id="file-upload"
          name="file-upload"
          type="file"
          hidden
          multiple
          onChange={async (e) => {
            const files = e.target.files;
            if (!files) return;
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
              formData.append('photo', files[i]);
              formData.append('sorted', `${i + item.photos.length + 1}`);
            }
            startTransition(async () => {
              await AdminUpsertItemPhoto(item.id, formData);
              for (const f of Array.from(files)) {
                append(f);
              }
            });
          }}
        />
      </Stack>

      <Box position="relative" overflow="hidden">
        {isDragging && (
          <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 2, transform: 'translateX(-50%)' }}>
            <ScrollPad whileHover={() => containerRef.current?.scrollBy({ left: -5 })} />
          </Box>
        )}

        <Box ref={containerRef} position="relative" sx={{ overflowX: 'auto' }}>
          <Stack direction="row" mt={1} mx={-1}>
            {fields.map((field, i) => (
              <Controller
                key={field.id}
                name={`photos.${i}`}
                control={control}
                render={({ field, fieldState }) => (
                  <Box
                    ref={(el: HTMLElement) => {
                      refs.current[i] = el;
                    }}
                    sx={{
                      borderWidth: 0,
                      borderStyle: 'solid',
                      borderColor: theme.palette.primary.main,
                      position: 'relative',
                      px: 1,
                      borderLeftWidth: onto === refs.current[i] && side === 'left' ? 2 : 0,
                      borderRightWidth: onto === refs.current[i] && side === 'right' ? 2 : 0,
                    }}
                  >
                    <Box component="article" sx={{ backgroundColor: colors.grey[100], position: 'relative' }}>
                      <Box
                        component="img"
                        sx={{
                          width: 320,
                          aspectRatio: '16/10',
                          pointerEvents: 'none',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          borderRadius: 1,
                        }}
                        src={'photo' in field.value ? field.value.photo : createUrl(field.value)}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ position: 'absolute', top: 0, right: 0, height: 'fit-content', pr: 1, pt: 1 }}
                      >
                        <HavePermissionsOnly permissionKeys={['AdminDeleteItemPhoto']}>
                          <IconButton
                            type="button"
                            sx={{
                              backgroundColor: '#fff',
                              opacity: 0.8,
                              ':hover': { backgroundColor: '#fff', opacity: 1 },
                            }}
                            size="small"
                            onClick={() => {
                              startTransition(async () => {
                                field.value instanceof File && revokeUrl(field.value);
                                await AdminDeleteItemPhoto(item.id, i + 1);
                                remove(i);
                              });
                            }}
                          >
                            <Box sx={visuallyHidden}>刪除</Box>
                            <ClearIcon />
                          </IconButton>
                        </HavePermissionsOnly>

                        <HavePermissionsOnly permissionKeys={['AdminReorderItemPhoto']}>
                          <IconButton
                            type="button"
                            size="small"
                            sx={{
                              touchAction: 'none',
                              backgroundColor: '#fff',
                              opacity: 0.8,
                              ':hover': { backgroundColor: '#fff', opacity: 1 },
                            }}
                            {...bind(i)}
                          >
                            <DragHandleOutlinedIcon sx={{ transform: 'rotate(90deg)' }} />
                          </IconButton>
                        </HavePermissionsOnly>
                      </Stack>
                    </Box>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </Box>
                )}
              />
            ))}
          </Stack>
        </Box>

        {isDragging && (
          <Box sx={{ position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 2, transform: 'translateX(50%)' }}>
            <ScrollPad whileHover={() => containerRef.current?.scrollBy({ left: 5 })} />
          </Box>
        )}
      </Box>
    </Card>
  );
}

function ScrollPad({ whileHover }: { whileHover?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    function handle(e: PointerEvent) {
      const hovered = !!ref.current && document.elementsFromPoint(e.clientX, e.clientY).includes(ref.current);
      setActive(hovered);
    }
    document.addEventListener('pointermove', handle);
    return () => document.removeEventListener('pointermove', handle);
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      whileHover?.();
    }, 20);
    return () => clearInterval(id);
  }, [active, whileHover]);

  return (
    <Box
      ref={ref}
      sx={{
        height: '100%',
        maxHeight: '100%',
        width: 80,
      }}
    >
      <Box
        sx={{
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          borderRadius: 99999,
          background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.2) 50%, transparent)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    </Box>
  );
}
