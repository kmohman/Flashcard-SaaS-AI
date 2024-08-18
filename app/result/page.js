'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { CircularProgress, Container, Typography, Box } from '@mui/material';
import { useUser } from '@clerk/nextjs';

const ResultPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session_id = searchParams.get('session_id');
    const { user, isLoaded } = useUser();

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCheckoutSession = async () => {
            if (!session_id || !isLoaded || !user) return;

            try {
                const res = await fetch(`/api/checkout_session?session_id=${session_id}`);
                const sessionData = await res.json();
                if (res.ok) {
                    setSession(sessionData);
                    if (sessionData.payment_status === 'paid') {
                        // Assuming the server updates Clerk metadata, just redirect to the main page
                        router.push('/');
                    }
                } else {
                    setError(sessionData.error || 'Failed to retrieve session.');
                }
            } catch (err) {
                console.log(err);
                setError('An error occurred while fetching the session.');
            } finally {
                setLoading(false);
            }
        };

        fetchCheckoutSession();
    }, [session_id, isLoaded, user, router]);

    if (loading) {
        return (
            <Container
                maxWidth="100vw"
                sx={{
                    textAlign: 'center',
                    mt: 4,
                }}
            >
                <CircularProgress />
                <Typography variant="h6">Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                maxWidth="100vw"
                sx={{
                    textAlign: 'center',
                    mt: 4,
                }}
            >
                <Typography variant="h6">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container
            maxWidth="100vw"
            sx={{
                textAlign: 'center',
                mt: 4,
            }}
        >
            {session?.payment_status === 'paid' ? (
                <>
                    <Typography variant="h4">Thank you for your purchase!</Typography>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body1">
                            We have received your payment. You will receive an email with the order details shortly.
                        </Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="h4">Payment Failed</Typography>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body1">
                            Your payment was not successful. Please try again.
                        </Typography>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default ResultPage;
