import { Box, Button, Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import config from '../../config.json';

const quickLinks = [
  { title: 'Sources',       description: 'Browse franchise pages and drill into connected character casts.', to: '/sources' },
  { title: 'Upload images', description: 'Add art and attach it to existing character records.',             to: '/images/new' },
];

function RouteIndex() {
  return (
    <Stack spacing={4} sx={{ py: 2 }}>
      <Box>
        <Typography variant='h5' gutterBottom>
          {config.WEBSITE_NAME}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Character database — browse sources, relationships, and image records.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <Button component={Link} to='/sources'  variant='contained' color='primary'>Browse sources</Button>
          <Button component={Link} to='/register' variant='text'      color='primary'>Create account</Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {quickLinks.map((link) => (
          <Grid key={link.title} item size={{ xs: 12, sm: 6 }}>
            <Card elevation={1}>
              <CardActionArea component={Link} to={link.to}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>{link.title}</Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>{link.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default RouteIndex;