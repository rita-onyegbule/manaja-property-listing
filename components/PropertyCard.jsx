'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined';
import BathtubOutlinedIcon from '@mui/icons-material/BathtubOutlined';
import SquareFootOutlinedIcon from '@mui/icons-material/SquareFootOutlined';

function formatFullPrice(price, propertyStatus) {
  if (propertyStatus === 'rent') {
    return `₦${Number(price).toLocaleString('en-NG')}/month`;
  }
  return `₦${Number(price).toLocaleString('en-NG')}`;
}

function formatPropertyType(propertyType) {
  // Convert property_type to display format
  if (!propertyType) return 'Property';
  return propertyType.charAt(0).toUpperCase() + propertyType.slice(1).toLowerCase();
}

export default function PropertyCard({ property }) {
  const theme = useTheme();
  const [liked, setLiked] = useState(false);

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => !prev);
  };

  return (
    <Box
      component={Link}
      href={`/properties/${property.name}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(16, 23, 41, 0.08)',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' ? '0 24px 48px rgba(0, 0, 0, 0.5)' : '0 24px 48px rgba(16, 23, 41, 0.16)',
          transform: 'translateY(-6px)',
          borderColor: '#1A4C9E',
          '& .card-image': { transform: 'scale(1.08)' },
        },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 200, sm: 240 } }}>
        {property.property_interior_images?.[0] || property.property_exterior_images?.[0] ? (
          <Box
            component="img"
            src={property.property_interior_images?.[0] || property.property_exterior_images?.[0]}
            alt={property.name}
            className="card-image"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: theme.palette.mode === 'dark' ? '#161B22' : '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #161B22 0%, #0D1117 100%)' 
                : 'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)',
            }}
          >
            <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.9rem' }}>
              No Image Available
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            px: 2,
            py: 0.5,
            borderRadius: '8px',
            backgroundColor: 'rgba(26, 76, 158, 0.9)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {property.property_status === 'sale' ? 'For Sale' : 'For Rent'}
        </Box>
        <IconButton
          onClick={toggleLike}
          aria-label={liked ? 'Remove from saved' : 'Save property'}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            '&:hover': { 
              backgroundColor: '#fff',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
          size="small"
        >
          {liked ? (
            <FavoriteIcon sx={{ color: '#E53935', fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: '#16213E', fontSize: 20 }} />
          )}
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' }, fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {formatFullPrice(property.price, property.property_status)}
        </Typography>

        <Typography
          sx={{
            color: '#1A4C9E',
            fontWeight: 700,
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            mt: 0.75,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          {formatPropertyType(property.property_type)} • {property.property_status === 'sale' ? 'Sale' : 'Rent'}
        </Typography>

        <Typography
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 700,
            fontSize: { xs: '0.95rem', sm: '1.05rem' },
            mt: 0.75,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {property.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: theme.palette.text.secondary }}>
          <LocationOnIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#1A4C9E' }} />
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.87rem' }, fontWeight: 500 }} noWrap>
            {[property.address, property.city, property.state].filter(Boolean).join(', ') || 'Location not specified'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2.5 },
            mt: 'auto',
            pt: { xs: 1.5, sm: 1.75 },
            borderTop: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.secondary,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <KingBedOutlinedIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: theme.palette.text.secondary }} />
            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' }, fontWeight: 600 }}>{property.bedrooms || 0} Beds</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <BathtubOutlinedIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: theme.palette.text.secondary }} />
            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' }, fontWeight: 600 }}>{property.bathrooms || 0} Baths</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
