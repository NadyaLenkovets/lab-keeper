import { Box, Container } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { SiteHeader } from './site-header'

export function PageLayout() {
  return (
    <Box minW="1280px" minH="100vh" bg="bg.canvas" className="print-root">
      <Box className="no-print">
        <SiteHeader />
      </Box>
      <Container maxW="1200px" px={8} py={10} className="print-root">
        <Outlet />
      </Container>
    </Box>
  )
}
