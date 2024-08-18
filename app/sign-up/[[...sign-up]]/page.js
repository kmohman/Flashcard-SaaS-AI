import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <Box
      sx={{
        height: '100vh', // Full viewport height
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            }}
          >
            Flashcard SaaS
          </Typography>
          <Link href="/sign-in" passHref>
            <Button color="inherit" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Login
            </Button>
          </Link>
          <Link href="/sign-up" passHref>
            <Button color="inherit" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Sign Up
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flexGrow: 1, // Makes the content fill the remaining space
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
          Sign Up
        </Typography>
        <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}> {/* Centered and full width with a max width */}
          <SignUp />
        </Box>
      </Box>
    </Box>
  );
}
