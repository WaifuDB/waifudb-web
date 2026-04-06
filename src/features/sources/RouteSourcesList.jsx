import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { getAPIUrl } from '../../helpers/API';

function RouteSourcesList() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${getAPIUrl()}/sources/get/all/compact`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch sources data');
        }

        const sourcesData = response.data;
        if (!sourcesData) {
          throw new Error('No data found for the sources');
        }

        sourcesData.sort((a, b) => a.name.localeCompare(b.name));

        const groupedSources = sourcesData.reduce((acc, source) => {
          const firstChar = source.name.charAt(0).toUpperCase();
          if (!acc[firstChar]) {
            acc[firstChar] = [];
          }
          acc[firstChar].push(source);
          return acc;
        }, {});

        setData(groupedSources);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <Stack spacing={3}>
      <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '12px' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Directory</Typography>
            <Typography variant="h4" component="h1">
              Sources
            </Typography>
          </Box>
          <Chip label={`${Object.keys(data).length} groups`} color="primary" variant="outlined" />
        </Stack>
      </Paper>
      <Stack spacing={2}>
        {Object.keys(data).map((key) => (
          <Paper key={key} elevation={1} sx={{ p: 2, borderRadius: '12px' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>{key}</Typography>
            <Stack direction="column" spacing={1}>
              {data[key].map((source) => (
                <Link key={source.id} to={`/sources/${source.id}`} style={{ textDecoration: 'none' }}>
                  <Box sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    transition: 'transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(139, 211, 255, 0.06)',
                    },
                  }}>
                    <Typography variant="body1" component="p">
                      {source.name} ({source.character_count || 0})
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}

export default RouteSourcesList;
