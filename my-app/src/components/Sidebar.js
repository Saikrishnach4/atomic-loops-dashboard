import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

export default function Sidebar({ mobileOpen, onClose }) {
    const location = useLocation();
    const Navigate = useNavigate();
    const theme = useTheme();
    const isDesktop = useMediaQuery('(min-width:1200px)');

    const drawerContent = (
        <>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography style={{ cursor: "pointer" }} onClick={() => Navigate("/")} variant="h6" component="div">
                    Admin Panel
                </Typography>
            </Box>
            <List>
                <ListItem
                    button
                    component={Link}
                    to="/"
                    sx={{
                        backgroundColor: location.pathname === '/' ? '#e3f2fd' : 'transparent',
                        color: location.pathname === '/' ? '#1976d2' : 'inherit',
                        fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                        '&:hover': {
                            backgroundColor: location.pathname === '/' ? '#bbdefb' : '#f5f5f5',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease-in-out',
                            color: 'black'
                        },
                        transition: 'all 0.2s ease-in-out',
                        borderLeft: location.pathname === '/' ? '4px solid #1976d2' : '4px solid transparent'
                    }}
                >
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/user-manager"
                    sx={{
                        backgroundColor: location.pathname === '/user-manager' ? '#e3f2fd' : 'transparent',
                        color: location.pathname === '/user-manager' ? '#1976d2' : 'inherit',
                        fontWeight: location.pathname === '/user-manager' ? 'bold' : 'normal',
                        '&:hover': {
                            backgroundColor: location.pathname === '/user-manager' ? '#bbdefb' : '#f5f5f5',
                            transform: 'translateX(4px)',
                            color: 'black',
                            transition: 'all 0.2s ease-in-out'
                        },
                        transition: 'all 0.2s ease-in-out',
                        borderLeft: location.pathname === '/user-manager' ? '4px solid #1976d2' : '4px solid transparent'
                    }}
                >
                    <ListItemText primary="User Manager" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/product-manager"
                    sx={{
                        backgroundColor: location.pathname === '/product-manager' ? '#e3f2fd' : 'transparent',
                        color: location.pathname === '/product-manager' ? '#1976d2' : 'inherit',
                        fontWeight: location.pathname === '/product-manager' ? 'bold' : 'normal',
                        '&:hover': {
                            backgroundColor: location.pathname === '/product-manager' ? '#bbdefb' : '#f5f5f5',
                            transform: 'translateX(4px)',
                            color: 'black',
                            transition: 'all 0.2s ease-in-out'
                        },
                        transition: 'all 0.2s ease-in-out',
                        borderLeft: location.pathname === '/product-manager' ? '4px solid #1976d2' : '4px solid transparent'
                    }}
                >
                    <ListItemText primary="Product Manager" />
                </ListItem>
            </List>
        </>
    );



    if (isDesktop) {
        return (
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        );
    }

    return (
        <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={onClose}
            ModalProps={{
                keepMounted: true,
                BackdropProps: { sx: { backgroundColor: 'transparent' } }
            }}
            transitionDuration={{ enter: 250, exit: 200 }}
            sx={{
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)', // translucent white
                    boxShadow: 'none',
                    backdropFilter: 'blur(10px)',    // add blur effect here
                    WebkitBackdropFilter: 'blur(10px)', // for Safari support
                    borderRadius: 2, // optional, for nicer edges
                    border: '1px solid rgba(255, 255, 255, 0.2)', // optional subtle border
                }
            }}
        >
            {drawerContent}
        </Drawer>

    );
}
