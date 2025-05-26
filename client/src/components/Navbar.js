import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosConfig'
import toast from 'react-hot-toast'

const Navbar = () => {
    const navigate = useNavigate()
    const loggedIn = localStorage.getItem("authToken");

    const handlelogout = async () => {
        try {
            await axiosInstance.post('/api/v1/auth/logout')
            localStorage.removeItem('authToken')
            toast.success('Logged out successfully')
            navigate('/login')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Box
            width="100%"
            height="70px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px="6%"
            bgcolor="#1e1e1e"
            color="white"
            sx={{ boxShadow: 2 }}
        >
            <Typography variant="h5" fontWeight="bold">
                Movie Persona ChatBot Powered by GenAI
            </Typography>

            <Box>
                {loggedIn ? (
                    <Button onClick={handlelogout} sx={{ color: 'white' }}>Log Out</Button>
                ) : (
                    <>
                        <Button component={Link} to="/register" sx={{ color: 'white' }}>Sign Up</Button>
                        <Button component={Link} to="/login" sx={{ color: 'white' }}>Sign In</Button>
                    </>
                )}
            </Box>
        </Box>
    )
}

export default Navbar
