import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Stack, Typography } from '@mui/material';
import { getAPIUrl } from '../../helpers/API';

function RouteSourcesList() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${getAPIUrl()}/sources/get/all`);
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
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Sources ({Object.keys(data).length})
      </Typography>
      <Stack spacing={2}>
        {Object.keys(data).map((key) => (
          <div key={key}>
            <Typography variant="h6" component="h2">{key}</Typography>
            <Stack direction="column" spacing={1}>
              {data[key].map((source) => (
                <Link key={source.id} to={`/sources/${source.id}`} style={{ textDecoration: 'none' }}>
                  <Typography variant="body1" component="p">
                    {source.name} ({source.characters?.length})
                  </Typography>
                </Link>
              ))}
            </Stack>
          </div>
        ))}
      </Stack>
    </>
  );
}

export default RouteSourcesList;
