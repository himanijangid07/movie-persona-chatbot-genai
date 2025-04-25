import React from 'react'
import {Box, Typography, useTheme} from '@mui/material'
import { Link } from 'react-router-dom'

const Navbar = () => {
    const theme = useTheme()
    return (
        <Box width={"100%"} backgroundColor={theme.palette.background.alt} p="1rem 6%" textAlign={'center'} sx={{boxShadow: 3, mb:2}}>
            <Typography variant='h1' color={"primary"} fontWeight="bold">
                Movie ChatBot By GenAI
            </Typography>
            <Link to="/register" p={1}>Sign Up</Link>
            <Link to="/login" p={1}>Sign In</Link>
        </Box>
    )
}

export default Navbar
