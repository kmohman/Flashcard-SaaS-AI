'use client'
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';
import { CardActionArea, CardContent, Typography, Container, Grid, Card, CircularProgress, Box, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFlashcard, setSelectedFlashcard] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return;

            try {
                const docRef = doc(collection(db, 'users'), user.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const collections = docSnap.data().flashcards || [];
                    setFlashcards(collections);
                } else {
                    await setDoc(docRef, { flashcards: [] });
                }
            } catch (error) {
                console.error('Error fetching flashcards:', error);
            } finally {
                setLoading(false);
            }
        }

        if (isSignedIn) {
            getFlashcards();
        } else {
            setLoading(false);
        }
    }, [user, isSignedIn]);

    const handleDeleteFlashcard = async () => {
        if (!selectedFlashcard) return;

        try {
            const userDocRef = doc(collection(db, 'users'), user.id);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || [];
                const updatedCollections = collections.filter(f => f.name !== selectedFlashcard);

                await setDoc(userDocRef, { flashcards: updatedCollections }, { merge: true });
                setFlashcards(updatedCollections);
                setDeleteDialogOpen(false);
            }
        } catch (error) {
            console.error('Error deleting flashcard:', error);
        }
    };

    const handleOpenDeleteDialog = (flashcardName) => {
        setSelectedFlashcard(flashcardName);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setSelectedFlashcard(null);
        setDeleteDialogOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isLoaded || !isSignedIn) {
        return <Typography variant="h6" align="center" sx={{ mt: 4 }}>Please sign in to view your flashcards.</Typography>;
    }

    if (flashcards.length === 0) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
               <Typography variant="h6" align="center">
    You don&apos;t have any flashcard collections yet. Start by creating one!
</Typography>
            </Container>
        );
    }

    const handleCardClick = (id) => {
        router.push(`/flashcard?id=${id}`);
    };

    const cardColors = [
        'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
        'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)'
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* Back Button */}
            <IconButton sx={{ color: '#333', mb: 2 }} onClick={() => router.push('/')}>
                <ArrowBackIcon />
            </IconButton>

            <Typography variant="h4" align="center" gutterBottom>
                Your Flashcard Collections
            </Typography>
            <Grid container spacing={4}>
                {flashcards.map((flashcard, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card 
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                transition: 'transform 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
                                },
                                background: cardColors[index % cardColors.length],
                                borderRadius: '12px',
                                padding: 2,
                                position: 'relative',
                            }}
                        >
                            <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#333',
                                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                                        }}
                                    >
                                        {flashcard.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <IconButton 
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: '#ff6b6b',
                                }}
                                onClick={() => handleOpenDeleteDialog(flashcard.name)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete Flashcard Collection</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this flashcard collection? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteFlashcard} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
