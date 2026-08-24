// app/properties/[id]/page.js

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropertyCard from '@/components/PropertyCard';
import { getPropertyById, getSimilarProperties } from '@/lib/api-service';

export default function PropertyDetailPage() {
  const params = useParams();
  const theme = useTheme();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Fetch property data
  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch from API
        const propertyData = await getPropertyById(params.id);
        if (!propertyData) {
          throw new Error('Property not found');
        }
        setProperty(propertyData);

        // Get similar properties
        const similar = await getSimilarProperties(params.id);
        setSimilarProperties(similar || []);
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setError(err.message || 'Failed to load property details.');
        setProperty(null);
        setSimilarProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [params.id]);

  // Debug: log property data to check available fields
  useEffect(() => {
    if (property) {
      console.log('=== PROPERTY DETAIL DEBUG ===');
      console.log('Property data:', property);
      console.log('Available fields:', Object.keys(property));
      console.log('============================');
    }
  }, [property]);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? '#F5B70C' : '#1A4C9E' }} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading property details...
        </Typography>
      </Container>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Property not found'}
        </Alert>
        <Button component={Link} href="/" variant="contained">
          Back to Properties
        </Button>
      </Container>
    );
  }

  const handlePrevImage = () => {
    const allImages = [...(property.property_interior_images || []), ...(property.property_exterior_images || [])];
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    const allImages = [...(property.property_interior_images || []), ...(property.property_exterior_images || [])];
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitContact = () => {
    console.log('[v0] Contact form submitted:', contactForm);
    // TODO: Implement actual contact form submission via API
    setContactDialogOpen(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
    alert('Thank you for your interest! The manager will contact you soon.');
  };

  const formatPrice = (price) => {
    // Handle different price formats from API
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return '₦0';

    if (numericPrice >= 1000000000) {
      return `₦${(numericPrice / 1000000000).toFixed(1)}B`;
    }
    return `₦${(numericPrice / 1000000).toFixed(0)}M`;
  };

  const formatPropertyType = (propertyType) => {
    // Convert property_type to display format
    if (!propertyType) return 'Property';
    return propertyType.charAt(0).toUpperCase() + propertyType.slice(1).toLowerCase();
  };

  const getAllImages = () => {
    const interiorImages = property.property_interior_images || [];
    const exteriorImages = property.property_exterior_images || [];
    return [...interiorImages, ...exteriorImages];
  };

  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
  };

  // Render the rest of the component as before...
  // (The rest of the component remains largely the same, using the `property` state)
  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBackIcon />}
          sx={{ 
            mb: 3,
            color: theme.palette.text.primary,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          Back to Properties
        </Button>

        <Grid container spacing={4}>
          {/* Image Gallery */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                height: 500,
                borderRadius: 2,
                mb: 3,
              }}
            >
              {getAllImages().length > 0 ? (
                <img
                  src={getAllImages()[currentImageIndex]}
                  alt={property.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={handleImageError}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#1a1f2e' : '#f0f2f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #1a1f2e 0%, #252b3d 100%)' 
                      : 'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)',
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '1.2rem' }}>
                    No Images Available
                  </Typography>
                </Box>
              )}

              {/* Navigation */}
              {getAllImages().length > 1 && getAllImages()[currentImageIndex] && (
                <>
                  <Button
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                      color: theme.palette.text.primary,
                      minWidth: 40,
                      '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : '#fff' },
                    }}
                  >
                    {'<'}
                  </Button>
                  <Button
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                      color: theme.palette.text.primary,
                      minWidth: 40,
                      '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : '#fff' },
                    }}
                  >
                    {'>'}
                  </Button>

                  {/* Image Indicators */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    {getAllImages().map((_, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            idx === currentImageIndex
                              ? (theme.palette.mode === 'dark' ? '#F5B70C' : '#1A4C9E')
                              : 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>

            {/* Thumbnail Gallery */}
            {getAllImages().length > 1 && (
              <Grid container spacing={1}>
                {getAllImages().map((img, idx) => (
                  <Grid size={3} key={idx}>
                    <Box
                      onClick={() => setCurrentImageIndex(idx)}
                      sx={{
                        width: '100%',
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border:
                          idx === currentImageIndex
                            ? `3px solid ${theme.palette.mode === 'dark' ? '#F5B70C' : '#1A4C9E'}`
                            : `2px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s',
                      }}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={handleImageError}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Details Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={formatPropertyType(property.property_type)}
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(26, 33, 62, 0.8)' : '#16213E',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={property.property_status === 'rent' ? 'For Rent' : 'For Sale'}
                  sx={{
                    backgroundColor: property.property_status === 'rent' ? '#2e7d32' : '#1565c0',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
                {property.occupancy_status === 'available' && (
                  <Chip
                    label="Available"
                    sx={{
                      backgroundColor: '#2e7d32',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: theme.palette.text.primary }}>
                {property.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mb: 2, textTransform: 'uppercase' }}
              >
                {[property.address, property.city, property.state, property.country].filter(Boolean).join(', ')}
              </Typography>
              {property.zip_code && (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                  {property.zip_code}
                </Typography>
              )}
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 800 }}>
                {formatPrice(property.price)}
                {property.property_status === 'rent' && (
                  <Typography component="span" variant="body1" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                    {property.payment_frequency === 'yearly' ? '/year' : '/month'}
                  </Typography>
                )}
              </Typography>
            </Box>

            {/* Key Stats */}
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                p: 3,
                borderRadius: 2,
                mb: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.mode === 'dark' ? '#F5B70C' : '#1A4C9E' }}>
                      {property.bedrooms || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                      Bedrooms
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.mode === 'dark' ? '#F5B70C' : '#1A4C9E' }}>
                      {property.bathrooms || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                      Bathrooms
                    </Typography>
                  </Box>
                </Grid>

              </Grid>
            </Box>

            {/* Contact Button */}
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                p: 3,
                borderRadius: 2,
                mb: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={() => setContactDialogOpen(true)}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 183, 12, 0.15)' : '#1A4C9E',
                  color: theme.palette.mode === 'dark' ? '#F5B70C' : '#fff',
                  fontWeight: 700,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(245, 183, 12, 0.3)' : 'none',
                  '&:hover': { 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 183, 12, 0.25)' : '#143B7A',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(245, 183, 12, 0.5)' : 'none',
                  },
                }}
              >
                Contact About This Property
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Description */}
        <Box sx={{ backgroundColor: theme.palette.background.paper, p: 4, borderRadius: 2, my: 4, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
            About This Property
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.8, mb: 3 }}>
            {property.description}
          </Typography>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.features.map((feature, idx) => (
                  <Chip
                    key={idx}
                    label={feature}
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f5f5f5',
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary,
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
              Similar Properties
            </Typography>
            <Grid container spacing={3}>
              {similarProperties.map((prop) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={prop.id || prop.name}>
                  <PropertyCard property={prop} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Contact Dialog */}
      <Dialog 
        open={contactDialogOpen} 
        onClose={() => setContactDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>Contact About This Property</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Your Name"
            name="name"
            value={contactForm.name}
            onChange={handleContactChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={contactForm.email}
            onChange={handleContactChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={contactForm.phone}
            onChange={handleContactChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Message"
            name="message"
            multiline
            rows={4}
            value={contactForm.message}
            onChange={handleContactChange}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setContactDialogOpen(false)}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitContact}
            variant="contained"
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 183, 12, 0.15)' : '#1A4C9E',
              color: theme.palette.mode === 'dark' ? '#F5B70C' : '#fff',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(245, 183, 12, 0.3)' : 'none',
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}