'use client'
import { Container, Typography, Box, AppBar, Toolbar, Button, IconButton, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'; // Pro plan icon
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'; // Basic plan icon
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'; // Free plan icon
import { loadStripe } from '@stripe/stripe-js';

const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
};

export default function Home() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded, reauthenticate } = useUser();
  const [loading, setLoading] = useState(true);
  const [subscriptionType, setSubscriptionType] = useState('Free');

  useEffect(() => {
    if (isLoaded && user) {
      setSubscriptionType(user.publicMetadata?.subscriptionType || 'Free');
      setLoading(false);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const checkSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (sessionId && isSignedIn) {
        try {
          const response = await fetch(`/api/checkout_session?session_id=${sessionId}`);
          const sessionData = await response.json();

          if (sessionData && sessionData.payment_status === 'paid') {
            // Update user's subscription to Pro or Basic based on the payment
            await fetch('/api/update_subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.id, subscriptionType: 'Pro' }),
            });

            // Re-authenticate to refresh user data
            await reauthenticate();
            setSubscriptionType('Pro');

            // Redirect to the main page
            router.push('/');
          } else {
            router.push('/payment-failed');
          }
        } catch (error) {
          console.error('Error checking session:', error);
          router.push('/payment-failed');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      checkSession();
    }
  }, [isSignedIn, router, user, reauthenticate]);

  const handleGetStarted = () => {
    router.push('/sign-in');
  };

  const handleSubmit = async () => {
    const checkoutSession = await fetch('api/checkout_session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://localhost:3000',
      },
      body: JSON.stringify({ plan: 'pro'}),
    });

    const checkoutSessionJson = await checkoutSession.json();

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  const handleBasicSubmit = async () => {
    const checkoutSession = await fetch('api/checkout_session', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
      body: JSON.stringify({ plan: 'basic' }) // Specify that this is for the Basic plan
    });

    const checkoutSessionJson = await checkoutSession.json();

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  const renderPlanIcon = () => {
    switch (subscriptionType) {
      case 'Pro':
        return <MilitaryTechIcon sx={{ color: '#fff', mr: 2 }} />;
      case 'Basic':
        return <WorkspacePremiumIcon sx={{ color: '#fff', mr: 2 }} />;
      default:
        return <EmojiEmotionsIcon sx={{ color: '#fff', mr: 2 }} />;
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflowX: 'hidden' }}>
      <Head>
        <title>Flashcard SaaS</title>
        <meta name="description" content="Create flashcards from your text" />
      </Head>

      <video
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        <source src="/video1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <AppBar position="static" sx={{ background: 'rgba(0, 0, 0, 0.7)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>
            Flashcard SaaS
          </Typography>
          <SignedOut>
            <Button color="inherit" href="sign-in">
              Login
            </Button>
            <Button color="inherit" href="sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <Typography variant="body1" sx={{ color: '#fff', mr: 2 }}>
              {subscriptionType} Plan
            </Typography>
            {renderPlanIcon()}
            <Button color="inherit" onClick={() => router.push('/flashcards')} sx={{ mr: 2 }}>
              Saved
            </Button>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box sx={{ textAlign: 'center', my: 4, color: '#000', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              fontWeight: 700,
              background: 'linear-gradient(90deg, #000000, #333333)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
              animation: 'fadeText 3s ease-in-out infinite',
            }}
          >
            Welcome to Flashcard SaaS
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
              mb: 3,
              background: 'linear-gradient(90deg, #333333, #666666)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
              animation: 'fadeText 3s ease-in-out infinite',
            }}
          >
            The easiest way to make flashcards from your text
          </Typography>
          <SignedIn>
            <Button variant="contained" color="primary" sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, py: 1, px: 3 }} onClick={() => router.push('/generate')}>
              Get Started
            </Button>
          </SignedIn>
          <SignedOut>
            <Button variant="contained" color="primary" sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, py: 1, px: 3 }} onClick={handleGetStarted}>
              Get Started
            </Button>
          </SignedOut>
        </Box>

        <Box
          sx={{
            my: 6,
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              display: 'inline-block',
              animation: 'softGlow 1.5s ease-in-out infinite, subtleZoom 6s ease-in-out infinite',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ff6b6b, #f3a683, #78e08f, #60a3bc, #6a89cc)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            Make learning fun with smart flashcards
          </Typography>
        </Box>

        <Box sx={{ my: 6 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, color: '#fff', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            Pricing
          </Typography>
          <Grid container justifyContent="center" alignItems="center" spacing={3}>
            <Grid
              item
              xs={12}
              sm={6}
              md={5}
              sx={{
                textAlign: 'center',
                background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
                borderRadius: { xs: '15px 15px 0 0', md: '15px 0 0 15px' },
                p: 3,
                minWidth: '240px',
                minHeight: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                border: '2px solid #333',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: '#fff' }}>
                Basic
              </Typography>
              <Typography variant="h4" sx={{ mb: 1, color: '#fff' }}>
                $5 / month
              </Typography>
              <Typography sx={{ mb: 1, color: '#fff' }}>Access to basic flashcard features and limited storage.</Typography>
              <Button variant="contained" color="primary" onClick={handleBasicSubmit}>
                Choose Basic
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={5}
              sx={{
                textAlign: 'center',
                background: 'linear-gradient(120deg, #ff9a9e 0%, #fad0c4 100%)',
                borderRadius: { xs: '0 0 15px 15px', md: '0 15px 15px 0' },
                p: 3,
                minWidth: '240px',
                minHeight: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                border: '2px solid #333',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: '#fff' }}>
                Pro
              </Typography>
              <Typography variant="h4" sx={{ mb: 1, color: '#fff' }}>
                $10 / month
              </Typography>
              <Typography sx={{ mb: 1, color: '#fff' }}>Advanced features, unlimited flashcards, and priority support.</Typography>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Choose Pro
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Footer Section */}
        <Box sx={{ textAlign: 'center', mt: 8, mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#333', fontSize: { xs: '0.9rem', md: '1rem' } }}>
            © 2024 Khalilullah Mohman. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <IconButton
              component="a"
              href="https://github.com/your-github-profile"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#333', mr: 1 }}
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://linkedin.com/in/your-linkedin-profile"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#333', ml: 1 }}
            >
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>

      <style jsx>{`
        @keyframes fadeText {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes softGlow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 0, 0, 0.3);
          }
          50% {
            text-shadow: 0 0 15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 0, 0, 0.5), 0 0 35px rgba(0, 0, 0, 0.4);
          }
        }

        @keyframes subtleZoom {
          0%, 100% {
            transform: scale(1);
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
