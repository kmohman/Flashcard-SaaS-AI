'use client';

import { useUser } from '@clerk/nextjs';
import { Container, Box, Typography, Paper, TextField, Button, Card, CardActionArea, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { writeBatch, doc, collection, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import VerifiedIcon from '@mui/icons-material/Verified';

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const subscriptionType = user?.publicMetadata?.subscriptionType || 'Free';
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'x-subscription-type': subscriptionType,
                },
                body: text,
            });

            if (!response.ok) {
                throw new Error('Failed to generate flashcards');
            }

            const data = await response.json();

            if (data.error) {
                alert(data.error);
            } else {
                setFlashcards(data);
            }
        } catch (error) {
            console.error('Error generating flashcards:', error);
            alert('An error occurred while generating flashcards.');
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name');
            return;
        }

        const batch = writeBatch(db);
        const userDocRef = doc(collection(db, 'users'), user.id);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || [];
            if (collections.find((f) => f.name === name)) {
                alert('Flashcard collection with the same name already exists.');
                return;
            } else {
                collections.push({ name });
                batch.set(userDocRef, { flashcards: collections }, { merge: true });
            }
        } else {
            batch.set(userDocRef, { flashcards: [{ name }] });
        }

        const colRef = collection(userDocRef, name);
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef);
            batch.set(cardDocRef, flashcard);
        });

        await batch.commit();
        handleClose();
        router.push('/flashcards');
    };

    // Listen for Enter key press to submit the form
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && text.trim()) {
                handleSubmit();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [text]);

    return (
        <Container
            maxWidth="false"
            sx={{
                backgroundColor: '#121212',
                minHeight: '100vh',
                color: '#ffffff',
                padding: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Top Panel with Back and Saved Flashcards Buttons */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <IconButton sx={{ color: '#ffffff' }} onClick={() => router.push('/')}>
                    <ArrowBackIcon />
                </IconButton>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<SaveIcon />}
                    onClick={() => router.push('/flashcards')}
                    sx={{
                        backgroundColor: '#5b86e5',
                        color: '#ffffff',
                    }}
                >
                    Saved Flashcards
                </Button>
            </Box>

            <Box
                sx={{
                    width: '100%',
                    maxWidth: '800px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #333333 0%, #1c1c1c 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.7)',
                    padding: 4,
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: 3,
                        color: '#ffffff',
                    }}
                >
                    Create Your Flashcards
                </Typography>
                <Paper sx={{ p: 4, width: '100%', background: '#424242', borderRadius: 2 }}>
                    <TextField
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        label="Enter text to generate flashcards"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
                            mb: 2,
                            backgroundColor: '#333333',
                            color: '#ffffff',
                            '& .MuiInputBase-input': {
                                color: '#ffffff',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#ffffff',
                            },
                        }}
                        InputLabelProps={{
                            style: { color: '#ffffff' },
                        }}
                    />
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSubmit}
                        fullWidth
                        disabled={loading}
                        sx={{ background: 'linear-gradient(90deg, #36d1dc, #5b86e5)' }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Generate Flashcards'}
                    </Button>
                </Paper>
            </Box>
            {flashcards.length > 0 && (
                <Box sx={{ mt: 4, width: '100%', maxWidth: '800px' }}>
                    <Typography variant="h5" sx={{ textAlign: 'center', mb: 3 }}>
                        Flashcard Preview
                    </Typography>
                    <Grid container spacing={3}>
                        {flashcards.map((flashcard, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card sx={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', borderRadius: 2, background: '#424242' }}>
                                    <CardActionArea onClick={() => handleCardClick(index)}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    perspective: '1000px',
                                                    '& > div': {
                                                        transition: 'transform 0.6s',
                                                        transformStyle: 'preserve-3d',
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '200px',
                                                        boxShadow: '0 4px 8px 0 rgba(0,0,0, 0.4)',
                                                        transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                        borderRadius: 2,
                                                        background: 'linear-gradient(135deg, #333333 0%, #1c1c1c 100%)',
                                                    },
                                                    '& > div > div': {
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                        backfaceVisibility: 'hidden',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        padding: 2,
                                                        boxSizing: 'border-box',
                                                    },
                                                    '& > div > div:nth-of-type(2)': {
                                                        transform: 'rotateY(180deg)',
                                                    },
                                                }}
                                            >
                                                <div>
                                                    <div>
                                                        <Typography variant="h5" component="div" sx={{ color: '#ffffff' }}>
                                                            {flashcard.front}
                                                        </Typography>
                                                    </div>
                                                    <div>
                                                        <Typography variant="h5" component="div" sx={{ color: '#bbbbbb' }}>
                                                            {flashcard.back}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button variant='contained' color='secondary' onClick={handleOpen}>
                            Save Flashcards
                        </Button>
                    </Box>
                </Box>
            )}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ color: '#ffffff', backgroundColor: '#333333' }}>Save Flashcards</DialogTitle>
                <DialogContent sx={{ backgroundColor: '#333333' }}>
                    <DialogContentText sx={{ color: '#ffffff' }}>
                        Please enter a name for your flashcards collection
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin='dense'
                        label="Collection Name"
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                        sx={{
                            backgroundColor: '#424242',
                            color: '#ffffff',
                            '& .MuiInputBase-input': {
                                color: '#ffffff',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#ffffff',
                            },
                        }}
                        InputLabelProps={{
                            style: { color: '#ffffff' },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#333333' }}>
                    <Button onClick={handleClose} sx={{ color: '#ffffff' }}>Cancel</Button>
                    <Button onClick={saveFlashcards} sx={{ color: '#ffffff' }}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Footer Section */}
            <Box sx={{ textAlign: 'center', mt: 8, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#333', fontSize: { xs: '0.9rem', md: '1rem' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    © 2024 Khalilullah Mohman. All rights reserved.
                    <VerifiedIcon sx={{ ml: 1, fontSize: '1.2rem', color: '#00e5ff' }} />
                </Typography>
            </Box>
        </Container>
    );
}
