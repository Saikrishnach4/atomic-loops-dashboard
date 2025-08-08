
import React from 'react';
import { useHookstate } from '@hookstate/core';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Dashboard() {

    const welcomeMessage = useHookstate("Welcome to Admin Dashboard!");

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                {welcomeMessage.get()}
            </Typography>

            <Card sx={{ p: 3 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        About This Project
                    </Typography>
                    <Typography variant="body1" paragraph>
                        This is a simple admin dashboard built with:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                        <Typography component="li" variant="body1">
                            React for the frontend
                        </Typography>
                        <Typography component="li" variant="body1">
                            Material-UI for styling
                        </Typography>
                        <Typography component="li" variant="body1">
                            Hookstate for state management
                        </Typography>
                        <Typography component="li" variant="body1">
                            AtomicFetch for data fetching
                        </Typography>
                        <Typography component="li" variant="body1">
                            JSON Server for mock API
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Use the sidebar to navigate to User Manager and Product Manager.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
