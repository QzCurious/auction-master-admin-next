'use client';

import { useEffect, useState } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import useEmblaCarousel from 'embla-carousel-react';

export default function PreviewPhotos({
  photos,
}: {
  photos: Array<{
    sorted: number;
    photo: string;
  }>;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: 0 });
  const [i, setI] = useState(emblaApi?.selectedScrollSnap() ?? 0);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', ({ selectedScrollSnap }) => setI(selectedScrollSnap()));
    }
  }, [emblaApi]);

  return (
    <Box
      ref={emblaRef}
      sx={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row">
        {photos.map(({ photo, sorted }) => (
          <Box key={sorted} sx={{ flex: '0 0 100%', minWidth: 0 }}>
            <Box
              component="img"
              src={photo}
              sx={{
                aspectRatio: '16/10',
                width: '100%',
                height: '100%',
                backgroundColor: grey['100'],
                objectFit: 'contain',
                objectPosition: 'center',
              }}
              alt=""
            />
          </Box>
        ))}
      </Stack>

      {photos.length > 1 && (
        <Stack
          justifyContent="space-between"
          direction="row"
          sx={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <Box
            component="button"
            type="button"
            sx={{
              border: 'none',
              width: '80px',
              height: '100%',
              transition: 'opacity .3s',
              background: 'linear-gradient(90deg, rgba(0, 0, 0, .6) 0%, rgba(0, 0, 0, 0) 100%)',
              opacity: i === 0 ? 0 : 0.5,
              pointerEvents: i === 0 ? 'none' : 'auto',
              ':hover': {
                opacity: 1,
              },
            }}
            onClick={() => emblaApi?.scrollPrev()}
          >
            <Box sx={visuallyHidden}>Move to previous</Box>
            <ArrowBackIosNewIcon sx={{ display: 'block', mr: 'auto', color: '#fff' }} />
          </Box>
          <Box
            component="button"
            type="button"
            sx={{
              border: 'none',
              width: '80px',
              height: '100%',
              transition: 'opacity .3s',
              background: 'linear-gradient(-90deg, rgba(0, 0, 0, .6) 0%, rgba(0, 0, 0, 0) 100%)',
              opacity: i === photos.length - 1 ? 0 : 0.5,
              pointerEvents: i === photos.length - 1 ? 'none' : 'auto',
              ':hover': {
                opacity: 1,
              },
            }}
            onClick={() => emblaApi?.scrollNext()}
          >
            <Box sx={visuallyHidden} className="sr-only">
              Move to next
            </Box>
            <ArrowForwardIosIcon sx={{ display: 'block', ml: 'auto', color: '#fff' }} />
          </Box>
        </Stack>
      )}
    </Box>
  );
}
